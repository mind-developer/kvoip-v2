/* @kvoip-woulz proprietary */
import styled from '@emotion/styled';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { RecordFieldListCellEditModePortal } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListCellEditModePortal';
import { RecordFieldListCellHoveredPortal } from '@/object-record/record-field-list/anchored-portal/components/RecordFieldListCellHoveredPortal';
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
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { IconDeviceFloppy } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';
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

const StyledAdditionalInfoFieldsGreyBox = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: ${({ theme }) => `1px solid ${theme.border.color.medium}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledSystemInfoFieldsGreyBox = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: ${({ theme }) => `1px solid ${theme.border.color.medium}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(2)};
`;

/* @kvoip-woulz proprietary:begin */
const StyledButtonContainer = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.spacing(2)} 0;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledSaveButton = styled(Button)`
  width: 100%;
  border-width: 3px !important;
`;
/* @kvoip-woulz proprietary:end */

export const AccountPayableFieldsCard = ({
  objectNameSingular,
  objectRecordId,
}: AccountPayableFieldsCardProps) => {
  const instanceId = `account-payable-fields-${objectRecordId}`;

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.AccountPayable,
  });

  const { isPrefetchLoading, recordLoading } = useRecordShowContainerData({
    objectRecordId,
  });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular,
    objectRecordId,
  });

  const isRecordReadOnly = useIsRecordReadOnly({
    recordId: objectRecordId,
    objectMetadataId: objectMetadataItem.id,
  });

  const setRecordFieldListHoverPosition = useSetRecoilComponentState(
    recordFieldListHoverPositionComponentState,
    instanceId,
  );

  const handleMouseEnter = (index: number) => {
    setRecordFieldListHoverPosition(index);
  };

  // Field organization by section (cpfCnpj excluded as it's the label identifier)
  const basicInfoFields = ['company', 'dueDate', 'status'];
  const financialFields = ['amount'];
  const paymentInfoFields = ['paymentType', 'barcode', 'pixKey', 'paymentDate'];
  const additionalInfoFields = ['message'];
  const systemFields = ['createdBy', 'updatedAt'];

  const fieldsByName = mapArrayToObject(
    objectMetadataItem.fields,
    ({ name }) => name,
  );

  const objectPermissions = getObjectPermissionsFromMapByObjectMetadataId({
    objectPermissionsByObjectMetadataId,
    objectMetadataId: objectMetadataItem.id,
  });

  const renderField = (fieldName: string, globalIndex: number) => {
    const fieldMetadataItem = fieldsByName[fieldName];

    if (!fieldMetadataItem) {
      console.warn(`[AccountPayableFieldsCard] Field not found: ${fieldName}`);
      return null;
    }

    return (
      <FieldContext.Provider
        key={fieldName}
        value={{
          recordId: objectRecordId,
          maxWidth: 200,
          isLabelIdentifier: false,
          fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
            field: fieldMetadataItem,
            position: globalIndex,
            objectMetadataItem,
            showLabel: true,
            labelWidth: 90,
          }),
          useUpdateRecord: useUpdateOneObjectRecordMutation,
          isDisplayModeFixHeight: true,
          onMouseEnter: () => handleMouseEnter(globalIndex),
          anchorId: `${getRecordFieldInputInstanceId({
            recordId: objectRecordId,
            fieldName: fieldMetadataItem.name,
            prefix: instanceId,
          })}`,
          isRecordFieldReadOnly: isRecordFieldReadOnly({
            isRecordReadOnly,
            objectPermissions,
            fieldMetadataItem: {
              id: fieldMetadataItem.id,
              isUIReadOnly: fieldMetadataItem.isUIReadOnly ?? false,
            },
          }),
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
  };

  let globalIndex = 0;

  return (
    <RecordFieldListComponentInstanceContext.Provider value={{ instanceId }}>
      <PropertyBox>
        {isPrefetchLoading ? (
          <PropertyBoxSkeletonLoader />
        ) : (
          <>
            {/* Basic Info Section */}
            <StyledFieldsSectionContainer>
              {basicInfoFields.map((fieldName) =>
                renderField(fieldName, globalIndex++),
              )}
            </StyledFieldsSectionContainer>

            {/* Financial Section */}
            <StyledFieldsSectionContainer>
              <StyledSectionTitle>
                {getAccountPayableFieldSectionLabel(
                  AccountPayableFieldSection.Financial,
                )}
              </StyledSectionTitle>
              <StyledFinancialFieldsGreyBox>
                {financialFields.map((fieldName) =>
                  renderField(fieldName, globalIndex++),
                )}
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
                {paymentInfoFields.map((fieldName) =>
                  renderField(fieldName, globalIndex++),
                )}
              </StyledPaymentInfoFieldsGreyBox>
            </StyledFieldsSectionContainer>

            {/* Additional Info Section */}
            <StyledFieldsSectionContainer>
              <StyledSectionTitle>
                {getAccountPayableFieldSectionLabel(
                  AccountPayableFieldSection.AdditionalInfo,
                )}
              </StyledSectionTitle>
              <StyledAdditionalInfoFieldsGreyBox>
                {additionalInfoFields.map((fieldName) =>
                  renderField(fieldName, globalIndex++),
                )}
              </StyledAdditionalInfoFieldsGreyBox>
            </StyledFieldsSectionContainer>

            {/* System Info Section */}
            <StyledFieldsSectionContainer>
              <StyledSectionTitle>
                {getAccountPayableFieldSectionLabel(
                  AccountPayableFieldSection.SystemInfo,
                )}
              </StyledSectionTitle>
              <StyledSystemInfoFieldsGreyBox>
                {systemFields.map((fieldName) =>
                  renderField(fieldName, globalIndex++),
                )}
              </StyledSystemInfoFieldsGreyBox>
            </StyledFieldsSectionContainer>

            {/* @kvoip-woulz proprietary:begin */}
            {/* Action Buttons */}
            <StyledButtonContainer>
              <StyledSaveButton
                variant="secondary"
                accent="blue"
                title="Save"
                Icon={IconDeviceFloppy}
                justify="center"
                fullWidth
                onClick={() => {
                  console.log('Save clicked - functionality to be implemented');
                }}
              />
            </StyledButtonContainer>
            {/* @kvoip-woulz proprietary:end */}
          </>
        )}
      </PropertyBox>

      {!isPrefetchLoading && (
        <>
          <RecordDetailDuplicatesSection
            objectRecordId={objectRecordId}
            objectNameSingular={objectNameSingular}
          />
          <RecordFieldListCellHoveredPortal
            objectMetadataItem={objectMetadataItem}
            recordId={objectRecordId}
          />
          <RecordFieldListCellEditModePortal
            objectMetadataItem={objectMetadataItem}
            recordId={objectRecordId}
          />
        </>
      )}
    </RecordFieldListComponentInstanceContext.Provider>
  );
};
