import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { OWNER_STANDARD_FIELD_IDS } from 'src/engine/core-modules/kvoip-admin/standard-objects/constants/kvoip-admin-standard-field-ids.constant';
import { KVOIP_ADMIN_STANDARD_OBJECT_IDS } from 'src/engine/core-modules/kvoip-admin/standard-objects/constants/kvoip-admin-standard-ids.constant';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const ownterAllView = (objectMetadataItems: ObjectMetadataEntity[]) => {
  const ownerObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === KVOIP_ADMIN_STANDARD_OBJECT_IDS.owner,
  );

  if (!ownerObjectMetadata) {
    throw new Error('ownter object metadata not found');
  }

  return {
    name: 'All Owners',
    objectMetadataId: ownerObjectMetadata.id,
    type: 'table',
    key: null,
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          ownerObjectMetadata.fields.find(
            (field) => field.standardId === OWNER_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId:
          ownerObjectMetadata.fields.find(
            (field) => field.standardId === OWNER_STANDARD_FIELD_IDS.emails,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
        aggregateOperation: AggregateOperations.COUNT_UNIQUE_VALUES,
      },
      {
        fieldMetadataId:
          ownerObjectMetadata.fields.find(
            (field) => field.standardId === OWNER_STANDARD_FIELD_IDS.phone,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          ownerObjectMetadata.fields.find(
            (field) => field.standardId === OWNER_STANDARD_FIELD_IDS.city,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
