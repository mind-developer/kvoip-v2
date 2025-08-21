import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { TENANT_STANDARD_FIELD_IDS } from 'src/engine/core-modules/kvoip-admin/standard-objects/constants/kvoip-admin-standard-field-ids.constant';
import { KVOIP_ADMIN_STANDARD_OBJECT_IDS } from 'src/engine/core-modules/kvoip-admin/standard-objects/constants/kvoip-admin-standard-ids.constant';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BASE_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

export const tenantAllView = (objectMetadataItems: ObjectMetadataEntity[]) => {
  const tenantObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === KVOIP_ADMIN_STANDARD_OBJECT_IDS.tenant,
  );

  if (!tenantObjectMetadata) {
    throw new Error('workspaces object metadata not found');
  }

  return {
    name: 'All Workspaces',
    objectMetadataId: tenantObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          tenantObjectMetadata.fields.find(
            (field) => field.standardId === TENANT_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId:
          tenantObjectMetadata.fields.find(
            (field) => field.standardId === TENANT_STANDARD_FIELD_IDS.owner,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          tenantObjectMetadata.fields.find(
            (field) =>
              field.standardId === TENANT_STANDARD_FIELD_IDS.ownerEmail,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          tenantObjectMetadata.fields.find(
            (field) =>
              field.standardId === TENANT_STANDARD_FIELD_IDS.membersCount,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
        aggregateOperation: AggregateOperations.COUNT,
      },
      {
        fieldMetadataId:
          tenantObjectMetadata.fields.find(
            (field) =>
              field.standardId === TENANT_STANDARD_FIELD_IDS.extentionsCount,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
        aggregateOperation: AggregateOperations.COUNT,
      },
      {
        fieldMetadataId:
          tenantObjectMetadata.fields.find(
            (field) =>
              field.standardId === BASE_OBJECT_STANDARD_FIELD_IDS.createdAt,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
