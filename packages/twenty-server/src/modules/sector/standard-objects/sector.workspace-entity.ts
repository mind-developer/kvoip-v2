import { msg } from '@lingui/core/macro';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { SECTOR_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { AgentWorkspaceEntity } from 'src/modules/agent/standard-objects/agent.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

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
  name: string;

  @WorkspaceRelation({
    standardId: SECTOR_FIELD_IDS.agents,
    type: RelationType.ONE_TO_MANY,
    label: msg`Agents`,
    description: msg`Agents assigned to this sector`,
    icon: 'IconUsers',
    inverseSideTarget: () => AgentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  agents: Relation<AgentWorkspaceEntity[]>;

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
}
