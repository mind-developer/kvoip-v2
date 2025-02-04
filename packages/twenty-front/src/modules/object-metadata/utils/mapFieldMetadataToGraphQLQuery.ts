import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { isUndefined } from '@sniptt/guards';
import {
  FieldMetadataType,
  RelationDefinitionType,
} from '~/generated-metadata/graphql';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import { FieldMetadataItem } from '../types/FieldMetadataItem';

type MapFieldMetadataToGraphQLQueryArgs = {
  objectMetadataItems: ObjectMetadataItem[];
  field: Pick<FieldMetadataItem, 'name' | 'type' | 'relationDefinition'>;
  relationRecordGqlFields?: RecordGqlFields;
  computeReferences?: boolean;
};
// TODO: change ObjectMetadataItems mock before refactoring with relationDefinition computed field
export const mapFieldMetadataToGraphQLQuery = ({
  objectMetadataItems,
  field,
  relationRecordGqlFields,
  computeReferences = false,
}: MapFieldMetadataToGraphQLQueryArgs): string => {
  const fieldType = field.type;

  const fieldIsSimpleValue = [
    FieldMetadataType.Uuid,
    FieldMetadataType.Text,
    FieldMetadataType.DateTime,
    FieldMetadataType.Date,
    FieldMetadataType.Number,
    FieldMetadataType.Boolean,
    FieldMetadataType.Rating,
    FieldMetadataType.Select,
    FieldMetadataType.MultiSelect,
    FieldMetadataType.Position,
    FieldMetadataType.RawJson,
    FieldMetadataType.RichText,
    FieldMetadataType.Array,
  ].includes(fieldType);

  if (fieldIsSimpleValue) {
    return field.name;
  }

  if (
    fieldType === FieldMetadataType.Relation &&
    field.relationDefinition?.direction === RelationDefinitionType.ManyToOne
  ) {
    const relationMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        field.relationDefinition?.targetObjectMetadata.id,
    );

    if (isUndefined(relationMetadataItem)) {
      return '';
    }

    return `${field.name}
${mapObjectMetadataToGraphQLQuery({
  objectMetadataItems,
  objectMetadataItem: relationMetadataItem,
  recordGqlFields: relationRecordGqlFields,
  computeReferences: computeReferences,
  isRootLevel: false,
})}`;
  }

  if (
    fieldType === FieldMetadataType.Relation &&
    field.relationDefinition?.direction === RelationDefinitionType.OneToMany
  ) {
    const relationMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.id ===
        field.relationDefinition?.targetObjectMetadata.id,
    );

    if (isUndefined(relationMetadataItem)) {
      return '';
    }

    return `${field.name}
{
  edges {
    node ${mapObjectMetadataToGraphQLQuery({
      objectMetadataItems,
      objectMetadataItem: relationMetadataItem,
      recordGqlFields: relationRecordGqlFields,
      computeReferences,
      isRootLevel: false,
    })}
  }
}`;
  }

  if (fieldType === FieldMetadataType.Links) {
    return `${field.name}
{
  primaryLinkUrl
  primaryLinkLabel
  secondaryLinks
}`;
  }

  if (fieldType === FieldMetadataType.Currency) {
    return `${field.name}
{
  amountMicros
  currencyCode
}
    `;
  }

  if (fieldType === FieldMetadataType.FullName) {
    return `${field.name}
{
  firstName
  lastName
}`;
  }

  if (fieldType === FieldMetadataType.Address) {
    return `${field.name}
{
  addressStreet1
  addressStreet2
  addressCity
  addressState
  addressCountry
  addressPostcode
  addressLat
  addressLng
}`;
  }

  if (fieldType === FieldMetadataType.Actor) {
    return `${field.name}
{
    source
    workspaceMemberId
    name
    context
}`;
  }

  if (fieldType === FieldMetadataType.Emails) {
    return `${field.name}
{
  primaryEmail
  additionalEmails
}`;
  }

  if (fieldType === FieldMetadataType.Phones) {
    return `${field.name}
    {
      primaryPhoneNumber
      primaryPhoneCountryCode
      primaryPhoneCallingCode
      additionalPhones
    }`;
  }

  if (fieldType === FieldMetadataType.RICH_TEXT_V2) {
    return `${field.name}
{
  blocknote
  markdown
}`;
  }

  return '';
};
