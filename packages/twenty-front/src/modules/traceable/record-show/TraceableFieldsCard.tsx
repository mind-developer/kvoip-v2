import styled from '@emotion/styled';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordFieldList } from '@/object-record/record-field-list/components/RecordFieldList';
import { RecordDetailDuplicatesSection } from '@/object-record/record-field-list/record-detail-section/duplicate/components/RecordDetailDuplicatesSection';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { PropertyBoxSkeletonLoader } from '@/object-record/record-inline-cell/property-box/components/PropertyBoxSkeletonLoader';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { useLingui } from '@lingui/react/macro';
import {
  TraceableFieldSection,
  getTraceableFieldSectionLabel,
} from '../types/FieldsSection';

type TraceableFieldsCardProps = {
  objectNameSingular: string;
  objectRecordId: string;
};

const StyledFieldsSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSectionTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledUtmFieldsGreyBox = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: ${({ theme }) => `1px solid ${theme.border.color.medium}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledTraceableLinksFieldsBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.xs};
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const TraceableFieldsCard = ({
  objectNameSingular,
  objectRecordId,
}: TraceableFieldsCardProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Traceable,
  });

  const { isPrefetchLoading } = useRecordShowContainerData({
    objectRecordId,
  });

  const { t } = useLingui();

  // Define fields for each section
  const urlFields = ['websiteUrl'];
  const utmFields = [
    'campaignName',
    'campaignSource',
    'meansOfCommunication',
    'keyword',
    'campaignContent',
  ];
  const generatedFields = ['generatedUrl', 'url'];

  // Get field IDs for exclusion
  const urlFieldIds = objectMetadataItem.fields
    .filter((f) => urlFields.includes(f.name))
    .map((f) => f.id);

  const utmFieldIds = objectMetadataItem.fields
    .filter((f) => utmFields.includes(f.name))
    .map((f) => f.id);

  const generatedFieldIds = objectMetadataItem.fields
    .filter((f) => generatedFields.includes(f.name))
    .map((f) => f.id);

  const allDisplayedFieldIds = [
    ...urlFieldIds,
    ...utmFieldIds,
    ...generatedFieldIds,
  ];

  // Fields to exclude from each section
  const excludeFromUrl = objectMetadataItem.fields
    .filter((f) => !urlFields.includes(f.name))
    .map((f) => f.id);

  const excludeFromUtm = objectMetadataItem.fields
    .filter((f) => !utmFields.includes(f.name))
    .map((f) => f.id);

  const excludeFromGenerated = objectMetadataItem.fields
    .filter((f) => !generatedFields.includes(f.name))
    .map((f) => f.id);

  const excludeFromOthers = allDisplayedFieldIds;

  return (
    <>
      <PropertyBox>
        {isPrefetchLoading ? (
          <PropertyBoxSkeletonLoader />
        ) : (
          <>
            {/* URL Section */}
            <StyledFieldsSectionContainer>
              <RecordFieldList
                instanceId={`traceable-url-${objectRecordId}`}
                objectNameSingular={objectNameSingular}
                objectRecordId={objectRecordId}
                showDuplicatesSection={false}
                excludeFieldMetadataIds={excludeFromUrl}
              />
            </StyledFieldsSectionContainer>

            {/* UTM Section */}
            <StyledFieldsSectionContainer>
              <StyledSectionTitle>
                {getTraceableFieldSectionLabel(TraceableFieldSection.UTM)}
              </StyledSectionTitle>
              <StyledUtmFieldsGreyBox>
                <RecordFieldList
                  instanceId={`traceable-utm-${objectRecordId}`}
                  objectNameSingular={objectNameSingular}
                  objectRecordId={objectRecordId}
                  showDuplicatesSection={false}
                  excludeFieldMetadataIds={excludeFromUtm}
                />
              </StyledUtmFieldsGreyBox>
            </StyledFieldsSectionContainer>

            {/* Traceable Links Section */}
            <StyledFieldsSectionContainer>
              <StyledSectionTitle>
                {getTraceableFieldSectionLabel(
                  TraceableFieldSection.TraceableLinks,
                )}
              </StyledSectionTitle>
              <StyledTraceableLinksFieldsBox>
                <div>{t`Use the 'Traceable URL' link in any promotinal channels you want to be associated with this custom campaign.`}</div>
                <RecordFieldList
                  instanceId={`traceable-generated-${objectRecordId}`}
                  objectNameSingular={objectNameSingular}
                  objectRecordId={objectRecordId}
                  showDuplicatesSection={false}
                  excludeFieldMetadataIds={excludeFromGenerated}
                />
              </StyledTraceableLinksFieldsBox>
            </StyledFieldsSectionContainer>

            {/* Others Section (if any fields remain) */}
            {objectMetadataItem.fields.some(
              (f) => !allDisplayedFieldIds.includes(f.id),
            ) && (
              <StyledFieldsSectionContainer>
                <RecordFieldList
                  instanceId={`traceable-others-${objectRecordId}`}
                  objectNameSingular={objectNameSingular}
                  objectRecordId={objectRecordId}
                  showDuplicatesSection={false}
                  excludeFieldMetadataIds={excludeFromOthers}
                />
              </StyledFieldsSectionContainer>
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
