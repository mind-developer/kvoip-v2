import { ObjectMetadataStandardIdToIdMap } from 'src/engine/metadata-modules/object-metadata/interfaces/object-metadata-standard-id-to-id-map';

import { LINK_TRACKING_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const linkTrackingAllView = (
  objectMetadataStandardIdToIdMap: ObjectMetadataStandardIdToIdMap,
) => {
  return {
    name: 'All Links',
    objectMetadataId:
      objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.linkTracking].id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconLink',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.linkTracking]
            .fields[LINK_TRACKING_STANDARD_FIELD_IDS.linkName],
        position: 0,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.linkTracking]
            .fields[LINK_TRACKING_STANDARD_FIELD_IDS.websiteUrl],
        position: 1,
        isVisible: true,
        size: 250,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.linkTracking]
            .fields[LINK_TRACKING_STANDARD_FIELD_IDS.generatedUrl],
        position: 2,
        isVisible: true,
        size: 250,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.linkTracking]
            .fields[LINK_TRACKING_STANDARD_FIELD_IDS.campaignName],
        position: 3,
        isVisible: true,
        size: 200,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.linkTracking]
            .fields[LINK_TRACKING_STANDARD_FIELD_IDS.campaignSource],
        position: 4,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.linkTracking]
            .fields[LINK_TRACKING_STANDARD_FIELD_IDS.meansOfCommunication],
        position: 5,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId:
          objectMetadataStandardIdToIdMap[STANDARD_OBJECT_IDS.linkTracking]
            .fields[LINK_TRACKING_STANDARD_FIELD_IDS.keyword],
        position: 6,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
