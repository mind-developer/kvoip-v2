/* @kvoip-woulz proprietary */
import { useCallback, useMemo } from 'react';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFieldListFieldMetadataItems } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems';
import { getForeignKeyNameFromRelationFieldName } from '@/object-record/utils/getForeignKeyNameFromRelationFieldName';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';

type UseCreateFormFieldsArgs = {
  objectMetadataItem: ObjectMetadataItem;
  objectNameSingular: string;
};

export type RenderableCreateFieldConfig = {
  fieldName: string;
  position: number;
  sourceFieldMetadataItem: FieldMetadataItem;
  relationIdFieldName?: string;
};

export type RelationFieldConfig = {
  relationFieldName: string;
  relationIdFieldName: string;
  label: string;
};

type UseCreateFormFieldsResult = {
  getRenderableField: (fieldName: string) => RenderableCreateFieldConfig | null;
  fieldsByName: Record<string, FieldMetadataItem>;
  relationFieldMetadataItems: FieldMetadataItem[];
  relationFieldConfigs: RelationFieldConfig[];
};

export const useCreateFormFields = ({
  objectMetadataItem,
  objectNameSingular,
}: UseCreateFormFieldsArgs): UseCreateFormFieldsResult => {
  const {
    inlineFieldMetadataItems,
    inlineRelationFieldMetadataItems,
    boxedRelationFieldMetadataItems,
  } = useFieldListFieldMetadataItems({
    objectNameSingular,
    showRelationSections: true,
    excludeCreatedAtAndUpdatedAt: true,
  });

  const fieldsByName = useMemo(
    () => mapArrayToObject(objectMetadataItem.fields, ({ name }) => name),
    [objectMetadataItem.fields],
  );

  const orderedFieldMetadataItems = useMemo(
    () =>
      [
        ...(inlineRelationFieldMetadataItems ?? []),
        ...(inlineFieldMetadataItems ?? []),
        ...(boxedRelationFieldMetadataItems ?? []),
      ].filter(Boolean) as FieldMetadataItem[],
    [
      inlineRelationFieldMetadataItems,
      inlineFieldMetadataItems,
      boxedRelationFieldMetadataItems,
    ],
  );

  const fieldPositions = useMemo(() => {
    const positions = new Map<string, number>();
    let currentPosition = 0;

    orderedFieldMetadataItems.forEach((fieldMetadataItem) => {
      if (!positions.has(fieldMetadataItem.name)) {
        positions.set(fieldMetadataItem.name, currentPosition);
        currentPosition += 1;
      }
    });

    return positions;
  }, [orderedFieldMetadataItems]);

  const relationFieldMetadataItems = useMemo(
    () =>
      orderedFieldMetadataItems.filter(
        (fieldMetadataItem) =>
          fieldMetadataItem.type === FieldMetadataType.RELATION &&
          fieldMetadataItem.isSystem !== true,
      ),
    [orderedFieldMetadataItems],
  );

  const { renderableFieldMap, relationFieldConfigs } = useMemo(() => {
    const map = new Map<string, RenderableCreateFieldConfig>();
    const relationConfigs: RelationFieldConfig[] = [];
    let fallbackPosition = fieldPositions.size;

    relationFieldMetadataItems.forEach((relationFieldMetadataItem) => {
      if (
        relationFieldMetadataItem.relation?.type !== RelationType.MANY_TO_ONE
      ) {
        return;
      }

      const relationFieldName = relationFieldMetadataItem.name;

      const relationIdFieldName =
        relationFieldMetadataItem.settings?.joinColumnName ??
        getForeignKeyNameFromRelationFieldName(relationFieldName);

      const relationIdFieldMetadataItem = fieldsByName[relationIdFieldName];

      if (!relationIdFieldMetadataItem) {
        return;
      }

      const position =
        fieldPositions.get(relationFieldName) ??
        fieldPositions.get(relationIdFieldName) ??
        fallbackPosition++;

      map.set(relationFieldName, {
        fieldName: relationFieldName,
        position,
        sourceFieldMetadataItem: relationFieldMetadataItem,
        relationIdFieldName,
      });

      relationConfigs.push({
        relationFieldName,
        relationIdFieldName,
        label: relationFieldMetadataItem.label,
      });
    });

    Object.values(fieldsByName).forEach((fieldMetadataItem) => {
      if (!fieldMetadataItem) {
        return;
      }

      const fieldName = fieldMetadataItem.name;

      if (map.has(fieldName)) {
        return;
      }

      if (fieldMetadataItem.type === FieldMetadataType.RELATION) {
        return;
      }

      const position = fieldPositions.get(fieldName) ?? fallbackPosition++;

      map.set(fieldName, {
        fieldName,
        position,
        sourceFieldMetadataItem: fieldMetadataItem,
      });
    });

    return {
      renderableFieldMap: map,
      relationFieldConfigs: relationConfigs,
    };
  }, [fieldPositions, fieldsByName, relationFieldMetadataItems]);

  const getRenderableField = useCallback(
    (fieldName: string) => renderableFieldMap.get(fieldName) ?? null,
    [renderableFieldMap],
  );

  return {
    getRenderableField,
    fieldsByName,
    relationFieldMetadataItems,
    relationFieldConfigs,
  };
};
