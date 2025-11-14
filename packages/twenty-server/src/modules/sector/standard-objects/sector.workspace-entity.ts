import { msg } from '@lingui/core/macro';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceIsUnique } from 'src/engine/twenty-orm/decorators/workspace-is-unique.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { SECTOR_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AgentWorkspaceEntity } from 'src/modules/agent/standard-objects/agent.workspace-entity';
import { ClientChatWorkspaceEntity } from 'src/modules/client-chat/standard-objects/client-chat.workspace-entity';
import { TicketWorkspaceEntity } from 'src/modules/ticket/ticket.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WhatsappIntegrationWorkspaceEntity } from 'src/modules/whatsapp-integration/standard-objects/whatsapp-integration.workspace-entity';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

/* @kvoip-woulz proprietary:begin */
const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_SECTOR: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];
/* @kvoip-woulz proprietary:end */

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.sector,
  namePlural: 'sectors',
  labelSingular: msg`Sector`,
  labelPlural: msg`Sectors`,
  description: msg`Sectors on this Workspace`,
  icon: 'IconIdBadge2',
  labelIdentifierStandardId: SECTOR_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
export class SectorWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: SECTOR_FIELD_IDS.icon,
    type: FieldMetadataType.TEXT,
    label: msg`Icon`,
    description: msg`Sector icon`,
    icon: 'IconPencil',
  })
  icon: string;

  @WorkspaceField({
    standardId: SECTOR_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Sector name`,
    icon: 'IconPencil',
  })
  @WorkspaceIsUnique()
  name: string;

  @WorkspaceRelation({
    standardId: SECTOR_FIELD_IDS.agents,
    type: RelationType.ONE_TO_MANY,
    label: msg`Agents`,
    description: msg`Agents assigned to this sector`,
    icon: 'IconUsers',
    inverseSideTarget: () => AgentWorkspaceEntity,
  })
  @WorkspaceIsNullable()
  agents: Relation<AgentWorkspaceEntity[] | null>;

  @WorkspaceRelation({
    standardId: SECTOR_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline Activity events`,
    icon: STANDARD_OBJECT_ICONS.timelineActivity,
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: SECTOR_FIELD_IDS.chats,
    type: RelationType.ONE_TO_MANY,
    label: msg`Chats`,
    description: msg`Chats assigned to this sector`,
    icon: 'IconChat',
    inverseSideTarget: () => ClientChatWorkspaceEntity,
    inverseSideFieldKey: 'sector',
  })
  chats: Relation<ClientChatWorkspaceEntity[]> | null;

  /* @kvoip-woulz proprietary:begin */
  @WorkspaceRelation({
    standardId: SECTOR_FIELD_IDS.ticket,
    type: RelationType.ONE_TO_MANY,
    label: msg`Ticket`,
    description: msg`Tickets assigned to this sector`,
    icon: 'IconChat',
    inverseSideTarget: () => TicketWorkspaceEntity,
    inverseSideFieldKey: 'sector',
  })
  ticket: Relation<TicketWorkspaceEntity[]> | null;
  /* @kvoip-woulz proprietary:end */

  @WorkspaceField({
    standardId: SECTOR_FIELD_IDS.abandonmentInterval,
    type: FieldMetadataType.NUMBER,
    label: msg`Abandonment Interval`,
    description: msg`Abandonment interval in minutes`,
  })
  abandonmentInterval: number;

  @WorkspaceRelation({
    standardId: SECTOR_FIELD_IDS.whatsappIntegrations,
    type: RelationType.ONE_TO_MANY,
    label: msg`WhatsApp Integrations that default to this sector`,
    inverseSideTarget: () => WhatsappIntegrationWorkspaceEntity,
    inverseSideFieldKey: 'defaultSector',
  })
  whatsappIntegrations: Relation<WhatsappIntegrationWorkspaceEntity[]>;

  /* @kvoip-woulz proprietary:begin */
  @WorkspaceField({
    standardId: SECTOR_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_SECTOR,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchVector: any;
  /* @kvoip-woulz proprietary:end */
}
