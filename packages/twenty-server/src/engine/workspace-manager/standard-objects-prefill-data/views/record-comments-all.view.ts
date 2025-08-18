import { ObjectMetadataEntity } from "src/engine/metadata-modules/object-metadata/object-metadata.entity";
import { STANDARD_OBJECT_IDS } from "../../workspace-sync-metadata/constants/standard-object-ids";
import { RECORD_COMMENT_STANDARD_FIELD_IDS } from "../../workspace-sync-metadata/constants/standard-field-ids";

export const recordCommentsAllView = (objectMetadataItems: ObjectMetadataEntity[]) => {
  //look for all object metadatas where id matches the recordComments standard object's ID
  const recordCommentObjectMetadata = objectMetadataItems.find(
    (object) => object.standardId === STANDARD_OBJECT_IDS.recordComment
  )

  //error out if object doesn't exist
  if (!recordCommentObjectMetadata) throw new Error('Object not found')

  return {
    name: 'All Record Comments',
    objectMetadataId: recordCommentObjectMetadata.id,
    type: 'table',
    key: 'INDEX',
    position: 0,
    icon: 'IconMessageCircle',
    fields: [
      {
        fieldMetadataId:
          recordCommentObjectMetadata.fields.find(
            (field) => field.standardId === RECORD_COMMENT_STANDARD_FIELD_IDS.title
          )?.id ?? '',
        position: 0,
        isVisible: true,
        size: 230,
      },
      {
        fieldMetadataId:
          recordCommentObjectMetadata.fields.find(
            (field) => field.standardId === RECORD_COMMENT_STANDARD_FIELD_IDS.body
          )?.id ?? '',
        position: 1,
        isVisible: true,
        size: 400,
      }
    ]
  }
}
