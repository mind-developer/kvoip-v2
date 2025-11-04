/* @kvoip-woulz proprietary */
import styled from '@emotion/styled';
import groupBy from 'lodash.groupby';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';

import { type FinancialRegister } from '@/financial-register/types/FinancialRegister';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { RecordDetailDuplicatesSection } from '@/object-record/record-field-list/record-detail-section/duplicate/components/RecordDetailDuplicatesSection';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { PropertyBoxSkeletonLoader } from '@/object-record/record-inline-cell/property-box/components/PropertyBoxSkeletonLoader';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { useRecordShowContainerData } from '@/object-record/record-show/hooks/useRecordShowContainerData';
import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useLingui } from '@lingui/react/macro';
import { type ReactElement } from 'react';
import { useRecoilValue } from 'recoil';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';
import {
  FinancialRegisterFieldSection,
  getFinancialRegisterFieldSectionLabel,
} from '../types/FieldsSection';

type FinancialRegisterFieldsCardProps = {
  objectNameSingular: string;
  objectRecordId: string;
};

type FinancialRegisterFieldsKeys = keyof FinancialRegister;

const INPUT_ID_PREFIX = 'financial-register-fields-card';

const StyledFieldsSectionContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSectionTitle = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledReceivableFieldsBox = styled.div`
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: ${({ theme }) => `1px solid ${theme.color.blue}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(2)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledPayableFieldsBox = styled.div`
  background: ${({ theme }) => theme.background.transparent.lighter};
  border: ${({ theme }) => `1px solid ${theme.color.orange}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(2)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const FinancialRegisterFieldsCard = ({
  objectNameSingular,
  objectRecordId,
}: FinancialRegisterFieldsCardProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { isPrefetchLoading, recordLoading } = useRecordShowContainerData({
    objectRecordId,
  });

  const registerType = useRecoilValue<string | null>(
    recordStoreFamilySelector({
      recordId: objectRecordId,
      fieldName: 'registerType',
    }),
  );

  const isReceivable = registerType === 'receivable';
  const isPayable = registerType === 'payable';

  const commonFields: (keyof FinancialRegister)[] = [
    'registerType',
    'status',
    'amount',
    'dueDate',
    'cpfCnpj',
    'pixKey',
  ];

  const receivableOnlyFields: (keyof FinancialRegister)[] = [
    'documentNumber',
    'isRecharge',
    'bankSlipLink',
  ];

  const payableOnlyFields: (keyof FinancialRegister)[] = [
    'paymentType',
    'barcode',
    'paymentDate',
    'message',
  ];

  const fieldsToDisplay: (keyof FinancialRegister)[] = [
    ...commonFields,
    ...(isReceivable ? receivableOnlyFields : []),
    ...(isPayable ? payableOnlyFields : []),
  ];

  const fieldsByName = mapArrayToObject(
    objectMetadataItem.fields,
    ({ name }) => name,
  );

  const { t } = useLingui();

  const { objectMetadataItem: objectMetadataItemFinancialRegister } =
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
    objectMetadataId: objectMetadataItemFinancialRegister.id,
  });

  const basicInfoFieldKeys: FinancialRegisterFieldsKeys[] = [
    'registerType',
    'status',
    'amount',
    'dueDate',
    'cpfCnpj',
    'pixKey',
  ];

  const receivableFieldsKeys: FinancialRegisterFieldsKeys[] = [
    'documentNumber',
    'isRecharge',
    'bankSlipLink',
  ];

  const payableFieldsKeys: FinancialRegisterFieldsKeys[] = [
    'paymentType',
    'barcode',
    'paymentDate',
    'message',
  ];

  const {
    basicInfoInlineFieldMetadataItems,
    receivableInlineFieldsMetadataItems,
    payableInlineFieldsMetadataItems,
    inlineOthersFieldMetadataItems,
  } = groupBy(fieldsToDisplay, (fieldKey) => {
    if (basicInfoFieldKeys.includes(fieldKey))
      return 'basicInfoInlineFieldMetadataItems';
    if (receivableFieldsKeys.includes(fieldKey))
      return 'receivableInlineFieldsMetadataItems';
    if (payableFieldsKeys.includes(fieldKey))
      return 'payableInlineFieldsMetadataItems';
    else return 'inlineOthersFieldMetadataItems';
  });

  const fieldsMetadataMapper = (
    fieldsToDisplay: FinancialRegisterFieldsKeys[],
  ) =>
    fieldsToDisplay
      .filter((fieldName) => fieldsByName[fieldName])
      .map((fieldName, index) => (
        <FieldContext.Provider
          key={fieldName}
          value={{
            recordId: objectRecordId,
            maxWidth: 200,
            isLabelIdentifier: false,
            fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
              field: fieldsByName[fieldName],
              position: index,
              objectMetadataItem: objectMetadataItemFinancialRegister,
              showLabel: true,
              labelWidth: 120,
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

  const FINANCIAL_REGISTER_FIELDS_METADATA_SECTIONS_RECORD: Record<
    string,
    ReactElement | ReactElement[]
  > = {
    [getFinancialRegisterFieldSectionLabel(
      FinancialRegisterFieldSection.BasicInfo,
    )]: <>{fieldsMetadataMapper(basicInfoInlineFieldMetadataItems)}</>,
    ...(isReceivable
      ? {
          [getFinancialRegisterFieldSectionLabel(
            FinancialRegisterFieldSection.ReceivableSpecific,
          )]: (
            <StyledReceivableFieldsBox>
              {fieldsMetadataMapper(receivableInlineFieldsMetadataItems)}
            </StyledReceivableFieldsBox>
          ),
        }
      : {}),
    ...(isPayable
      ? {
          [getFinancialRegisterFieldSectionLabel(
            FinancialRegisterFieldSection.PayableSpecific,
          )]: (
            <StyledPayableFieldsBox>
              {fieldsMetadataMapper(payableInlineFieldsMetadataItems)}
            </StyledPayableFieldsBox>
          ),
        }
      : {}),
    [getFinancialRegisterFieldSectionLabel(
      FinancialRegisterFieldSection.Others,
    )]: <>{fieldsMetadataMapper(inlineOthersFieldMetadataItems ?? [])}</>,
  };

  return (
    <>
      <PropertyBox>
        {isPrefetchLoading ? (
          <PropertyBoxSkeletonLoader />
        ) : (
          <>
            {Object.entries(
              FINANCIAL_REGISTER_FIELDS_METADATA_SECTIONS_RECORD,
            ).map(([label, fields]) => (
              <StyledFieldsSectionContainer key={label}>
                {!label.startsWith('no-label') && (
                  <StyledSectionTitle>{label}</StyledSectionTitle>
                )}
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
