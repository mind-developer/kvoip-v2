/* @kvoip-woulz proprietary */
import { msg } from '@lingui/core/macro';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ClientChatWorkspaceEntity } from 'src/modules/client-chat/standard-objects/client-chat.workspace-entity';
import {
  ChatIntegrationProvider,
  ChatMessageDeliveryStatus,
  ChatMessageFromType,
  ChatMessageToType,
  ChatMessageType,
  ClientChatMessageEvent,
  FieldMetadataType,
  Reaction,
  RelationType,
} from 'twenty-shared/types';
import { Relation } from 'typeorm';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.clientChatMessage,
  namePlural: 'clientChatMessages',
  labelSingular: msg`Client Chat Message`,
  labelPlural: msg`Client Chat Messages`,
  description: msg`A message in a chat`,
})
@WorkspaceIsSystem()
export class ClientChatMessageWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.clientChat,
    type: RelationType.MANY_TO_ONE,
    label: msg`Client Chat`,
    inverseSideTarget: () => ClientChatWorkspaceEntity,
    inverseSideFieldKey: 'clientChatMessages',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  clientChat: Relation<ClientChatWorkspaceEntity>;

  @WorkspaceJoinColumn('clientChat')
  clientChatId: string;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.from,
    type: FieldMetadataType.TEXT,
    label: msg`From`,
    description: msg`The from of the client chat message - ID of the entity based on fromType`,
  })
  from: string;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.fromType,
    type: FieldMetadataType.TEXT,
    label: msg`From Type`,
    description: msg`The from type of the client chat message`,
  })
  fromType: ChatMessageFromType;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.to,
    type: FieldMetadataType.TEXT,
    label: msg`To`,
    description: msg`The to of the client chat message`,
  })
  to: string;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.toType,
    type: FieldMetadataType.TEXT,
    label: msg`To Type`,
    description: msg`The to type of the client chat message`,
  })
  toType: ChatMessageToType;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.provider,
    type: FieldMetadataType.TEXT,
    label: msg`Provider`,
    description: msg`The provider of the client chat message`,
  })
  provider: ChatIntegrationProvider;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.providerMessageId,
    type: FieldMetadataType.TEXT,
    label: msg`Provider Message Id`,
    description: msg`The provider message id of the client chat message`,
  })
  providerMessageId: string;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.type,
    type: FieldMetadataType.TEXT,
    label: msg`Type`,
    description: msg`The type of the client chat message`,
  })
  type: ChatMessageType;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.textBody,
    type: FieldMetadataType.TEXT,
    label: msg`Text Body`,
    description: msg`The text body of the client chat message`,
  })
  @WorkspaceIsNullable()
  textBody: string | null;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.caption,
    type: FieldMetadataType.TEXT,
    label: msg`Caption`,
    description: msg`The caption of the client chat message`,
  })
  @WorkspaceIsNullable()
  caption: string | null;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.deliveryStatus,
    type: FieldMetadataType.TEXT,
    label: msg`Delivery Status`,
    description: msg`The delivery status of the client chat message`,
  })
  deliveryStatus: ChatMessageDeliveryStatus;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.edited,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Edited`,
    description: msg`Whether the chat message has been edited`,
  })
  @WorkspaceIsNullable()
  edited: boolean | null;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.attachmentUrl,
    type: FieldMetadataType.TEXT,
    label: msg`Attachment Url`,
    description: msg`The attachment url of the chat message`,
  })
  @WorkspaceIsNullable()
  attachmentUrl: string | null;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.event,
    type: FieldMetadataType.TEXT,
    label: msg`Event`,
    description: msg`The event of the chat message`,
  })
  @WorkspaceIsNullable()
  event: ClientChatMessageEvent | null;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.reactions,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Reaction`,
    description: msg`The reaction of the chat message`,
  })
  @WorkspaceIsNullable()
  reactions: Reaction[] | null;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.repliesTo,
    type: FieldMetadataType.TEXT,
    label: msg`Replies To`,
    description: msg`Id of the client chat message that this message replies to`,
  })
  @WorkspaceIsNullable()
  repliesTo: string | null;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.templateId,
    type: FieldMetadataType.TEXT,
    label: msg`Template Id`,
    description: msg`The name of the template that was used to send the message`,
  })
  @WorkspaceIsNullable()
  templateId: string | null;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.templateLanguageCode,
    type: FieldMetadataType.TEXT,
    label: msg`Template Language`,
    description: msg`The language code of the template that was used to send the message`,
  })
  @WorkspaceIsNullable()
  templateLanguage: string | null;
}
