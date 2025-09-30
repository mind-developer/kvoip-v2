import { Injectable, Logger } from '@nestjs/common';

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
import { WhatsAppDocument } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappDocument';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { AgentWorkspaceEntity } from 'src/modules/agent/standard-objects/agent.workspace-entity';
import { SectorWorkspaceEntity } from 'src/modules/sector/standard-objects/sector.workspace-entity';

@Injectable()
export class FirebaseService {
  private app: FirebaseApp;
  protected readonly logger = new Logger(FirebaseService.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    public readonly googleStorageService: GoogleStorageService,
    private readonly chatMessageManagerService: ChatMessageManagerService,
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
    whatsappDoc: Omit<
      WhatsAppDocument,
      'timeline' | 'unreadMessages' | 'isVisible' | 'personId'
    > & { personId: string },
  ) {
    try {
      this.logger.log(
        '(saveWhatsAppMessage): saving whatsappDoc:',
        JSON.stringify(whatsappDoc),
      );
      const messagesCollection = collection(this.getFirestoreDb(), 'whatsapp');
      const docId = `${whatsappDoc.integrationId}_${whatsappDoc.client.phone}`;
      const docRef = doc(messagesCollection, docId);
      const docSnapshot = await getDoc(docRef);

      const agentRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<AgentWorkspaceEntity>(
          whatsappDoc.workspaceId ?? '',
          'agent',
          { shouldBypassPermissionChecks: true },
        );
      const sectorRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<SectorWorkspaceEntity>(
          whatsappDoc.workspaceId ?? '',
          'sector',
          { shouldBypassPermissionChecks: true },
        );

      // baileys edge case
      // client.name will be empty under these circumstances (first message, initiated by user)
      // so we use the phone number
      if (!docSnapshot.exists() && whatsappDoc.lastMessage.fromMe) {
        whatsappDoc.client.name = whatsappDoc.client.phone;
      }

      if (!docSnapshot.exists()) {
        const newDoc: WhatsAppDocument = {
          ...whatsappDoc,
          timeline: [],
          agent: 'empty',
          sector: 'empty',
          unreadMessages: whatsappDoc.lastMessage.fromMe ? 1 : 0,
          isVisible: true,
          personId: whatsappDoc.personId,
          client: {
            name: (whatsappDoc.client.name ?? null) as string | undefined,
            ppUrl: (whatsappDoc.client.ppUrl ?? null) as string | undefined,
            phone: (whatsappDoc.client.phone ?? null) as string,
            email: (whatsappDoc.client.email ?? null) as string | undefined,
          },
        };
        this.logger.log(
          '(saveWhatsAppMessage): creating new document for chat:',
          JSON.stringify(newDoc, (k, v) => (v === undefined ? null : v)),
        );
        await setDoc(docRef, newDoc);
        if (whatsappDoc.lastMessage.fromMe) {
          const whatsappIntegrationWithWorkspace =
            this.twentyORMGlobalManager.getRepositoryForWorkspace(
              whatsappDoc.workspaceId ?? '',
              'whatsappIntegration',
              { shouldBypassPermissionChecks: true },
            );

          if (!whatsappIntegrationWithWorkspace)
            throw new Error('Could not find WhatsApp Integration');

          if (!sectorRepository) {
            return newDoc;
          }

          const sectors = await sectorRepository.find();

          await this.chatMessageManagerService.sendMessageNotification(
            sectors.flatMap((sector) =>
              sector.agents.map((agent) => agent.workspaceMember.id),
            ),
            `${whatsappDoc.client.name}: ${whatsappDoc.messages[0].message}`,
          );
        }
        return newDoc;
      }

      const whatsappIntegration = docSnapshot.data() as WhatsAppDocument;

      if (whatsappIntegration.status === statusEnum.Resolved) {
        whatsappIntegration.status = statusEnum.Waiting;
        whatsappIntegration.agent = 'empty';
        whatsappIntegration.sector = 'empty';
        whatsappIntegration.isVisible = true;
      }
      whatsappIntegration.messages.push({ ...whatsappDoc.messages[0] });
      whatsappIntegration.lastMessage = { ...whatsappDoc.lastMessage };
      whatsappIntegration.unreadMessages = whatsappDoc.lastMessage.fromMe
        ? whatsappIntegration.unreadMessages + 1
        : 0;
      whatsappIntegration.personId = whatsappDoc.personId;

      await setDoc(docRef, whatsappIntegration);

      if (whatsappDoc.lastMessage.fromMe) {
        if (whatsappIntegration.agent != 'empty') {
          const agent = await agentRepository.findOneBy({
            id: whatsappIntegration.agent,
          });

          if (!agent) {
            return whatsappIntegration;
          }

          await this.chatMessageManagerService.sendMessageNotification(
            [agent.workspaceMember.id],
            `${whatsappIntegration.client.name}: ${whatsappDoc.messages[0].message}`,
          );
        }

        if (whatsappIntegration.sector != 'empty') {
          const sector = await sectorRepository.findOneBy({
            id: whatsappDoc.sector,
          });

          if (!sector) {
            return whatsappIntegration;
          }

          await this.chatMessageManagerService.sendMessageNotification(
            sector.agents.map((agent) => agent.workspaceMember.id),
            `${whatsappIntegration.client.name}: ${whatsappDoc.messages[0].message}`,
          );
        }
      }
      return whatsappIntegration;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
