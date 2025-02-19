import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsUnique } from 'src/engine/twenty-orm/decorators/workspace-is-unique.decorator';
import { LINK_TRACKING_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.linkTracking,
  namePlural: 'link Tracking',
  labelSingular: msg`linkT racking`,
  labelPlural: msg`link Tracking`,
  description: msg`A link Tracking`,
  icon: STANDARD_OBJECT_ICONS.linkTracking,
  shortcut: 'P',
  labelIdentifierStandardId: LINK_TRACKING_STANDARD_FIELD_IDS.linkName,
  imageIdentifierStandardId: LINK_TRACKING_STANDARD_FIELD_IDS.generatedUrl,
})
export class LinkTrackingWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: LINK_TRACKING_STANDARD_FIELD_IDS.linkName,
    type: FieldMetadataType.TEXT,
    label: msg`Link Name`,
    description: msg`The name of the tracked link`,
    icon: 'IconLink',
  })
  @WorkspaceIsNullable()
  linkName: string | null;

  @WorkspaceField({
    standardId: LINK_TRACKING_STANDARD_FIELD_IDS.websiteUrl,
    type: FieldMetadataType.TEXT,
    label: msg`Website URL`,
    description: msg`The original website URL`,
    icon: 'IconGlobe',
  })
  @WorkspaceIsNullable()
  websiteUrl: string | null;

  @WorkspaceField({
    standardId: LINK_TRACKING_STANDARD_FIELD_IDS.generatedUrl,
    type: FieldMetadataType.TEXT,
    label: msg`Generated URL`,
    description: msg`The generated tracking URL`,
    icon: 'IconLink',
  })
  @WorkspaceIsUnique()
  generatedUrl: string;

  @WorkspaceField({
    standardId: LINK_TRACKING_STANDARD_FIELD_IDS.campaignName,
    type: FieldMetadataType.TEXT,
    label: msg`Campaign Name`,
    description: msg`The name of the campaign`,
    icon: 'IconTag',
  })
  campaignName: string;

  @WorkspaceField({
    standardId: LINK_TRACKING_STANDARD_FIELD_IDS.campaignSource,
    type: FieldMetadataType.TEXT,
    label: msg`Campaign Source`,
    description: msg`The source of the campaign`,
    icon: 'IconDatabase',
  })
  campaignSource: string;

  @WorkspaceField({
    standardId: LINK_TRACKING_STANDARD_FIELD_IDS.meansOfCommunication,
    type: FieldMetadataType.TEXT,
    label: msg`Means of Communication`,
    description: msg`The communication channel used`,
    icon: 'IconMessageCircle',
  })
  meansOfCommunication: string;

  @WorkspaceField({
    standardId: LINK_TRACKING_STANDARD_FIELD_IDS.keyword,
    type: FieldMetadataType.TEXT,
    label: msg`Keyword`,
    description: msg`Associated keyword`,
    icon: 'IconSearch',
  })
  @WorkspaceIsNullable()
  keyword: string | null;
}
