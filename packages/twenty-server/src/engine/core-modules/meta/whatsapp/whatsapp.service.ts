/* eslint-disable @typescript-eslint/no-explicit-any */
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import axios from 'axios';
import {
  collection,
  doc,
  Firestore,
  getDoc,
  getDocs,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';

import { OnDatabaseBatchEvent } from 'src/engine/api/graphql/graphql-query-runner/decorators/on-database-batch-event.decorator';
import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { SaveChatMessageJob } from 'src/engine/core-modules/chat-message-manager/jobs/chat-message-manager-save.job';
import { SaveChatMessageJobData } from 'src/engine/core-modules/chat-message-manager/types/saveChatMessageJobData';
import { SendChatMessageQueueData } from 'src/engine/core-modules/chat-message-manager/types/sendChatMessageJobData';
import { ChatbotRunnerService } from 'src/engine/core-modules/chatbot-runner/chatbot-runner.service';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { GoogleStorageService } from 'src/engine/core-modules/google-cloud/google-storage.service';
import { InternalServerError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { FirebaseService } from 'src/engine/core-modules/meta/services/firebase.service';
import { statusEnum } from 'src/engine/core-modules/meta/types/statusEnum';
import { WhatsappEmmitResolvedchatsJobProps } from 'src/engine/core-modules/meta/whatsapp/cron/jobs/whatsapp-emmit-resolved-chats.job';
import { WhatsappEmmitWaitingStatusJobProps } from 'src/engine/core-modules/meta/whatsapp/cron/jobs/whatsapp-emmit-waiting-status.job';
import { UpdateWhatsAppMessageDataInput } from 'src/engine/core-modules/meta/whatsapp/dtos/update-whatsapp-message-data-input';
import {
  IMessage,
  WhatsAppDocument,
} from 'src/engine/core-modules/meta/whatsapp/types/WhatsappDocument';
import { WhatsappTemplatesResponse } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappTemplate';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventBatch } from 'src/engine/workspace-event-emitter/types/workspace-event.type';
import {
  ChatbotStatus,
  ChatbotWorkspaceEntity,
} from 'src/modules/chatbot/standard-objects/chatbot.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { SectorWorkspaceEntity } from 'src/modules/sector/standard-objects/sector.workspace-entity';
import { WhatsappIntegrationWorkspaceEntity } from 'src/modules/whatsapp-integration/standard-objects/whatsapp-integration.workspace-entity';
import { ChatIntegrationProvider } from 'twenty-shared/types';

export class WhatsAppService {
  private META_API_URL = this.environmentService.get('META_API_URL');
  private firestoreDb: Firestore;
  protected readonly logger = new Logger(WhatsAppService.name);

  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    private readonly environmentService: TwentyConfigService,
    public readonly googleStorageService: GoogleStorageService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly firebaseService: FirebaseService,
    private readonly ChatbotRunnerService: ChatbotRunnerService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly fileService: FileService,
    @InjectMessageQueue(MessageQueue.chatMessageManagerSendMessageQueue)
    private sendMessageQueue: MessageQueueService,
    @InjectMessageQueue(MessageQueue.chatMessageManagerSaveMessageQueue)
    private saveMessageQueue: MessageQueueService,
  ) {
    this.firestoreDb = this.firebaseService.getFirestoreDb();
  }

  @OnDatabaseBatchEvent('person', DatabaseEventAction.UPDATED)
  async handlePersonUpdate(
    payload: WorkspaceEventBatch<
      ObjectRecordUpdateEvent<PersonWorkspaceEntity>
    >,
  ) {
    payload.events.forEach((event) => {
      this.updateClientAtFirebase(
        event.properties.after,
        event.objectMetadata.workspaceId,
      );
    });
  }

  async getWhatsappTemplates(
    integrationId: string,
    workspaceId: string,
  ): Promise<WhatsappTemplatesResponse> {
    if (!integrationId) {
      // eslint-disable-next-line no-console
      return { templates: [] };
    }

    const whatsappIntegrationRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappIntegrationWorkspaceEntity>(
        workspaceId,
        'whatsapp',
      );

    const integration = await whatsappIntegrationRepository.findOne({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new InternalServerError('Whatsapp integration not found');
    }

    const url = `${this.META_API_URL}/${integration?.businessAccountId}/message_templates`;

    const headers = {
      Authorization: `Bearer ${integration.accessToken}`,
      'Content-Type': 'application/json',
    };

    let allTemplates = [];

    try {
      const response = await axios.get(url, { headers });

      const { data } = response.data;

      allTemplates = data.filter(
        (template: any) => template.status === 'APPROVED',
      );

      return { templates: allTemplates };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to get Business ID ${integration?.businessAccountId} templates`,
        error.message,
      );
    }
  }

  async updateMessageAtFirebase(
    updateMessageInput: UpdateWhatsAppMessageDataInput,
  ) {
    const whatsappCollection = collection(this.firestoreDb, 'whatsapp');
    const docId = `${updateMessageInput.integrationId}_${updateMessageInput.clientPhoneNumber}`;
    const docRef = doc(whatsappCollection, docId);
    const docSnapshot = await getDoc(docRef);
    const data = docSnapshot.data();

    if (data) {
      let updatedMessages = data.messages.map((message: IMessage) =>
        message.id !== updateMessageInput.id
          ? message
          : {
              ...message,
              ...updateMessageInput,
            },
      );
      await updateDoc(docRef, { messages: updatedMessages });
      return true;
    }
  }

  async updateClientAtFirebase(
    updateClientInput: PersonWorkspaceEntity,
    workspaceId: string,
  ) {
    const whatsappCollection = collection(this.firestoreDb, 'whatsapp');
    const q = query(
      whatsappCollection,
      where('personId', '==', updateClientInput.id),
    );
    const querySnapshot = await getDocs(q);
    const avatarUrl =
      this.twentyConfigService.get('SERVER_URL') +
      '/files/' +
      this.fileService.signFileUrl({
        url: updateClientInput.avatarUrl,
        workspaceId,
      });
    querySnapshot.forEach((doc) => {
      if (!updateClientInput.name) return;
      updateDoc(doc.ref, {
        client: {
          name:
            updateClientInput.name?.firstName +
            ' ' +
            updateClientInput.name?.lastName,
          phone: updateClientInput.phones?.primaryPhoneNumber,
          ppUrl: avatarUrl,
          email: updateClientInput.emails.primaryEmail,
        },
      });
    });
    return true;
  }

  async sendMessage(jobName: string, jobOptions: SendChatMessageQueueData) {
    this.sendMessageQueue.add<SendChatMessageQueueData>(jobName, jobOptions);
  }

  async saveMessage(
    whatsappDoc: Omit<
      WhatsAppDocument,
      'personId' | 'timeline' | 'unreadMessages' | 'isVisible'
    >,
    workspaceId: string,
  ) {
    this.saveMessageQueue.add<SaveChatMessageJobData>(SaveChatMessageJob.name, {
      chatType: ChatIntegrationProvider.WHATSAPP,
      saveMessageInput: {
        integrationId: whatsappDoc.integrationId,
        to: whatsappDoc.client.phone,
        ...whatsappDoc.lastMessage,
        id: whatsappDoc.lastMessage.id ?? null,
        fromMe: !!whatsappDoc.lastMessage.fromMe,
        recipientPpUrl: whatsappDoc.client.ppUrl ?? null,
      },
      workspaceId,
    });
    const whatsappIntegration = await (
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappIntegrationWorkspaceEntity>(
        workspaceId,
        'whatsapp',
        { shouldBypassPermissionChecks: true },
      )
    ).findOneBy({ id: whatsappDoc.integrationId });

    if (
      whatsappDoc?.status === statusEnum.Waiting &&
      !whatsappDoc.lastMessage.fromMe
    ) {
      const chatbot = await (
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ChatbotWorkspaceEntity>(
          workspaceId,
          'chatbot',
          { shouldBypassPermissionChecks: true },
        )
      ).findOne({
        where: {
          id: whatsappIntegration?.chatbotId ?? undefined,
          status: ChatbotStatus.ACTIVE,
        },
      });

      if (!whatsappIntegration?.chatbotId || !chatbot) return;
      const chatbotKey =
        whatsappDoc.integrationId + '_' + whatsappDoc.client.phone;
      let executor = this.ChatbotRunnerService.getExecutor(chatbotKey);
      if (executor) {
        executor.runFlow(whatsappDoc.lastMessage.message);
        return true;
      }
      const sectorsFromWorkspace = await (
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<SectorWorkspaceEntity>(
          workspaceId,
          'sector',
        )
      ).find();

      executor = this.ChatbotRunnerService.createExecutor({
        integrationId: whatsappDoc.integrationId,
        workspaceId,
        chatbotName: chatbot?.name || 'Chatbot',
        chatbot: {
          ...chatbot,
          workspace: { id: workspaceId },
        },
        sendTo: whatsappDoc.client.phone ?? '',
        sectors: sectorsFromWorkspace,
        onFinish: (_, sectorId: string) => {
          if (sectorId) {
            console.log('transfer to sector:', sectorId);
            // transferBotService(
            //   whatsappIntegration.integrationId,
            //   whatsappIntegration.client.name ?? '',
            //   statusEnum.Waiting,
            //   sendWhatsappEventMessage,
            //   sectorId,
            //   sectorsFromWorkspace,
            //   chatbot.name,
            // );
          }
          this.ChatbotRunnerService.clearExecutor(chatbotKey);
        },
      });
      executor.runFlow(whatsappDoc.lastMessage.message);
    }
  }

  async sendNotification(externalIds: string[], message: string) {
    const ONESIGNAL_APPID = this.environmentService.get('ONESIGNAL_APP_ID');
    const ONESIGNAL_REST_API_KEY = this.environmentService.get(
      'ONESIGNAL_REST_API_KEY',
    );

    const headers = {
      Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
      'Content-Type': 'application/json',
      accept: 'application/json',
    };

    try {
      const body = {
        app_id: ONESIGNAL_APPID,
        include_aliases: {
          external_id: [externalIds],
        },
        target_channel: 'push',
        isAnyWeb: true,
        headings: { en: message },
        contents: { en: message },
      };

      const response = await axios.post(
        'https://onesignal.com/api/v1/notifications',
        body,
        {
          headers,
        },
      );

      return true;
    } catch (error) {
      this.logger.error(
        'Notification error:',
        error.response?.data || error.message,
      );

      return false;
    }
  }

  async saveEventMessageAtFirebase(
    whatsappDoc: Omit<
      WhatsAppDocument,
      'unreadMessages' | 'lastMessage' | 'isVisible'
    >,
  ) {
    const messagesCollection = collection(this.firestoreDb, 'whatsapp');
    const docId = `${whatsappDoc.integrationId}_${whatsappDoc.client.phone}`;
    const docRef = doc(messagesCollection, docId);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      console.warn(
        'saveEventMessageAtFirebase: documento não encontrado no Firestore para iniciar atendimento. Payload:',
        JSON.stringify(whatsappDoc, null, 2),
      );

      return false;
    }
    const whatsappIntegration = docSnapshot.data() as WhatsAppDocument;

    // Se não houver messages, apenas atualiza status, agent, sector e timeline

    if (
      !whatsappDoc.messages ||
      !Array.isArray(whatsappDoc.messages) ||
      !whatsappDoc.messages[0]
    ) {
      whatsappIntegration.status = whatsappDoc.status || statusEnum.InProgress;

      if (whatsappDoc.agent) whatsappIntegration.agent = whatsappDoc.agent;
      if (whatsappDoc.sector) whatsappIntegration.sector = whatsappDoc.sector;

      if (
        whatsappDoc.timeline &&
        Array.isArray(whatsappDoc.timeline) &&
        whatsappDoc.timeline[0]
      ) {
        whatsappIntegration.timeline = whatsappIntegration.timeline || [];
        whatsappIntegration.timeline.push({ ...whatsappDoc.timeline[0] });
      }
      await setDoc(docRef, whatsappIntegration);

      return true;
    }

    // Fluxo normal se houver messages
    whatsappIntegration.messages.push({ ...whatsappDoc.messages[0] });
    whatsappIntegration.timeline.push({ ...whatsappDoc.timeline[0] });
    whatsappIntegration.status = whatsappDoc.status;
    whatsappIntegration.agent = whatsappDoc.agent;
    whatsappIntegration.sector = whatsappDoc.sector;

    await setDoc(docRef, whatsappIntegration);

    return true;
  }

  async downloadMedia(
    mediaId: string,
    integrationId: string,
    phoneNumber: string,
    type: string,
    workspaceId: string,
  ) {
    const whatsappRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappIntegrationWorkspaceEntity>(
        workspaceId,
        'whatsapp',
      );

    const integration = await whatsappRepository.findOne({
      where: { id: integrationId },
    });

    if (!integration) {
      // eslint-disable-next-line no-console
      console.error('Integration not found for integrationId:', integrationId);

      return;
    }

    const url = `${this.META_API_URL}/${mediaId}`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${integration?.accessToken}`,
        },
      });

      const data = response.data;

      if (!data) {
        throw new Error('Media URL not found.');
      }

      data.url = data.url.replace(/\\/g, '');
      data.mime_type = data.mime_type.replace(/\\/g, '');

      const mediaResponse = await axios.get(data.url, {
        headers: {
          Authorization: `Bearer ${integration?.accessToken}`,
        },
        responseType: 'arraybuffer',
      });

      const mediaBuffer = Buffer.from(mediaResponse.data, 'binary');

      const file: { originalname: string; buffer: Buffer; mimetype: string } = {
        originalname: `${phoneNumber}_${v4()}`,
        buffer: mediaBuffer,
        mimetype: data.mime_type,
      };

      const fileUrl = await this.googleStorageService.uploadFileToBucket(
        workspaceId,
        type,
        file,
        false,
      );

      return fileUrl;
    } catch (error) {
      const err = `Error downloading media: ${error.message}`;

      throw new Error(err);
    }
  }

  async getWorkspaceWhatsappChatsMapToReassign() {
    this.logger.log(`Mapping whatsapp chats with SLA violation`);

    const now = new Date();
    let whatsappChatsMap: Record<string, WhatsAppDocument[]> = {};

    const snapshot = await getDocs(
      query(
        collection(this.firestoreDb, 'whatsapp'),
        where('status', '==', statusEnum.InProgress),
      ),
    );

    const docs = snapshot.docs;

    for (const docSnapshot of docs) {
      const waDoc = docSnapshot.data() as WhatsAppDocument;

      const workspaceExists = await this.workspaceRepository.findOne({
        where: {
          id: waDoc.workspaceId,
        },
      });

      if (!workspaceExists) return;

      const clientName = waDoc.client.name;
      const docId = docSnapshot.id;

      if (waDoc.lastMessage.from !== clientName || !waDoc.workspaceId) return;

      const waCreatedAt = waDoc.lastMessage.createdAt;

      if (waCreatedAt instanceof Timestamp) {
        const createdAtDate = waCreatedAt.toDate().getTime();
        const timeDifference = (now.getTime() - createdAtDate) / 1000 / 60;

        if (!waDoc.workspaceId) return;

        const whatsappIntegrationRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappIntegrationWorkspaceEntity>(
            waDoc.workspaceId,
            'whatsapp',
          );

        const integration = await whatsappIntegrationRepository.findOne({
          where: { id: waDoc.integrationId },
        });

        if (!integration) {
          console.error(
            'Integration not found for integrationId:',
            waDoc.integrationId,
          );

          return;
        }

        if (
          timeDifference >= integration.sla &&
          waDoc.agent !== 'empty' &&
          waDoc.status !== statusEnum.Resolved
        ) {
          whatsappChatsMap = {
            ...whatsappChatsMap,
            [docId]: [
              // eslint-disable-next-line no-unsafe-optional-chaining
              ...(whatsappChatsMap?.[waDoc.integrationId] ?? []),
              waDoc,
            ],
          };
        }
      }

      return whatsappChatsMap;
    }
  }

  async handleChatsWaitingStatus(data: WhatsappEmmitWaitingStatusJobProps) {
    const docRef = doc(this.firestoreDb, 'whatsapp', data.docId);

    await setDoc(docRef, {
      ...data.waDoc,
      agent: 'empty',
      status: statusEnum.Pending,
    });
  }

  async getWorkspaceWhatsappResolvedChatsMapToReassign() {
    this.logger.log(`Mapping whatsapp resolved chats with violation`);

    let whatsappChatsMap: Record<string, WhatsAppDocument[]> = {};

    const chatsQuery = query(
      collection(this.firestoreDb, 'whatsapp'),
      where('status', '==', statusEnum.Resolved),
      where('isVisible', '==', true),
    );

    const snapshot = await getDocs(chatsQuery);
    const docs = snapshot.docs;

    for (const docSnapshot of docs) {
      const waDoc = docSnapshot.data() as WhatsAppDocument;
      const waCreatedAt = waDoc.lastMessage.createdAt;
      const docId = docSnapshot.id;

      const now = new Date();

      if (waCreatedAt instanceof Timestamp) {
        const createdAtDate = waCreatedAt.toDate().getTime();
        const timeDifference = (now.getTime() - createdAtDate) / 1000 / 60;

        if (timeDifference >= 1 && waDoc.status === statusEnum.Resolved) {
          whatsappChatsMap = {
            ...whatsappChatsMap,
            [docId]: [
              // eslint-disable-next-line no-unsafe-optional-chaining
              ...(whatsappChatsMap?.[waDoc.integrationId] ?? []),
              waDoc,
            ],
          };
        }

        return whatsappChatsMap;
      } else {
        // eslint-disable-next-line no-console
        console.error('createdAt is not a valid Timestamp');
      }
    }
  }

  async handleResolvedChatsVisibility(
    data: WhatsappEmmitResolvedchatsJobProps,
  ) {
    const docRef = doc(this.firestoreDb, 'whatsapp', data.docId);

    await setDoc(docRef, {
      ...data.waDoc,
      isVisible: false,
    });
  }
}
