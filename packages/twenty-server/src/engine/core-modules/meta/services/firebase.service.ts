import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  collection,
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from 'firebase/firestore';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { GoogleStorageService } from 'src/engine/core-modules/google-cloud/google-storage.service';
import { statusEnum } from 'src/engine/core-modules/meta/types/statusEnum';
import { WhatsappIntegration } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.entity';
import { WhatsAppDocument } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappDocument';
import { createRelatedPerson } from 'src/engine/core-modules/meta/whatsapp/utils/createRelatedPerson';
import { Sector } from 'src/engine/core-modules/sector/sector.entity';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceAgent } from 'src/engine/core-modules/workspace-agent/workspace-agent.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { Repository } from 'typeorm';

@Injectable()
export class FirebaseService {
  private app: FirebaseApp;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(WhatsappIntegration, 'core')
    private whatsappIntegrationRepository: Repository<WhatsappIntegration>,
    public readonly googleStorageService: GoogleStorageService,
    @InjectRepository(Sector, 'core')
    private sectorRepository: Repository<Sector>,
    @InjectRepository(WorkspaceAgent, 'core')
    private agentRepository: Repository<WorkspaceAgent>,
    private readonly chatMessageManagerService: ChatMessageManagerService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    this.app = initializeApp({
      apiKey: this.twentyConfigService.get('FIREBASE_API_KEY'),
      authDomain: this.twentyConfigService.get('FIREBASE_AUTH_DOMAIN'),
      projectId: this.twentyConfigService.get('FIREBASE_PROJECT_ID'),
      storageBucket: this.twentyConfigService.get('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: this.twentyConfigService.get(
        'FIREBASE_MESSAGING_SENDER_ID',
      ),
      appId: this.twentyConfigService.get('FIREBASE_APP_ID'),
    });
  }

  getFirestoreDb() {
    return getFirestore(this.app);
  }

  async saveWhatsAppMessage(
    whatsAppDoc: Omit<
      WhatsAppDocument,
      'personId' | 'timeline' | 'unreadMessages' | 'isVisible'
    >,
    isReceiving: boolean,
    workspaceId: string,
  ) {
    const messagesCollection = collection(this.getFirestoreDb(), 'whatsapp');
    const docId = `${whatsAppDoc.integrationId}_${whatsAppDoc.client.phone}`;
    const docRef = doc(messagesCollection, docId);
    const docSnapshot = await getDoc(docRef);
    const personRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<PersonWorkspaceEntity>(
        workspaceId,
        'person',
        { shouldBypassPermissionChecks: true },
      );
    let relatedPerson = await personRepository.findOneBy({
      phones: { primaryPhoneNumber: whatsAppDoc.client.phone },
    });
    if (!relatedPerson)
      relatedPerson = await personRepository.save(
        createRelatedPerson(whatsAppDoc),
      );

    // baileys edge case
    // client.name will be empty under these circumstances (first message, initiated by user)
    // so we use the phone number
    if (!docSnapshot.exists() && whatsAppDoc.lastMessage.fromMe)
      whatsAppDoc.client.name = whatsAppDoc.client.phone;

    if (!docSnapshot.exists()) {
      const newDoc = {
        ...whatsAppDoc,
        timeline: [],
        agent: 'empty',
        sector: 'empty',
        unreadMessages: isReceiving ? 1 : 0,
        isVisible: true,
        personId: relatedPerson.id,
        client: {
          name:
            whatsAppDoc.client.name ??
            relatedPerson.name?.firstName + ' ' + relatedPerson.name?.lastName,
          phone: whatsAppDoc.client.phone,
          ppUrl: whatsAppDoc.client.ppUrl ?? relatedPerson.avatarUrl ?? null,
          email: relatedPerson.emails.primaryEmail ?? null,
        },
      };
      await setDoc(docRef, newDoc);
      if (isReceiving) {
        const whatsappIntegrationWithWorkspace =
          await this.whatsappIntegrationRepository.findOne({
            relations: ['workspace'],
            where: {
              id: whatsAppDoc.integrationId,
            },
          });

        const sectorsFromWorkspace = await this.sectorRepository.find({
          relations: ['agents'],
          where: {
            workspace: {
              id: whatsappIntegrationWithWorkspace?.workspace.id,
            },
          },
        });

        if (!sectorsFromWorkspace) {
          return newDoc;
        }

        await this.chatMessageManagerService.sendMessageNotification(
          sectorsFromWorkspace.flatMap((sector) =>
            sector.agents.map((agent) => agent.memberId),
          ),
          `${whatsAppDoc.client.name}: ${whatsAppDoc.messages[0].message}`,
        );
      }
      return newDoc;
    }

    const whatsAppIntegration = docSnapshot.data() as WhatsAppDocument;

    if (whatsAppIntegration.status === statusEnum.Resolved) {
      whatsAppIntegration.status = statusEnum.Waiting;
      whatsAppIntegration.agent = 'empty';
      whatsAppIntegration.sector = 'empty';
      whatsAppIntegration.isVisible = true;
    }
    whatsAppIntegration.personId = relatedPerson.id;
    whatsAppIntegration.client.email =
      relatedPerson.emails.primaryEmail ?? null;
    whatsAppIntegration.messages.push({ ...whatsAppDoc.messages[0] });
    whatsAppIntegration.lastMessage = { ...whatsAppDoc.lastMessage };
    whatsAppIntegration.unreadMessages = isReceiving
      ? whatsAppIntegration.unreadMessages + 1
      : 0;
    whatsAppIntegration.client.ppUrl =
      (relatedPerson?.avatarUrl || whatsAppDoc.client.ppUrl) ?? null;
    whatsAppIntegration.client.name =
      relatedPerson.name?.firstName + ' ' + relatedPerson.name?.lastName;

    await setDoc(docRef, whatsAppIntegration);

    if (isReceiving) {
      if (whatsAppIntegration.agent != 'empty') {
        const agent = await this.agentRepository.findOne({
          where: { id: whatsAppIntegration.agent },
        });

        if (!agent) {
          return whatsAppIntegration;
        }

        await this.chatMessageManagerService.sendMessageNotification(
          [agent.memberId],
          `${whatsAppIntegration.client.name}: ${whatsAppDoc.messages[0].message}`,
        );
      }

      if (whatsAppIntegration.sector != 'empty') {
        const sector = await this.sectorRepository.findOne({
          relations: ['workspace', 'agents'],
          where: {
            id: whatsAppIntegration.sector,
          },
        });

        if (!sector) {
          return whatsAppIntegration;
        }

        await this.chatMessageManagerService.sendMessageNotification(
          sector.agents.map((agent) => agent.memberId),
          `${whatsAppIntegration.client.name}: ${whatsAppDoc.messages[0].message}`,
        );
      }
    }
    return whatsAppIntegration;
  }
}
