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
    name: 'All Subscriptions',
    objectMetadataId: subscriptionObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
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
              SUBSCRIPTION_STANDARD_FIELD_IDS.subscriptionPlan,
          )?.id ?? '',
        position: 3,
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
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          subscriptionObjectMetadata.fields.find(
            (field) =>
              field.standardId === SUBSCRIPTION_STANDARD_FIELD_IDS.recurrence,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          subscriptionObjectMetadata.fields.find(
            (field) =>
              field.standardId === SUBSCRIPTION_STANDARD_FIELD_IDS.status,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          subscriptionObjectMetadata.fields.find(
            (field) =>
              field.standardId === SUBSCRIPTION_STANDARD_FIELD_IDS.amount,
          )?.id ?? '',
        position: 7,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
