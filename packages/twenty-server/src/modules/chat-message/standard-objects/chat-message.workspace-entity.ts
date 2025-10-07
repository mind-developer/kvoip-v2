/* @kvoip-woulz proprietary */
import { msg } from '@lingui/core/macro';
import { ObjectType, registerEnumType } from '@nestjs/graphql';
import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ClientChatWorkspaceEntity } from 'src/modules/chat/standard-objects/chat.workspace-entity';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

export enum ClientChatMessageTypeEnum {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
  LOCATION = 'LOCATION',
  CONTACT = 'CONTACT',
  STICKER = 'STICKER',
}

const ClientChatMessageTypeOptions: FieldMetadataComplexOption[] = [
  {
    value: ClientChatMessageTypeEnum.TEXT,
    label: 'Text',
    position: 0,
    color: 'blue',
  },
  {
    value: ClientChatMessageTypeEnum.IMAGE,
    label: 'Image',
    position: 1,
    color: 'green',
  },
  {
    value: ClientChatMessageTypeEnum.VIDEO,
    label: 'Video',
    position: 2,
    color: 'purple',
  },
  {
    value: ClientChatMessageTypeEnum.AUDIO,
    label: 'Audio',
    position: 3,
    color: 'orange',
  },
  {
    value: ClientChatMessageTypeEnum.DOCUMENT,
    label: 'Document',
    position: 4,
    color: 'yellow',
  },
  {
    value: ClientChatMessageTypeEnum.LOCATION,
    label: 'Location',
    position: 5,
    color: 'red',
  },
  {
    value: ClientChatMessageTypeEnum.CONTACT,
    label: 'Contact',
    position: 6,
    color: 'turquoise',
  },
  {
    value: ClientChatMessageTypeEnum.STICKER,
    label: 'Sticker',
    position: 7,
    color: 'pink',
  },
];

registerEnumType(ClientChatMessageTypeEnum, {
  name: 'ClientChatMessageType',
  description: 'Chat message type options',
});

export enum ClientChatMessageDeliveryStatusEnum {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  PLAYED = 'PLAYED',
}

const ClientChatMessageDeliveryStatusOptions: FieldMetadataComplexOption[] = [
  {
    value: ClientChatMessageDeliveryStatusEnum.PENDING,
    label: 'Pending',
    position: 0,
    color: 'yellow',
  },
  {
    value: ClientChatMessageDeliveryStatusEnum.SENT,
    label: 'Sent',
    position: 1,
    color: 'blue',
  },
  {
    value: ClientChatMessageDeliveryStatusEnum.DELIVERED,
    label: 'Delivered',
    position: 2,
    color: 'green',
  },
  {
    value: ClientChatMessageDeliveryStatusEnum.READ,
    label: 'Read',
    position: 3,
    color: 'turquoise',
  },
  {
    value: ClientChatMessageDeliveryStatusEnum.FAILED,
    label: 'Failed',
    position: 4,
    color: 'red',
  },
  {
    value: ClientChatMessageDeliveryStatusEnum.PLAYED,
    label: 'Played',
    position: 5,
    color: 'purple',
  },
];

registerEnumType(ClientChatMessageDeliveryStatusEnum, {
  name: 'ClientChatMessageDeliveryStatus',
  description: 'Chat message delivery status options',
});

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.clientChatMessage,
  namePlural: 'chatMessages',
  labelSingular: msg`Chat Message`,
  labelPlural: msg`Chat Messages`,
  description: msg`A message in a chat`,
})
@ObjectType()
export class ClientChatMessageWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.providerMessageId,
    type: FieldMetadataType.TEXT,
    label: msg`Provider Message Id`,
    description: msg`The provider message id of the chat message`,
  })
  providerMessageId: string;

  @WorkspaceRelation({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.chat,
    type: RelationType.MANY_TO_ONE,
    label: msg`Chat`,
    inverseSideTarget: () => ClientChatWorkspaceEntity,
    inverseSideFieldKey: 'chatMessages',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  chat: Relation<ClientChatWorkspaceEntity>;

  @WorkspaceJoinColumn('chat')
  chatId: string;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.type,
    type: FieldMetadataType.SELECT,
    label: msg`Type`,
    description: msg`The type of the chat message`,
    options: ClientChatMessageTypeOptions,
  })
  type: ClientChatMessageTypeEnum;

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
    type: FieldMetadataType.SELECT,
    label: msg`Delivery Status`,
    description: msg`The delivery status of the chat message`,
    options: ClientChatMessageDeliveryStatusOptions,
  })
  deliveryStatus: ClientChatMessageDeliveryStatusEnum | null;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.edited,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Edited`,
    description: msg`Whether the chat message has been edited`,
  })
  @WorkspaceIsNullable()
  edited: boolean | null;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.from,
    type: FieldMetadataType.TEXT,
    label: msg`From`,
    description: msg`The from of the chat message`,
  })
  from: string;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.to,
    type: FieldMetadataType.TEXT,
    label: msg`To`,
    description: msg`The to of the chat message`,
  })
  to: string;

  @WorkspaceField({
    standardId: CLIENT_CHAT_MESSAGE_STANDARD_FIELD_IDS.attachmentUrl,
    type: FieldMetadataType.TEXT,
    label: msg`Attachment Url`,
    description: msg`The attachment url of the chat message`,
  })
  @WorkspaceIsNullable()
  attachmentUrl: string | null;
}
