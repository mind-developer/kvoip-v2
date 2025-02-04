import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldActorValue } from '@/object-record/record-field/types/FieldMetadata';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import {
  FieldMetadataType,
  RelationDefinitionType,
} from '~/generated-metadata/graphql';

export type GenerateEmptyFieldValueArgs = {
  fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'relationDefinition'>;
};
// TODO strictly type each fieldValue following their FieldMetadataType
export const generateEmptyFieldValue = ({
  fieldMetadataItem,
}: GenerateEmptyFieldValueArgs) => {
  switch (fieldMetadataItem.type) {
    case FieldMetadataType.Text: {
      return '';
    }
    case FieldMetadataType.Emails: {
      return { primaryEmail: '', additionalEmails: null };
    }
    case FieldMetadataType.Links: {
      return { primaryLinkUrl: '', primaryLinkLabel: '', secondaryLinks: [] };
    }
    case FieldMetadataType.FullName: {
      return {
        firstName: '',
        lastName: '',
      };
    }
    case FieldMetadataType.Address: {
      return {
        addressStreet1: '',
        addressStreet2: '',
        addressCity: '',
        addressState: '',
        addressCountry: '',
        addressPostcode: '',
        addressLat: null,
        addressLng: null,
      };
    }
    case FieldMetadataType.DateTime: {
      return null;
    }
    case FieldMetadataType.Date: {
      return null;
    }
    case FieldMetadataType.Number:
    case FieldMetadataType.Rating:
    case FieldMetadataType.Position:
    case FieldMetadataType.Numeric: {
      return null;
    }
    case FieldMetadataType.Uuid: {
      return null;
    }
    case FieldMetadataType.Boolean: {
      return true;
    }
    case FieldMetadataType.Relation: {
      if (
        fieldMetadataItem.relationDefinition?.direction ===
        RelationDefinitionType.ManyToOne
      ) {
        return null;
      }

      return [];
    }
    case FieldMetadataType.Currency: {
      return {
        amountMicros: null,
        currencyCode: null,
      };
    }
    case FieldMetadataType.Select: {
      return null;
    }
    case FieldMetadataType.MultiSelect: {
      return null;
    }
    case FieldMetadataType.Array: {
      return null;
    }
    case FieldMetadataType.RawJson: {
      return null;
    }
    case FieldMetadataType.RichText: {
      return null;
    }
    case FieldMetadataType.Actor: {
      return {
        source: 'MANUAL',
        context: {},
        name: '',
        workspaceMemberId: null,
      } satisfies FieldActorValue;
    }
    case FieldMetadataType.Phones: {
      return {
        primaryPhoneNumber: '',
        primaryPhoneCountryCode: '',
        primaryPhoneCallingCode: '',
        additionalPhones: null,
      };
    }
    case FieldMetadataType.TS_VECTOR: {
      throw new Error('TS_VECTOR not implemented yet');
    }
    default: {
      return assertUnreachable(
        fieldMetadataItem.type,
        'Unhandled FieldMetadataType',
      );
    }
  }
};
