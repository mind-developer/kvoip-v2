import { Logger } from '@nestjs/common';
import { SaveChatMessageJobData } from 'src/engine/core-modules/chat-message-manager/types/saveChatMessageJobData';
import { constructChatMessageInput } from 'src/engine/core-modules/chat-message-manager/utils/contructChatMessageInput';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { createRelatedPerson } from 'src/engine/core-modules/meta/whatsapp/utils/createRelatedPerson';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ClientChatMessageWorkspaceEntity } from 'src/modules/chat-message/standard-objects/chat-message.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import {
  ChatIntegrationProvider,
  ChatIntegrationSaveMessageInput,
} from 'twenty-shared/types';

@Processor(MessageQueue.chatMessageManagerSaveMessageQueue)
export class SaveChatMessageJob {
  protected readonly logger = new Logger(SaveChatMessageJob.name);
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @Process(SaveChatMessageJob.name)
  async handle(data: SaveChatMessageJobData): Promise<void> {
    await this[data.chatType](data);
  }

  async whatsapp(data: SaveChatMessageJobData) {
    const personRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<PersonWorkspaceEntity>(
        data.workspaceId,
        'person',
        { shouldBypassPermissionChecks: true },
      );
    let person = await personRepository.findOneBy({
      phones: { primaryPhoneNumber: data.saveMessageInput.to },
    });
    if (!person)
      //if no person associated, chat is probably being created for the first time, which is why there's no person associated yet; so message.from is user's name.
      //however, on baileys, chats can be initiated by the sender if they send a message from their phone, or
      //they can be initiated from a template on MetaAPI, so if person doesn't exist and message.fromMe is true,
      //we use the client's phone number as it's name, as we can't be sure of what their name is set to.
      person = await personRepository.save(
        createRelatedPerson(
          {
            firstName: data.saveMessageInput.fromMe
              ? data.saveMessageInput.to
              : data.saveMessageInput.from.split(' ')[0],
            lastName: data.saveMessageInput.fromMe
              ? ''
              : (data.saveMessageInput.from.split(' ')[1] ?? ''),
          },
          data.saveMessageInput.to,
          data.saveMessageInput.recipientPpUrl,
          ChatIntegrationProvider.WHATSAPP,
          'Via WhatsApp',
        ),
      );
    if (!person.id)
      throw new Error(
        'An associated person did not exist, and creating a new person for this chat failed.',
      );

    const fullName = person.name?.firstName + ' ' + person.name?.lastName;
    if (!data.saveMessageInput.id)
      throw new Error('Cannot save message without id.');
    const payloadParams: [ChatIntegrationSaveMessageInput['whatsapp'], string] =
      [data.saveMessageInput, data.saveMessageInput.id];

    switch (data.saveMessageInput.type) {
      case 'template':
        //TODO: IMPLEMENT
        // await this.firebaseService.saveWhatsAppMessage(
        //   constructWhatsAppFirebasePayload(...payloadParams),
        //   false,
        // );
        break;
      //more cases here in the future if needed
      default:
        this.logger.log(
          '(whatsapp): Saving message:',
          JSON.stringify(constructChatMessageInput(data.saveMessageInput)),
        );
        await (
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatMessageWorkspaceEntity>(
            data.workspaceId,
            'chatMessage',
          )
        ).save(constructChatMessageInput(data.saveMessageInput));
        return true;
    }
    return false;
  }
}
