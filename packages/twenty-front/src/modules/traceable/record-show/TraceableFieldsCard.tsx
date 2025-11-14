import styled from '@emotion/styled';
import groupBy from 'lodash.groupby';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { RecordFieldListCellEditModePortal } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListCellEditModePortal';
import { RecordFieldListCellHoveredPortal } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListCellHoveredPortal';
import { useFieldListFieldMetadataItems } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems';
import { RecordDetailDuplicatesSection } from '@/object-record/record-field-list/record-detail-section/duplicate/components/RecordDetailDuplicatesSection';
import { RecordFieldListComponentInstanceContext } from '@/object-record/record-field-list/states/contexts/RecordFieldListComponentInstanceContext';
import { recordFieldListHoverPositionComponentState } from '@/object-record/record-field-list/states/recordFieldListHoverPositionComponentState';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { PropertyBoxSkeletonLoader } from '@/object-record/record-inline-cell/property-box/components/PropertyBoxSkeletonLoader';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { type Traceable } from '@/traceable/types/Traceable';
import { useIsInRightDrawerOrThrow } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useLingui } from '@lingui/react/macro';
import { type ReactElement } from 'react';
import {
  TraceableFieldSection,
  getTraceableFieldSectionLabel,
} from '../types/FieldsSection';

type TraceableFieldsCardProps = {
  objectNameSingular: string;
  objectRecordId: string;
};

type TraceableFieldsKeys = keyof Traceable;

const StyledFieldsSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledUtmFieldsGreyBox = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: ${({ theme }) => `1px solid ${theme.border.color.medium}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  height: 'auto';

  padding: ${({ theme }) => theme.spacing(2)};

  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledTraceableLinksFieldsBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

export const TraceableFieldsCard = ({
  objectNameSingular,
  objectRecordId,
}: TraceableFieldsCardProps) => {
  const { isPrefetchLoading, recordLoading } = useRecordShowContainerData({
    objectRecordId,
  });

  const { objectMetadataItem: objectMetadataItemTraceable } =
    useObjectMetadataItem({
      objectNameSingular,
    });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular,
    objectRecordId,
  });

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: objectRecordId,
    objectMetadataId: objectMetadataItemTraceable.id,
  });

  const { t } = useLingui();

  const { isInRightDrawer } = useIsInRightDrawerOrThrow();

  const instanceId = `traceable-fields-card-${objectRecordId}-${isInRightDrawer ? 'right-drawer' : ''}`;

  const setRecordFieldListHoverPosition = useSetRecoilComponentState(
    recordFieldListHoverPositionComponentState,
    instanceId,
  );

  const handleMouseEnter = (index: number) => {
    setRecordFieldListHoverPosition(index);
  };

  const { inlineFieldMetadataItems: traceableInlineFieldMetadataItems } =
    useFieldListFieldMetadataItems({
      objectNameSingular,
      showRelationSections: true,
      excludeCreatedAtAndUpdatedAt: true,
    });

  const urlFieldKey: TraceableFieldsKeys[] = ['websiteUrl'];

  const utmFieldsKeys: TraceableFieldsKeys[] = [
    'campaignName',
    'campaignSource',
    'meansOfCommunication',
    'keyword',
    'campaignContent',
  ];

  const generatedFieldsKeys: TraceableFieldsKeys[] = ['generatedUrl', 'url'];

  const {
    urlInlineFieldMetadataItem,
    utmInlineFieldsMetadataItems,
    generatedInlineFieldsMetadataItems,
    inlineOthersFieldMetadataItems,
  } = groupBy(traceableInlineFieldMetadataItems, (fieldMetadataItem) => {
    if (urlFieldKey.includes(fieldMetadataItem.name as keyof Traceable))
      return 'urlInlineFieldMetadataItem';
    if (utmFieldsKeys.includes(fieldMetadataItem.name as keyof Traceable))
      return 'utmInlineFieldsMetadataItems';
    if (generatedFieldsKeys.includes(fieldMetadataItem.name as keyof Traceable))
      return 'generatedInlineFieldsMetadataItems';
    else return 'inlineOthersFieldMetadataItems';
  });

  const fieldsMetadataMapper = (fieldsToDisplay: FieldMetadataItem[]) =>
    fieldsToDisplay.map((fieldMetadataItem, index) => {
      // Find the original index in the sorted array for the portal
      const originalIndex = traceableInlineFieldMetadataItems.findIndex(
        (item) => item.id === fieldMetadataItem.id,
      );

      return (
        <FieldContext.Provider
          key={objectRecordId + fieldMetadataItem.id}
          value={{
            recordId: objectRecordId,
            maxWidth: 200,
            isLabelIdentifier: false,
            fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
              field: fieldMetadataItem,
              position: index,
              objectMetadataItem: objectMetadataItemTraceable,
              showLabel: true,
              labelWidth: 90,
            }),
            useUpdateRecord: useUpdateOneObjectRecordMutation,
            isDisplayModeFixHeight: true,
            isRecordFieldReadOnly: isRecordFieldReadOnly({
              isRecordReadOnly,
              objectPermissions: getObjectPermissionsFromMapByObjectMetadataId({
                objectPermissionsByObjectMetadataId,
                objectMetadataId: objectMetadataItemTraceable.id,
              }),
              fieldMetadataItem: {
                id: fieldMetadataItem.id,
                isUIReadOnly: fieldMetadataItem.isUIReadOnly ?? false,
              },
            }),
            onMouseEnter: () => handleMouseEnter(originalIndex),
            anchorId: `${getRecordFieldInputInstanceId({
              recordId: objectRecordId,
              fieldName: fieldMetadataItem.name,
              prefix: instanceId,
            })}`,
          }}
        >
          <RecordFieldComponentInstanceContext.Provider
            value={{
              instanceId: getRecordFieldInputInstanceId({
                recordId: objectRecordId,
                fieldName: fieldMetadataItem.name,
                prefix: instanceId,
              }),
            }}
          >
            <RecordInlineCell
              loading={recordLoading}
              instanceIdPrefix={instanceId}
            />
          </RecordFieldComponentInstanceContext.Provider>
        </FieldContext.Provider>
      );
    });

  const TRACEABLE_FIELDS_METADATA_SECTIONS_RECORD: Record<
    string,
    ReactElement | ReactElement[]
  > = {
    [getTraceableFieldSectionLabel(TraceableFieldSection.Sumary)]: (
      <>{fieldsMetadataMapper(urlInlineFieldMetadataItem || [])}</>
    ),
    [getTraceableFieldSectionLabel(TraceableFieldSection.UTM)]: (
      <StyledUtmFieldsGreyBox>
        {fieldsMetadataMapper(utmInlineFieldsMetadataItems || [])}
      </StyledUtmFieldsGreyBox>
    ),
    [getTraceableFieldSectionLabel(TraceableFieldSection.TraceableLinks)]: (
      <StyledTraceableLinksFieldsBox>
        {t`Use the 'Traceable URL' link in any promotinal channels you want to be associated with this custom campaign.`}
        {fieldsMetadataMapper(generatedInlineFieldsMetadataItems || [])}
      </StyledTraceableLinksFieldsBox>
    ),
    [getTraceableFieldSectionLabel(TraceableFieldSection.Others)]: (
      <>{fieldsMetadataMapper(inlineOthersFieldMetadataItems || [])}</>
    ),
  };

  return (
    <>
      <RecordFieldListComponentInstanceContext.Provider
        value={{
          instanceId,
        }}
      >
        <PropertyBox>
          {isPrefetchLoading ? (
            <PropertyBoxSkeletonLoader />
          ) : (
            <>
              {Object.entries(TRACEABLE_FIELDS_METADATA_SECTIONS_RECORD).map(
                ([label, fields]) => (
                  <StyledFieldsSectionContainer>
                    {!label.startsWith('no-label') && <>{label}</>}
                    {fields}
                  </StyledFieldsSectionContainer>
                ),
              )}
            </>
          )}
        </PropertyBox>
        <RecordDetailDuplicatesSection
          objectRecordId={objectRecordId}
          objectNameSingular={objectNameSingular}
        />
        <RecordFieldListCellHoveredPortal
          objectMetadataItem={objectMetadataItemTraceable}
          recordId={objectRecordId}
        />
        <RecordFieldListCellEditModePortal
          objectMetadataItem={objectMetadataItemTraceable}
          recordId={objectRecordId}
        />
      </RecordFieldListComponentInstanceContext.Provider>
    </>
  );
};
