import { FieldMetadataTextSettings } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';
import { ObjectMetadataSeed } from 'src/engine/seeder/interfaces/object-metadata-seed';

import { FieldMetadataType } from 'twenty-shared';

export const TRACKABLE_LINK_METADATA_SEEDS: ObjectMetadataSeed = {
  labelPlural: 'Trackable links',
  labelSingular: 'Trackable link',
  namePlural: 'trackableLinks',
  nameSingular: 'trackableLink',
  icon: 'IconLink',
  fields: [
    {
      type: FieldMetadataType.TEXT,
      label: 'Link Name',
      name: 'linkName',
      isCustom: false,
      settings: {
        displayedMaxRows: 1,
      } as FieldMetadataTextSettings,
    },
    {
      type: FieldMetadataType.TEXT,
      label: 'Website URL',
      name: 'websiteUrl',
      isCustom: false,
      settings: {
        displayedMaxRows: 1,
      } as FieldMetadataTextSettings,
    },
    {
      type: FieldMetadataType.TEXT,
      label: 'Campaign Name',
      name: 'campaignName',
      isCustom: false,
      settings: {
        displayedMaxRows: 1,
      } as FieldMetadataTextSettings,
    },
    {
      type: FieldMetadataType.TEXT,
      label: 'Campaign Source',
      name: 'campaignSource',
      isCustom: false,
      settings: {
        displayedMaxRows: 1,
      } as FieldMetadataTextSettings,
    },
    {
      type: FieldMetadataType.TEXT,
      label: 'Means of Communication',
      name: 'meansOfCommunication',
      isCustom: false,
      settings: {
        displayedMaxRows: 1,
      } as FieldMetadataTextSettings,
    },
    {
      type: FieldMetadataType.TEXT,
      label: 'Keyword',
      name: 'keyword',
      isCustom: false,
      isNullable: true,
      settings: {
        displayedMaxRows: 1,
      } as FieldMetadataTextSettings,
    },
    {
      type: FieldMetadataType.TEXT,
      label: 'Generated URL',
      name: 'generatedUrl',
      isCustom: false,
      settings: {
        displayedMaxRows: 1,
      } as FieldMetadataTextSettings,
    },
  ],
};
