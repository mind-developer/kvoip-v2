/* @kvoip-woulz proprietary */
import { msg } from '@lingui/core/macro';
import { ObjectType } from '@nestjs/graphql';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ClientChatWorkspaceEntity } from 'src/modules/client-chat/standard-objects/client-chat.workspace-entity';
import {
  ChatIntegrationProvider,
  ChatMessageDeliveryStatus,
  ChatMessageType,
  ClientChatMessageFromType,
  ClientChatMessageToType,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';
import { Relation } from 'typeorm';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.clientChatMessage,
  namePlural: 'chatMessages',
  labelSingular: msg`Chat Message`,
  labelPlural: msg`Chat Messages`,
  description: msg`A message in a chat`,
})
@ObjectType()
export class ClientChatMessageWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.clientChat,
    type: RelationType.MANY_TO_ONE,
    label: msg`Chat`,
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
    description: msg`The from of the chat message - ID of the entity based on fromType`,
  })
  from: string;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.fromType,
    type: FieldMetadataType.TEXT,
    label: msg`From Type`,
    description: msg`The from type of the chat message`,
  })
  fromType: ClientChatMessageFromType;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.to,
    type: FieldMetadataType.TEXT,
    label: msg`To`,
    description: msg`The to of the chat message`,
  })
  to: string;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.toType,
    type: FieldMetadataType.TEXT,
    label: msg`To Type`,
    description: msg`The to type of the chat message`,
  })
  toType: ClientChatMessageToType;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.provider,
    type: FieldMetadataType.TEXT,
    label: msg`Provider`,
    description: msg`The provider of the chat message`,
  })
  provider: ChatIntegrationProvider;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.providerMessageId,
    type: FieldMetadataType.TEXT,
    label: msg`Provider Message Id`,
    description: msg`The provider message id of the chat message`,
  })
  providerMessageId: string;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.type,
    type: FieldMetadataType.TEXT,
    label: msg`Type`,
    description: msg`The type of the chat message`,
  })
  type: ChatMessageType;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.textBody,
    type: FieldMetadataType.TEXT,
    label: msg`Text Body`,
    description: msg`The text body of the chat message`,
  })
  @WorkspaceIsNullable()
  textBody: string | null;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.caption,
    type: FieldMetadataType.TEXT,
    label: msg`Caption`,
    description: msg`The caption of the chat message`,
  })
  @WorkspaceIsNullable()
  caption: string | null;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.deliveryStatus,
    type: FieldMetadataType.TEXT,
    label: msg`Delivery Status`,
    description: msg`The delivery status of the chat message`,
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
}
