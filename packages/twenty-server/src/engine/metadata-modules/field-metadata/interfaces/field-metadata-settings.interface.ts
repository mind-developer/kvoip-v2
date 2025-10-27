import {
  type AllowedAddressSubField,
  type FieldMetadataType,
  type IsExactly,
} from 'twenty-shared/types';

import { type RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { type RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

export enum NumberDataType {
  FLOAT = 'float',
  INT = 'int',
  BIGINT = 'bigint',
}

export enum DateDisplayFormat {
  RELATIVE = 'RELATIVE',
  USER_SETTINGS = 'USER_SETTINGS',
  CUSTOM = 'CUSTOM',
}

export type FieldNumberVariant = 'number' | 'percentage';

export type FieldMetadataNumberSettings = {
  dataType?: NumberDataType;
  decimals?: number;
  type?: FieldNumberVariant;
};

import type { MessageDescriptor } from '@lingui/core'; // @kvoip-woulz proprietary

export type FieldMetadataTextValidation = {
  pattern?: string;
  mask?: string;
  dynamicMask?: string;
  placeholder?: string;
  errorMessage?: string;
  validateOnType?: boolean;
};
/* @kvoip-woulz proprietary:begin */
export type FieldMetadataTextValidationInput = {
  pattern?: string;
  mask?: string;
  dynamicMask?: string;
  placeholder?: string;
  errorMessage?: string | MessageDescriptor;
  validateOnType?: boolean;
};
/* @kvoip-woulz proprietary:end */

export type FieldMetadataTextSettings = {
  displayedMaxRows?: number;
  /* @kvoip-woulz proprietary:begin */
  validation?: FieldMetadataTextValidation;
  /* @kvoip-woulz proprietary:end */
};

/* @kvoip-woulz proprietary:begin */
export type FieldMetadataTextSettingsInput = {
  displayedMaxRows?: number;
  validation?: FieldMetadataTextValidationInput;
};
/* @kvoip-woulz proprietary:end */

export type FieldMetadataDateSettings = {
  displayFormat?: DateDisplayFormat;
};

export type FieldMetadataDateTimeSettings = {
  displayFormat?: DateDisplayFormat;
};

export type FieldMetadataRelationSettings = {
  relationType: RelationType;
  onDelete?: RelationOnDeleteAction;
  joinColumnName?: string | null;
};

export type FieldMetadataAddressSettings = {
  subFields?: AllowedAddressSubField[];
};

export type FieldMetadataTsVectorSettings = {
  asExpression?: string;
  generatedType?: 'STORED' | 'VIRTUAL';
};

type FieldMetadataSettingsMapping = {
  [FieldMetadataType.NUMBER]: FieldMetadataNumberSettings | null;
  [FieldMetadataType.DATE]: FieldMetadataDateSettings | null;
  [FieldMetadataType.DATE_TIME]: FieldMetadataDateTimeSettings | null;
  [FieldMetadataType.TEXT]: FieldMetadataTextSettings | null;
  [FieldMetadataType.RELATION]: FieldMetadataRelationSettings;
  [FieldMetadataType.ADDRESS]: FieldMetadataAddressSettings | null;
  [FieldMetadataType.MORPH_RELATION]: FieldMetadataRelationSettings;
  [FieldMetadataType.TS_VECTOR]: FieldMetadataTsVectorSettings | null;
};

/* @kvoip-woulz proprietary:begin */
type FieldMetadataSettingsInputMapping = {
  [FieldMetadataType.NUMBER]: FieldMetadataNumberSettings | null;
  [FieldMetadataType.DATE]: FieldMetadataDateSettings | null;
  [FieldMetadataType.DATE_TIME]: FieldMetadataDateTimeSettings | null;
  [FieldMetadataType.TEXT]: FieldMetadataTextSettingsInput | null;
  [FieldMetadataType.RELATION]: FieldMetadataRelationSettings;
  [FieldMetadataType.ADDRESS]: FieldMetadataAddressSettings | null;
  [FieldMetadataType.MORPH_RELATION]: FieldMetadataRelationSettings;
  [FieldMetadataType.TS_VECTOR]: FieldMetadataTsVectorSettings | null;
};
/* @kvoip-woulz proprietary:end */

export type AllFieldMetadataSettings =
  FieldMetadataSettingsMapping[keyof FieldMetadataSettingsMapping];

/* @kvoip-woulz proprietary:begin */
export type AllFieldMetadataSettingsInput =
  FieldMetadataSettingsInputMapping[keyof FieldMetadataSettingsInputMapping];
/* @kvoip-woulz proprietary:end */

export type FieldMetadataSettings<
  T extends FieldMetadataType = FieldMetadataType,
> =
  IsExactly<T, FieldMetadataType> extends true
    ? null | AllFieldMetadataSettings
    : T extends keyof FieldMetadataSettingsMapping
      ? FieldMetadataSettingsMapping[T]
      : never | null;

/* @kvoip-woulz proprietary:begin */
export type FieldMetadataSettingsInput<
  T extends FieldMetadataType = FieldMetadataType,
> =
  IsExactly<T, FieldMetadataType> extends true
    ? null | AllFieldMetadataSettingsInput
    : T extends keyof FieldMetadataSettingsInputMapping
      ? FieldMetadataSettingsInputMapping[T]
      : never | null;
/* @kvoip-woulz proprietary:end */
