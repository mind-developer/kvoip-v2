import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { SUBSCRIPTION_STANDARD_FIELD_IDS } from 'src/engine/core-modules/kvoip-admin/standard-objects/constants/kvoip-admin-standard-field-ids.constant';
import { KVOIP_ADMIN_STANDARD_OBJECT_IDS } from 'src/engine/core-modules/kvoip-admin/standard-objects/constants/kvoip-admin-standard-ids.constant';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export const subscriptionAllView = (
  objectMetadataItems: ObjectMetadataEntity[],
) => {
  const subscriptionObjectMetadata = objectMetadataItems.find(
    (object) =>
      object.standardId === KVOIP_ADMIN_STANDARD_OBJECT_IDS.subscription,
  );

  if (!subscriptionObjectMetadata) {
    throw new Error('subscription object metadata not found');
  }

  return {
    name: 'All Owners',
    objectMetadataId: subscriptionObjectMetadata.id,
    type: 'table',
    key: null,
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          subscriptionObjectMetadata.fields.find(
            (field) =>
              field.standardId === SUBSCRIPTION_STANDARD_FIELD_IDS.identifier,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId:
          subscriptionObjectMetadata.fields.find(
            (field) =>
              field.standardId === SUBSCRIPTION_STANDARD_FIELD_IDS.tenant,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
        aggregateOperation: AggregateOperations.COUNT_UNIQUE_VALUES,
      },
      {
        fieldMetadataId:
          subscriptionObjectMetadata.fields.find(
            (field) =>
              field.standardId === SUBSCRIPTION_STANDARD_FIELD_IDS.owner,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          subscriptionObjectMetadata.fields.find(
            (field) =>
              field.standardId ===
              SUBSCRIPTION_STANDARD_FIELD_IDS.paymentProvider,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
