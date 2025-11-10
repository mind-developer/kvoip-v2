/* @kvoip-woulz proprietary:begin */
import { type I18n } from '@lingui/core';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
/* @kvoip-woulz proprietary:end */
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

/* @kvoip-woulz proprietary:begin */
const translateSettingsErrorMessage = (
  settings: any,
  i18nInstance: I18n | undefined,
): any => {
  if (!settings || !i18nInstance) {
    return settings;
  }

  if (settings.validation?.errorMessage) {
    const messageId = generateMessageId(settings.validation.errorMessage);
    const translatedMessage = i18nInstance._(messageId);

    return {
      ...settings,
      validation: {
        ...settings.validation,
        errorMessage:
          translatedMessage !== messageId
            ? translatedMessage
            : settings.validation.errorMessage,
      },
    };
  }

  return settings;
};
/* @kvoip-woulz proprietary:end */

export const fromFieldMetadataEntityToFieldMetadataDto = (
  fieldMetadataEntity: FieldMetadataEntity,
  /* @kvoip-woulz proprietary:begin */
  i18nInstance?: I18n,
  /* @kvoip-woulz proprietary:end */
): FieldMetadataDTO => {
  const {
    createdAt,
    updatedAt,
    description,
    icon,
    standardOverrides,
    isNullable,
    isUnique,
    settings,
    ...rest
  } = fieldMetadataEntity;

  return {
    ...rest,
    createdAt: new Date(createdAt),
    updatedAt: new Date(updatedAt),
    description: description ?? undefined,
    icon: icon ?? undefined,
    standardOverrides: standardOverrides ?? undefined,
    isNullable: isNullable ?? false,
    isUnique: isUnique ?? false,
    /* @kvoip-woulz proprietary:begin */
    settings:
      translateSettingsErrorMessage(settings, i18nInstance) ?? undefined,
    /* @kvoip-woulz proprietary:end */
  };
};
