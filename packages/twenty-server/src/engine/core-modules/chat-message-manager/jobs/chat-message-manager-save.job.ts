import { SaveChatMessageJobData } from 'src/engine/core-modules/chat-message-manager/types/saveChatMessageJobData';
import { constructWhatsAppFirebasePayload } from 'src/engine/core-modules/chat-message-manager/utils/constructWhatsAppFirebasePayload';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { FirebaseService } from 'src/engine/core-modules/meta/services/firebase.service';
import { SendWhatsAppMessageInput } from 'src/engine/core-modules/meta/whatsapp/dtos/send-whatsapp-message.input';

@Processor(MessageQueue.chatMessageManagerSaveMessageQueue)
export class SaveChatMessageJob {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Process(SaveChatMessageJob.name)
  async handle(data: SaveChatMessageJobData): Promise<void> {
    await this[data.chatType](data);
  }

  async whatsApp(data: SaveChatMessageJobData) {
    if (!data.sendMessageInput.id)
      throw new Error('Cannot save message without id.');
    const payloadParams: [SendWhatsAppMessageInput, string] = [
      data.sendMessageInput,
      data.sendMessageInput.id,
    ];

    switch (data.sendMessageInput.type) {
      case 'template':
        await this.firebaseService.saveWhatsAppMessage(
          constructWhatsAppFirebasePayload(...payloadParams),
          false,
          data.workspaceId,
        );
        break;
      //more cases here in the future if needed
      default:
        await this.firebaseService.saveWhatsAppMessage(
          constructWhatsAppFirebasePayload(...payloadParams),
          !!!(data.sendMessageInput as SendWhatsAppMessageInput)?.fromMe,
          data.workspaceId,
        );
    }
  }
}
