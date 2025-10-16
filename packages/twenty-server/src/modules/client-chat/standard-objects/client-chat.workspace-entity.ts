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
import { CLIENT_CHAT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { AgentWorkspaceEntity } from 'src/modules/agent/standard-objects/agent.workspace-entity';
import { ClientChatMessageWorkspaceEntity } from 'src/modules/client-chat-message/standard-objects/client-chat-message.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { SectorWorkspaceEntity } from 'src/modules/sector/standard-objects/sector.workspace-entity';
import { WhatsappIntegrationWorkspaceEntity } from 'src/modules/whatsapp-integration/standard-objects/whatsapp-integration.workspace-entity';
import {
  ChatMessageType,
  ClientChatStatus,
  FieldMetadataType,
  RelationType,
} from 'twenty-shared/types';
import { Relation } from 'typeorm';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.clientChat,
  namePlural: 'clientChats',
  labelSingular: msg`Client Chat`,
  labelPlural: msg`Client Chats`,
  description: msg`A client chat`,
  icon: STANDARD_OBJECT_ICONS.chat,
})
@WorkspaceIsSystem()
export class ClientChatWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: CLIENT_CHAT_STANDARD_FIELD_IDS.whatsappIntegration,
    type: RelationType.MANY_TO_ONE,
    label: msg`Whatsapp Integration`,
    inverseSideTarget: () => WhatsappIntegrationWorkspaceEntity,
    inverseSideFieldKey: 'clientChats',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  whatsappIntegration: Relation<WhatsappIntegrationWorkspaceEntity> | null;

  @WorkspaceJoinColumn('whatsappIntegration')
  whatsappIntegrationId: string | null;

  @WorkspaceField({
    standardId: CLIENT_CHAT_STANDARD_FIELD_IDS.providerContactId,
    type: FieldMetadataType.TEXT,
    label: msg`Provider Contact ID`,
    description: msg`The provider contact ID of the chat. For WhatsApp, this is the phone number of the client.`,
  })
  providerContactId: string;

  @WorkspaceRelation({
    standardId: CLIENT_CHAT_STANDARD_FIELD_IDS.agent,
    type: RelationType.MANY_TO_ONE,
    label: msg`Agent`,
    inverseSideTarget: () => AgentWorkspaceEntity,
    inverseSideFieldKey: 'chats',
  })
  @WorkspaceIsNullable()
  agent: Relation<AgentWorkspaceEntity> | null;

  @WorkspaceJoinColumn('agent')
  agentId: string | null;

  @WorkspaceRelation({
    standardId: CLIENT_CHAT_STANDARD_FIELD_IDS.sector,
    type: RelationType.MANY_TO_ONE,
    label: msg`Sector`,
    inverseSideTarget: () => SectorWorkspaceEntity,
    inverseSideFieldKey: 'chats',
  })
  sector: Relation<SectorWorkspaceEntity>;

  @WorkspaceJoinColumn('sector')
  sectorId: string;

  @WorkspaceRelation({
    standardId: CLIENT_CHAT_STANDARD_FIELD_IDS.person,
    type: RelationType.MANY_TO_ONE,
    label: msg`Person`,
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'chats',
  })
  person: Relation<PersonWorkspaceEntity>;

  @WorkspaceJoinColumn('person')
  personId: string;

  @WorkspaceField({
    standardId: CLIENT_CHAT_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.TEXT,
    label: msg`Status`,
    description: msg`The status of the chat`,
  })
  status: ClientChatStatus;

  @WorkspaceRelation({
    standardId: CLIENT_CHAT_STANDARD_FIELD_IDS.clientChatMessages,
    type: RelationType.ONE_TO_MANY,
    label: msg`Chat Messages`,
    description: msg`Messages from the chat`,
    icon: 'IconMessage',
    inverseSideTarget: () => ClientChatMessageWorkspaceEntity,
    inverseSideFieldKey: 'clientChat',
  })
  @WorkspaceIsNullable()
  clientChatMessages: Relation<ClientChatMessageWorkspaceEntity[]> | null;

  @WorkspaceField({
    standardId: CLIENT_CHAT_STANDARD_FIELD_IDS.lastMessageType,
    type: FieldMetadataType.TEXT,
    label: msg`Last Message Type`,
    description: msg`The type of the last message in the chat`,
  })
  lastMessageType: ChatMessageType;

  @WorkspaceField({
    standardId: CLIENT_CHAT_STANDARD_FIELD_IDS.lastMessageDate,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Last Message Date`,
    description: msg`The date of the last message in the chat`,
  })
  lastMessageDate: Date;

  @WorkspaceField({
    standardId: CLIENT_CHAT_STANDARD_FIELD_IDS.lastMessagePreview,
    type: FieldMetadataType.TEXT,
    label: msg`Last Message Preview`,
    description: msg`The preview of the last message in the chat`,
  })
  @WorkspaceIsNullable()
  lastMessagePreview: string | null;

  @WorkspaceField({
    standardId: CLIENT_CHAT_STANDARD_FIELD_IDS.unreadMessagesCount,
    type: FieldMetadataType.NUMBER,
    label: msg`Unread Messages Count`,
    description: msg`The number of unread messages in the chat`,
    defaultValue: 0,
  })
  unreadMessagesCount: number;
}
