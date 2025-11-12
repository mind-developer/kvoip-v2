/* @kvoip-woulz proprietary */
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TICKET_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ViewOpenRecordInType } from 'src/modules/view/standard-objects/view.workspace-entity';

export const ticketAllView = (objectMetadataItems: ObjectMetadataEntity[]) => {
  const ticketObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.ticket,
  );

  if (!ticketObjectMetadata) {
    throw new Error('Ticket object metadata not found');
  }

  return {
    name: 'All tickets',
    objectMetadataId: ticketObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconList',
    openRecordIn: ViewOpenRecordInType.RECORD_PAGE,
    kanbanFieldMetadataId: '',
    filters: [],
    fields: [
      {
        fieldMetadataId:
          ticketObjectMetadata.fields.find(
            (field) => field.standardId === TICKET_STANDARD_FIELD_IDS.name,
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          ticketObjectMetadata.fields.find(
            (field) => field.standardId === TICKET_STANDARD_FIELD_IDS.statuses,
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          ticketObjectMetadata.fields.find(
            (field) => field.standardId === TICKET_STANDARD_FIELD_IDS.solution,
          )?.id ?? '',
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          ticketObjectMetadata.fields.find(
            (field) =>
              field.standardId === TICKET_STANDARD_FIELD_IDS.ticketNumber,
          )?.id ?? '',
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          ticketObjectMetadata.fields.find(
            (field) => field.standardId === TICKET_STANDARD_FIELD_IDS.closedBy,
          )?.id ?? '',
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          ticketObjectMetadata.fields.find(
            (field) =>
              field.standardId === TICKET_STANDARD_FIELD_IDS.lastUpdatedBy,
          )?.id ?? '',
        position: 5,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          ticketObjectMetadata.fields.find(
            (field) =>
              field.standardId === TICKET_STANDARD_FIELD_IDS.opportunity,
          )?.id ?? '',
        position: 6,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          ticketObjectMetadata.fields.find(
            (field) => field.standardId === TICKET_STANDARD_FIELD_IDS.sector,
          )?.id ?? '',
        position: 7,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId:
          ticketObjectMetadata.fields.find(
            (field) => field.standardId === TICKET_STANDARD_FIELD_IDS.person,
          )?.id ?? '',
        position: 8,
        isVisible: true,
        size: 150,
      },
    ],
  };
};
