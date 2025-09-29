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
    whatsAppDoc: Omit<
      WhatsAppDocument,
      'timeline' | 'unreadMessages' | 'isVisible' | 'personId'
    > & { personId: string },
  ) {
    try {
      this.logger.log(
        '(saveWhatsAppMessage): saving whatsappDoc:',
        JSON.stringify(whatsAppDoc),
      );
      const messagesCollection = collection(this.getFirestoreDb(), 'whatsapp');
      const docId = `${whatsAppDoc.integrationId}_${whatsAppDoc.client.phone}`;
      const docRef = doc(messagesCollection, docId);
      const docSnapshot = await getDoc(docRef);

      const agentRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<AgentWorkspaceEntity>(
          whatsAppDoc.workspaceId ?? '',
          'agent',
          { shouldBypassPermissionChecks: true },
        );
      const sectorRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<SectorWorkspaceEntity>(
          whatsAppDoc.workspaceId ?? '',
          'sector',
          { shouldBypassPermissionChecks: true },
        );

      // baileys edge case
      // client.name will be empty under these circumstances (first message, initiated by user)
      // so we use the phone number
      if (!docSnapshot.exists() && whatsAppDoc.lastMessage.fromMe) {
        whatsAppDoc.client.name = whatsAppDoc.client.phone;
      }

      if (!docSnapshot.exists()) {
        const newDoc: WhatsAppDocument = {
          ...whatsAppDoc,
          timeline: [],
          agent: 'empty',
          sector: 'empty',
          unreadMessages: whatsAppDoc.lastMessage.fromMe ? 1 : 0,
          isVisible: true,
          personId: whatsAppDoc.personId,
          client: {
            name: (whatsAppDoc.client.name ?? null) as string | undefined,
            ppUrl: (whatsAppDoc.client.ppUrl ?? null) as string | undefined,
            phone: (whatsAppDoc.client.phone ?? null) as string,
            email: (whatsAppDoc.client.email ?? null) as string | undefined,
          },
        };
        this.logger.log(
          '(saveWhatsAppMessage): creating new document for chat:',
          JSON.stringify(newDoc, (k, v) => (v === undefined ? null : v)),
        );
        await setDoc(docRef, newDoc);
        if (whatsAppDoc.lastMessage.fromMe) {
          const whatsappIntegrationWithWorkspace =
            this.twentyORMGlobalManager.getRepositoryForWorkspace(
              whatsAppDoc.workspaceId ?? '',
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
      whatsAppIntegration.messages.push({ ...whatsAppDoc.messages[0] });
      whatsAppIntegration.lastMessage = { ...whatsAppDoc.lastMessage };
      whatsAppIntegration.unreadMessages = whatsAppDoc.lastMessage.fromMe
        ? whatsAppIntegration.unreadMessages + 1
        : 0;
      whatsAppIntegration.personId = whatsAppDoc.personId;

      await setDoc(docRef, whatsAppIntegration);

      if (whatsAppDoc.lastMessage.fromMe) {
        if (whatsAppIntegration.agent != 'empty') {
          const agent = await agentRepository.findOneBy({
            id: whatsAppIntegration.agent,
          });

          if (!agent) {
            return whatsAppIntegration;
          }

          await this.chatMessageManagerService.sendMessageNotification(
            [agent.workspaceMember.id],
            `${whatsAppIntegration.client.name}: ${whatsAppDoc.messages[0].message}`,
          );
        }

        if (whatsAppIntegration.sector != 'empty') {
          const sector = await sectorRepository.findOneBy({
            id: whatsAppDoc.sector,
          });

          if (!sector) {
            return whatsAppIntegration;
          }

          await this.chatMessageManagerService.sendMessageNotification(
            sector.agents.map((agent) => agent.workspaceMember.id),
            `${whatsAppIntegration.client.name}: ${whatsAppDoc.messages[0].message}`,
          );
        }
      }
      return whatsAppIntegration;
    } catch (error) {
      this.logger.error(error);
    }
  }
}
