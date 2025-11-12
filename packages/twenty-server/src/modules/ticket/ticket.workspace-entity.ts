/* @kvoip-woulz proprietary */
import { Field, registerEnumType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { TICKET_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { SectorWorkspaceEntity } from 'src/modules/sector/standard-objects/sector.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

export enum TicketStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
}

const TicketStatusOptions: FieldMetadataComplexOption[] = [
  {
    value: TicketStatus.DRAFT,
    label: 'Draft',
    position: 0,
    color: 'yellow',
  },
  {
    value: TicketStatus.ACTIVE,
    label: 'Active',
    position: 1,
    color: 'green',
  },
  {
    value: TicketStatus.DEACTIVATED,
    label: 'Deactivated',
    position: 2,
    color: 'gray',
  },
];

registerEnumType(TicketStatus, {
  name: 'TicketStatus',
  description: 'Ticket status options',
});

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_TICKET: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.ticket,
  namePlural: 'tickets',
  labelSingular: msg`Ticket`,
  labelPlural: msg`Tickets`,
  icon: STANDARD_OBJECT_ICONS.ticket,
  labelIdentifierStandardId: TICKET_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
export class TicketWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: TICKET_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Name of the ticket`,
    icon: STANDARD_OBJECT_ICONS.ticket,
  })
  @WorkspaceIsNullable()
  name: string | null;

  @WorkspaceField({
    standardId: TICKET_STANDARD_FIELD_IDS.statuses,
    type: FieldMetadataType.SELECT,
    label: msg`Statuses`,
    description: msg`The current statuses of the ticket`,
    icon: 'IconStatusChange',
    options: TicketStatusOptions,
  })
  @WorkspaceIsNullable()
  @Field(() => TicketStatus, { nullable: true })
  statuses: TicketStatus | null;

  @WorkspaceField({
    standardId: TICKET_STANDARD_FIELD_IDS.solution,
    type: FieldMetadataType.TEXT,
    label: msg`Solution`,
    description: msg`Solution of the ticket`,
    icon: 'IconArticle',
  })
  @WorkspaceIsNullable()
  solution: string | null;

  @WorkspaceField({
    standardId: TICKET_STANDARD_FIELD_IDS.ticketNumber,
    type: FieldMetadataType.TEXT,
    label: msg`Ticket Number`,
    description: msg`Ticket number`,
    icon: 'IconNumber',
  })
  @WorkspaceIsNullable()
  ticketNumber: string | null;

  @WorkspaceField({
    standardId: TICKET_STANDARD_FIELD_IDS.closedBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Closed By`,
    icon: 'IconCreativeCommonsBy',
    description: msg`Workspace member who closed the ticket`,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsFieldUIReadOnly()
  closedBy: ActorMetadata | null;

  @WorkspaceField({
    standardId: TICKET_STANDARD_FIELD_IDS.lastUpdatedBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Last Updated By`,
    icon: 'IconCreativeCommonsBy',
    description: msg`Workspace member who last updated the ticket`,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsFieldUIReadOnly()
  lastUpdatedBy: ActorMetadata | null;

  @WorkspaceRelation({
    standardId: TICKET_STANDARD_FIELD_IDS.attachments,
    type: RelationType.ONE_TO_MANY,
    label: msg`Attachments`,
    description: msg`Attachments linked to the ticket`,
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: TICKET_STANDARD_FIELD_IDS.opportunity,
    type: RelationType.MANY_TO_ONE,
    label: msg`Lead Name`,
    description: msg`Lead name of the ticket`,
    icon: STANDARD_OBJECT_ICONS.opportunity,
    inverseSideTarget: () => OpportunityWorkspaceEntity,
    inverseSideFieldKey: 'ticket',
  })
  @WorkspaceIsNullable()
  opportunity: Relation<OpportunityWorkspaceEntity> | null;

  @WorkspaceJoinColumn('opportunity')
  opportunityId: string;

  @WorkspaceRelation({
    standardId: TICKET_STANDARD_FIELD_IDS.sector,
    type: RelationType.MANY_TO_ONE,
    label: msg`Sector`,
    description: msg`Sector of the ticket`,
    icon: STANDARD_OBJECT_ICONS.sector,
    inverseSideTarget: () => SectorWorkspaceEntity,
    inverseSideFieldKey: 'ticket',
  })
  @WorkspaceIsNullable()
  sector: Relation<SectorWorkspaceEntity> | null;

  @WorkspaceJoinColumn('sector')
  sectorId: string;

  @WorkspaceRelation({
    standardId: TICKET_STANDARD_FIELD_IDS.noteTargets,
    type: RelationType.ONE_TO_MANY,
    label: msg`Notes`,
    description: msg`Notes tied to the ticket`,
    icon: 'IconNotes',
    inverseSideTarget: () => NoteTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  noteTargets: Relation<NoteTargetWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: TICKET_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Charge record position`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number | null;

  @WorkspaceRelation({
    standardId: TICKET_STANDARD_FIELD_IDS.person,
    type: RelationType.MANY_TO_ONE,
    label: msg`Contact`,
    description: msg`Person linked to the support`,
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'ticket',
  })
  @WorkspaceIsNullable()
  person: Relation<PersonWorkspaceEntity> | null;

  @WorkspaceJoinColumn('person')
  personId: string;

  @WorkspaceRelation({
    standardId: TICKET_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Events`,
    description: msg`Events linked to the support`,
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: TICKET_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_TICKET,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchVector: any;
}
