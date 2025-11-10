import styled from '@emotion/styled';
import groupBy from 'lodash.groupby';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { RecordDetailDuplicatesSection } from '@/object-record/record-field-list/record-detail-section/duplicate/components/RecordDetailDuplicatesSection';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { PropertyBoxSkeletonLoader } from '@/object-record/record-inline-cell/property-box/components/PropertyBoxSkeletonLoader';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { type Traceable } from '@/traceable/types/Traceable';
import { useLingui } from '@lingui/react/macro';
import { type ReactElement } from 'react';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';
import {
  TraceableFieldSection,
  getTraceableFieldSectionLabel,
} from '../types/FieldsSection';

type TraceableFieldsCardProps = {
  objectNameSingular: string;
  objectRecordId: string;
};

type TraceableFieldsKeys = keyof Traceable;

const INPUT_ID_PREFIX = 'traceable-fields-card';

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
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Traceable,
  });

  const fieldsToDisplay: (keyof Traceable)[] = [
    'name',
    'websiteUrl',
    'campaignName',
    'campaignSource',
    'meansOfCommunication',
    'keyword',
    'campaignContent',
    'generatedUrl',
  ];

  const fieldsByName = mapArrayToObject(
    objectMetadataItem.fields,
    ({ name }) => name,
  );

  const { isPrefetchLoading, recordLoading } = useRecordShowContainerData({
    objectRecordId,
  });

  const { t } = useLingui();

  const { objectMetadataItem: objectMetadataItemTraceable } =
    useObjectMetadataItem({
      objectNameSingular,
    });

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular,
    objectRecordId,
  });

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: objectRecordId,
    objectMetadataId: objectMetadataItemTraceable.id,
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
  } = groupBy(fieldsToDisplay, (fieldKey) => {
    if (urlFieldKey.includes(fieldKey)) return 'urlInlineFieldMetadataItem';
    if (utmFieldsKeys.includes(fieldKey)) return 'utmInlineFieldsMetadataItems';
    if (generatedFieldsKeys.includes(fieldKey))
      return 'generatedInlineFieldsMetadataItems';
    else return 'inlineOthersFieldMetadataItems';
  });

  const fieldsMetadataMapper = (fieldsToDisplay: TraceableFieldsKeys[]) =>
    fieldsToDisplay.map((fieldName, index) => (
      <FieldContext.Provider
        key={fieldName}
        value={{
          recordId: objectRecordId,
          maxWidth: 200,
          isLabelIdentifier: false,
          fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
            field: fieldsByName[fieldName],
            position: index,
            objectMetadataItem: objectMetadataItemTraceable,
            showLabel: true,
            labelWidth: 90,
          }),
          useUpdateRecord: useUpdateOneObjectRecordMutation,
          isDisplayModeFixHeight: true,
          isRecordFieldReadOnly: isRecordReadOnly,
        }}
      >
        <RecordFieldComponentInstanceContext.Provider
          value={{
            instanceId: getRecordFieldInputInstanceId({
              recordId: objectRecordId,
              fieldName,
              prefix: INPUT_ID_PREFIX,
            }),
          }}
        >
          <RecordInlineCell loading={recordLoading} />
        </RecordFieldComponentInstanceContext.Provider>
      </FieldContext.Provider>
    ));

  const TRACEABLE_FIELDS_METADATA_SECTIONS_RECORD: Record<
    string,
    ReactElement | ReactElement[]
  > = {
    [getTraceableFieldSectionLabel(TraceableFieldSection.Sumary)]: (
      <>{fieldsMetadataMapper(urlInlineFieldMetadataItem)}</>
    ),
    [getTraceableFieldSectionLabel(TraceableFieldSection.UTM)]: (
      <StyledUtmFieldsGreyBox>
        {fieldsMetadataMapper(utmInlineFieldsMetadataItems)}
      </StyledUtmFieldsGreyBox>
    ),
    [getTraceableFieldSectionLabel(TraceableFieldSection.TraceableLinks)]: (
      <StyledTraceableLinksFieldsBox>
        {t`Use the 'Traceable URL' link in any promotinal channels you want to be associated with this custom campaign.`}
        {fieldsMetadataMapper(generatedInlineFieldsMetadataItems)}
      </StyledTraceableLinksFieldsBox>
    ),
    [getTraceableFieldSectionLabel(TraceableFieldSection.Others)]: (
      <>{fieldsMetadataMapper(inlineOthersFieldMetadataItems ?? [])}</>
    ),
  };

  return (
    <>
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
    </>
  );
};
