import { type MessageDescriptor } from '@lingui/core';
import { type FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataDefaultValue } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-default-value.interface';
import { type FieldMetadataOptions } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-options.interface';
/* @kvoip-woulz proprietary:begin */
import {
  type FieldMetadataSettings,
  type FieldMetadataSettingsInput,
  type FieldMetadataTextSettingsInput,
} from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface';

import { generateDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/generate-default-value';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { TypedReflect } from 'src/utils/typed-reflect';

export interface WorkspaceFieldOptions<
  T extends FieldMetadataType = Exclude<
    FieldMetadataType,
    // Use @WorkspaceRelation or @WorkspaceDynamicRelation for relation fields
    FieldMetadataType.RELATION
  >,
> {
  standardId: string;
  type: T;
  label: MessageDescriptor;
  description?: MessageDescriptor;
  icon?: string;
  defaultValue?: FieldMetadataDefaultValue<T>;
  options?: FieldMetadataOptions<T>;
  settings?: FieldMetadataSettingsInput<T>; // @kvoip-woulz proprietary
  isActive?: boolean;
  generatedType?: 'STORED' | 'VIRTUAL';
  asExpression?: string;
}

export function WorkspaceField<T extends FieldMetadataType>(
  options: WorkspaceFieldOptions<T>,
): PropertyDecorator {
  return (object, propertyKey) => {
    const isPrimary =
      TypedReflect.getMetadata(
        'workspace:is-primary-field-metadata-args',
        object,
        propertyKey.toString(),
      ) ?? false;
    const isNullable =
      TypedReflect.getMetadata(
        'workspace:is-nullable-metadata-args',
        object,
        propertyKey.toString(),
      ) ?? false;
    const isSystem =
      TypedReflect.getMetadata(
        'workspace:is-system-metadata-args',
        object,
        propertyKey.toString(),
      ) ?? false;
    const isUIReadOnly =
      TypedReflect.getMetadata(
        'workspace:is-field-ui-readonly-metadata-args',
        object,
        propertyKey.toString(),
      ) ?? false;
    const gate = TypedReflect.getMetadata(
      'workspace:gate-metadata-args',
      object,
      propertyKey.toString(),
    );
    const isDeprecated =
      TypedReflect.getMetadata(
        'workspace:is-deprecated-field-metadata-args',
        object,
        propertyKey.toString(),
      ) ?? false;
    const isUnique =
      TypedReflect.getMetadata(
        'workspace:is-unique-metadata-args',
        object,
        propertyKey.toString(),
      ) ?? false;

    const defaultValue = (options.defaultValue ??
      generateDefaultValue(options.type)) as FieldMetadataDefaultValue | null;
    const name = propertyKey.toString();
    const label = options.label.message ?? '';
    const isLabelSyncedWithName = computeMetadataNameFromLabel(label) === name;

    /* @kvoip-woulz proprietary:begin */
    const transformedSettings: FieldMetadataSettings | undefined =
      options.settings
        ? transformSettingsForStorage(options.settings)
        : undefined;
    /* @kvoip-woulz proprietary:end */

    metadataArgsStorage.addFields({
      target: object.constructor,
      standardId: options.standardId,
      name,
      label,
      type: options.type,
      isLabelSyncedWithName,
      description: options.description?.message ?? '',
      icon: options.icon,
      defaultValue,
      options: options.options,
      settings: transformedSettings, // @kvoip-woulz proprietary
      isPrimary,
      isNullable,
      isSystem,
      isUIReadOnly,
      gate,
      isDeprecated,
      isUnique,
      isActive: options.isActive,
      asExpression: options.asExpression,
      generatedType: options.generatedType,
    });
  };
}

/* @kvoip-woulz proprietary:begin */
function transformSettingsForStorage(
  settings: FieldMetadataSettingsInput,
): FieldMetadataSettings {
  if (
    settings &&
    typeof settings === 'object' &&
    'validation' in settings &&
    settings.validation
  ) {
    const textSettings = settings as FieldMetadataTextSettingsInput;
    const validation = textSettings.validation;

    if (validation && typeof validation.errorMessage === 'object') {
      const messageDescriptor = validation.errorMessage as MessageDescriptor;
      return {
        ...textSettings,
        validation: {
          ...validation,
          errorMessage: messageDescriptor.message ?? '',
        },
      } as FieldMetadataSettings;
    }
  }

  return settings as FieldMetadataSettings;
}
/* @kvoip-woulz proprietary:end */
