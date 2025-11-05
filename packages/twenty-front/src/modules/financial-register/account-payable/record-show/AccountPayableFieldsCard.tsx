/* @kvoip-woulz proprietary */
import styled from '@emotion/styled';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordFieldList } from '@/object-record/record-field-list/components/RecordFieldList';
import { RecordDetailDuplicatesSection } from '@/object-record/record-field-list/record-detail-section/duplicate/components/RecordDetailDuplicatesSection';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { PropertyBoxSkeletonLoader } from '@/object-record/record-inline-cell/property-box/components/PropertyBoxSkeletonLoader';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import {
  AccountPayableFieldSection,
  getAccountPayableFieldSectionLabel,
} from '../types/FieldsSection';

type AccountPayableFieldsCardProps = {
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

const StyledFinancialFieldsGreyBox = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: ${({ theme }) => `1px solid ${theme.border.color.medium}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledPaymentInfoFieldsGreyBox = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: ${({ theme }) => `1px solid ${theme.border.color.medium}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const AccountPayableFieldsCard = ({
  objectNameSingular,
  objectRecordId,
}: AccountPayableFieldsCardProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.AccountPayable,
  });

  const { isPrefetchLoading } = useRecordShowContainerData({
    objectRecordId,
  });

  // Define fields for each section
  const basicInfoFields = ['company', 'dueDate', 'status'];
  const financialFields = ['amount'];
  const paymentInfoFields = ['barcode'];

  // Get field IDs for exclusion
  const basicInfoFieldIds = objectMetadataItem.fields
    .filter((f) => basicInfoFields.includes(f.name))
    .map((f) => f.id);

  const financialFieldIds = objectMetadataItem.fields
    .filter((f) => financialFields.includes(f.name))
    .map((f) => f.id);

  const paymentInfoFieldIds = objectMetadataItem.fields
    .filter((f) => paymentInfoFields.includes(f.name))
    .map((f) => f.id);

  const allDisplayedFieldIds = [
    ...basicInfoFieldIds,
    ...financialFieldIds,
    ...paymentInfoFieldIds,
  ];

  // Fields to exclude from each section
  const excludeFromBasicInfo = objectMetadataItem.fields
    .filter((f) => !basicInfoFields.includes(f.name))
    .map((f) => f.id);

  const excludeFromFinancial = objectMetadataItem.fields
    .filter((f) => !financialFields.includes(f.name))
    .map((f) => f.id);

  const excludeFromPaymentInfo = objectMetadataItem.fields
    .filter((f) => !paymentInfoFields.includes(f.name))
    .map((f) => f.id);

  const excludeFromOthers = allDisplayedFieldIds;

  return (
    <>
      <PropertyBox>
        {isPrefetchLoading ? (
          <PropertyBoxSkeletonLoader />
        ) : (
          <>
            {/* Basic Info Section */}
            <StyledFieldsSectionContainer>
              <RecordFieldList
                instanceId={`account-payable-basic-${objectRecordId}`}
                objectNameSingular={objectNameSingular}
                objectRecordId={objectRecordId}
                showDuplicatesSection={false}
                excludeFieldMetadataIds={excludeFromBasicInfo}
              />
            </StyledFieldsSectionContainer>

            {/* Financial Section */}
            <StyledFieldsSectionContainer>
              <StyledSectionTitle>
                {getAccountPayableFieldSectionLabel(
                  AccountPayableFieldSection.Financial,
                )}
              </StyledSectionTitle>
              <StyledFinancialFieldsGreyBox>
                <RecordFieldList
                  instanceId={`account-payable-financial-${objectRecordId}`}
                  objectNameSingular={objectNameSingular}
                  objectRecordId={objectRecordId}
                  showDuplicatesSection={false}
                  excludeFieldMetadataIds={excludeFromFinancial}
                />
              </StyledFinancialFieldsGreyBox>
            </StyledFieldsSectionContainer>

            {/* Payment Info Section */}
            <StyledFieldsSectionContainer>
              <StyledSectionTitle>
                {getAccountPayableFieldSectionLabel(
                  AccountPayableFieldSection.PaymentInfo,
                )}
              </StyledSectionTitle>
              <StyledPaymentInfoFieldsGreyBox>
                <RecordFieldList
                  instanceId={`account-payable-payment-${objectRecordId}`}
                  objectNameSingular={objectNameSingular}
                  objectRecordId={objectRecordId}
                  showDuplicatesSection={false}
                  excludeFieldMetadataIds={excludeFromPaymentInfo}
                />
              </StyledPaymentInfoFieldsGreyBox>
            </StyledFieldsSectionContainer>

            {/* Others Section (if any fields remain) */}
            {objectMetadataItem.fields.some(
              (f) => !allDisplayedFieldIds.includes(f.id),
            ) && (
              <StyledFieldsSectionContainer>
                <RecordFieldList
                  instanceId={`account-payable-others-${objectRecordId}`}
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
