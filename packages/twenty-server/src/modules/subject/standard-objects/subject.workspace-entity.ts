/* @kvoip-woulz proprietary */
import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { COLOR_FIELD_DEFAULT_OPTIONS } from 'src/engine/metadata-modules/field-metadata/constants/color-field-default-options.constant';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { SUBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { Relation } from 'typeorm';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.subject,
  namePlural: 'ticketSubjects',
  labelSingular: msg`Ticket Subject`,
  labelPlural: msg`Ticket Subjects`,
  icon: STANDARD_OBJECT_ICONS.ticketSubject,
  labelIdentifierStandardId: SUBJECT_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
export class TicketSubjectWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: SUBJECT_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Name of the subject`,
    icon: 'IconSettings',
  })
  @WorkspaceIsNullable()
  name: string | null;

  @WorkspaceField({
    standardId: SUBJECT_STANDARD_FIELD_IDS.icon,
    type: FieldMetadataType.TEXT,
    label: msg`Icon`,
    description: msg`Subject icon`,
    icon: 'IconPencil',
  })
  icon: string | null;

  @WorkspaceField({
    standardId: SUBJECT_STANDARD_FIELD_IDS.color,
    type: FieldMetadataType.SELECT,
    label: msg`Color`,
    description: msg`Color code for visual identification`,
    icon: 'IconColorSwatch',
    options: COLOR_FIELD_DEFAULT_OPTIONS,
  })
  @WorkspaceIsNullable()
  color: string | null;

  @WorkspaceField({
    standardId: SUBJECT_STANDARD_FIELD_IDS.description,
    type: FieldMetadataType.TEXT,
    label: msg`Description`,
    description: msg`Detailed description of what this subject covers`,
    icon: 'IconFileDescription',
  })
  @WorkspaceIsNullable()
  description: string | null;

  @WorkspaceRelation({
    standardId: SUBJECT_STANDARD_FIELD_IDS.ticketSubject,
    type: RelationType.MANY_TO_ONE,
    label: msg`Ticket Subject`,
    description: msg`Parent ticket subject for hierarchical classification`,
    icon: 'IconUser',
    inverseSideTarget: () => TicketSubjectWorkspaceEntity,
    inverseSideFieldKey: 'ticketSubject',
  })
  @WorkspaceIsNullable()
  ticketSubject: Relation<TicketSubjectWorkspaceEntity> | null;

  @WorkspaceJoinColumn('ticketSubject')
  ticketSubjectId: string | null;

  @WorkspaceRelation({
    standardId: SUBJECT_STANDARD_FIELD_IDS.parentTicketSubjects,
    type: RelationType.ONE_TO_MANY,
    label: msg`Parent Ticket Subjects`,
    description: msg`Parent Ticket Subjects of this subject`,
    icon: 'IconList',
    inverseSideTarget: () => TicketSubjectWorkspaceEntity,
    inverseSideFieldKey: 'ticketSubject',
  })
  parentTicketSubjects: Relation<TicketSubjectWorkspaceEntity[]>;
}
