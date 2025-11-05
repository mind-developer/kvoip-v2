/* @kvoip-woulz proprietary */
import styled from '@emotion/styled';
import groupBy from 'lodash.groupby';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
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
import { type ReactElement } from 'react';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';
import {
  AccountPayableFieldSection,
  getAccountPayableFieldSectionLabel,
} from '../types/FieldsSection';

type AccountPayableFieldsCardProps = {
  objectNameSingular: string;
  objectRecordId: string;
};

const INPUT_ID_PREFIX = 'account-payable-fields-card';

const StyledFieldsSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledFinancialFieldsGreyBox = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: ${({ theme }) => `1px solid ${theme.border.color.medium}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  height: 'auto';

  padding: ${({ theme }) => theme.spacing(2)};

  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledPaymentInfoFieldsGreyBox = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: ${({ theme }) => `1px solid ${theme.border.color.medium}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  height: 'auto';

  padding: ${({ theme }) => theme.spacing(2)};

  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const AccountPayableFieldsCard = ({
  objectNameSingular,
  objectRecordId,
}: AccountPayableFieldsCardProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.AccountPayable,
  });

  const fieldsToDisplay: string[] = [
    'company',
    'dueDate',
    'status',
    'amount',
    'barcode',
  ];

  const fieldsByName = mapArrayToObject(
    objectMetadataItem.fields,
    ({ name }) => name,
  );

  const { isPrefetchLoading, recordLoading } = useRecordShowContainerData({
    objectRecordId,
  });

  const { objectMetadataItem: objectMetadataItemAccountPayable } =
    useObjectMetadataItem({
      objectNameSingular,
    });
  const { objectMetadataItems } = useObjectMetadataItems();

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular,
    objectRecordId,
  });

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: objectRecordId,
    objectMetadataId: objectMetadataItemAccountPayable.id,
  });

  const basicInfoFieldsKeys: string[] = ['company', 'dueDate', 'status'];
  const financialFieldsKeys: string[] = ['amount'];
  const paymentInfoFieldsKeys: string[] = ['barcode'];

  const {
    basicInfoInlineFieldsMetadataItems,
    financialInlineFieldsMetadataItems,
    paymentInfoInlineFieldsMetadataItems,
    inlineOthersFieldMetadataItems,
  } = groupBy(fieldsToDisplay, (fieldKey) => {
    if (basicInfoFieldsKeys.includes(fieldKey))
      return 'basicInfoInlineFieldsMetadataItems';
    if (financialFieldsKeys.includes(fieldKey))
      return 'financialInlineFieldsMetadataItems';
    if (paymentInfoFieldsKeys.includes(fieldKey))
      return 'paymentInfoInlineFieldsMetadataItems';
    else return 'inlineOthersFieldMetadataItems';
  });

  const fieldsMetadataMapper = (fieldsToDisplay: string[]) =>
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
            objectMetadataItem: objectMetadataItemAccountPayable,
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

  const ACCOUNT_PAYABLE_FIELDS_METADATA_SECTIONS_RECORD: Record<
    string,
    ReactElement | ReactElement[]
  > = {
    [getAccountPayableFieldSectionLabel(AccountPayableFieldSection.BasicInfo)]:
      <>{fieldsMetadataMapper(basicInfoInlineFieldsMetadataItems ?? [])}</>,
    [getAccountPayableFieldSectionLabel(AccountPayableFieldSection.Financial)]:
      (
        <StyledFinancialFieldsGreyBox>
          {fieldsMetadataMapper(financialInlineFieldsMetadataItems ?? [])}
        </StyledFinancialFieldsGreyBox>
      ),
    [getAccountPayableFieldSectionLabel(
      AccountPayableFieldSection.PaymentInfo,
    )]: (
      <StyledPaymentInfoFieldsGreyBox>
        {fieldsMetadataMapper(paymentInfoInlineFieldsMetadataItems ?? [])}
      </StyledPaymentInfoFieldsGreyBox>
    ),
    [getAccountPayableFieldSectionLabel(AccountPayableFieldSection.Others)]: (
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
            {Object.entries(
              ACCOUNT_PAYABLE_FIELDS_METADATA_SECTIONS_RECORD,
            ).map(([label, fields]) => (
              <StyledFieldsSectionContainer key={label}>
                {!label.startsWith('no-label') && <>{label}</>}
                {fields}
              </StyledFieldsSectionContainer>
            ))}
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
