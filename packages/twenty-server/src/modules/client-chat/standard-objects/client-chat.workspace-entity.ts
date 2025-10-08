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
import { CLIENT_CHAT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { AgentWorkspaceEntity } from 'src/modules/agent/standard-objects/agent.workspace-entity';
import { ClientChatMessageWorkspaceEntity } from 'src/modules/client-chat-message/standard-objects/client-chat-message.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { SectorWorkspaceEntity } from 'src/modules/sector/standard-objects/sector.workspace-entity';
import { WhatsappIntegrationWorkspaceEntity } from 'src/modules/whatsapp-integration/standard-objects/whatsapp-integration.workspace-entity';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

export enum ChatStatus {
  UNASSIGNED = 'UNASSIGNED',
  ASSIGNED = 'ASSIGNED',
  ABANDONED = 'ABANDONED',
  RESOLVED = 'RESOLVED',
  CHATBOT = 'CHATBOT',
}

const ChatStatusOptions: FieldMetadataComplexOption[] = [
  {
    value: ChatStatus.UNASSIGNED,
    label: 'Unassigned',
    position: 0,
    color: 'red',
  },
  {
    value: ChatStatus.ASSIGNED,
    label: 'Assigned',
    position: 1,
    color: 'green',
  },
  {
    value: ChatStatus.ABANDONED,
    label: 'Abandoned',
    position: 2,
    color: 'gray',
  },
  {
    value: ChatStatus.RESOLVED,
    label: 'Resolved',
    position: 3,
    color: 'blue',
  },
  {
    value: ChatStatus.CHATBOT,
    label: 'Chatbot',
    position: 4,
    color: 'purple',
  },
];

registerEnumType(ChatStatus, {
  name: 'ChatStatus',
  description: 'Chat status options',
});

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.clientChat,
  namePlural: 'chats',
  labelSingular: msg`Client Chat`,
  labelPlural: msg`Chats`,
  description: msg`A chat`,
  icon: STANDARD_OBJECT_ICONS.chat,
})
@ObjectType()
export class ClientChatWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: CLIENT_CHAT_STANDARD_FIELD_IDS.whatsappIntegration,
    type: RelationType.MANY_TO_ONE,
    label: msg`Whatsapp Integration`,
    inverseSideTarget: () => WhatsappIntegrationWorkspaceEntity,
    inverseSideFieldKey: 'chats',
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
  @WorkspaceIsNullable()
  sector: Relation<SectorWorkspaceEntity> | null;

  @WorkspaceJoinColumn('sector')
  sectorId: string | null;

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
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`The status of the chat`,
    options: ChatStatusOptions,
  })
  status: ChatStatus;

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
}
