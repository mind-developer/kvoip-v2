/* @kvoip-woulz proprietary */
import styled from '@emotion/styled';
import { useCallback, useMemo, useState } from 'react';

import { useCommandMenuHistory } from '@/command-menu/hooks/useCommandMenuHistory';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useIsRecordReadOnly } from '@/object-record/read-only/hooks/useIsRecordReadOnly';
import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { RecordCreateField } from '@/object-record/record-create/components/RecordCreateField';
import { RecordCreateProvider } from '@/object-record/record-create/components/RecordCreateProvider';
import { useRecordCreateContext } from '@/object-record/record-create/hooks/useRecordCreateContext';
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
import { AppPath } from '@/types/AppPath';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconDeviceFloppy,
  IconFileImport,
  IconFileText,
  IconPlus,
  type IconComponent,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';
import {
  AccountPayableFieldSection,
  getAccountPayableFieldSectionLabel,
} from '../types/FieldsSection';
/* @kvoip-woulz proprietary:begin */
import {
  ACCOUNT_PAYABLE_ADDITIONAL_INFO_FIELDS,
  ACCOUNT_PAYABLE_BASIC_FIELDS,
  ACCOUNT_PAYABLE_FINANCIAL_FIELDS,
  ACCOUNT_PAYABLE_PAYMENT_INFO_FIELDS,
  ACCOUNT_PAYABLE_SYSTEM_FIELDS,
} from '../config/accountPayableFieldGroups';
/* @kvoip-woulz proprietary:end */

type AccountPayableFieldsCardProps = {
  objectNameSingular: string;
  objectRecordId: string;
  isInRightDrawer?: boolean;
};

type ActionDropdownItem = {
  id: string;
  label: string;
  icon: IconComponent;
  onSelect: () => void;
  confirmation?: {
    title: string;
    subtitle: string;
    confirmButtonText?: string;
  };
};

const ACCOUNT_PAYABLE_ACTION_ITEMS: ActionDropdownItem[] = [
  {
    id: 'generate-invoice',
    label: 'Generate Invoice',
    icon: IconFileText,
    onSelect: () => undefined,
    confirmation: {
      title: 'Generate Invoice',
      subtitle:
        'Are you sure you want to generate an invoice for this payable?',
      confirmButtonText: 'Generate Invoice',
    },
  },
  {
    id: 'generate-bank-slip',
    label: 'Generate Bank Slip',
    icon: IconFileImport,
    onSelect: () => undefined,
    confirmation: {
      title: 'Generate Bank Slip',
      subtitle:
        'Are you sure you want to generate a bank slip for this payable?',
      confirmButtonText: 'Generate Bank Slip',
    },
  },
];

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
const StyledCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledCardHeaderActions = styled.div`
  margin-left: auto;
  display: flex;
`;

const StyledCardHeaderDivider = styled.div`
  height: 1px;
  width: 100%;
  background: ${({ theme }) => theme.border.color.medium};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledTitleFieldContainer = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
`;

const StyledActionsButton = styled(Button)`
  width: auto;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  padding: ${({ theme }) => theme.spacing(2)} 0;
  margin-top: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  justify-content: center;
  align-items: center;
`;

const StyledSaveButton = styled(Button)`
  width: 100%;
  border-width: 2px !important;
  flex: 1;
`;

/* @kvoip-woulz proprietary:end */

export const AccountPayableFieldsCard = ({
  objectNameSingular,
  objectRecordId,
  isInRightDrawer = false,
}: AccountPayableFieldsCardProps) => {
  const isDraftRecord = useMemo(
    () => objectRecordId.startsWith('draft-'),
    [objectRecordId],
  );

  if (isDraftRecord) {
    return (
      <AccountPayableDraftFieldsCard
        objectNameSingular={objectNameSingular}
        objectRecordId={objectRecordId}
        isInRightDrawer={isInRightDrawer}
      />
    );
  }

  return (
    <AccountPayablePersistedFieldsCard
      objectNameSingular={objectNameSingular}
      objectRecordId={objectRecordId}
    />
  );
};

type AccountPayablePersistedFieldsCardProps = {
  objectNameSingular: string;
  objectRecordId: string;
};

const AccountPayablePersistedFieldsCard = ({
  objectNameSingular,
  objectRecordId,
}: AccountPayablePersistedFieldsCardProps) => {
  const instanceId = `account-payable-fields-${objectRecordId}`;
  const actionsDropdownId = `${instanceId}-actions-dropdown`;
  const actionsModalId = `${instanceId}-actions-modal`;

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

  const { toggleDropdown } = useToggleDropdown();
  const { openModal } = useModal();
  const [pendingAction, setPendingAction] = useState<ActionDropdownItem | null>(
    null,
  );

  const handleActionSelection = (action: ActionDropdownItem) => {
    if (action.confirmation) {
      setPendingAction(action);
      openModal(actionsModalId);
    } else {
      action.onSelect();
      toggleDropdown({
        dropdownComponentInstanceIdFromProps: actionsDropdownId,
      });
    }
  };

  const handleConfirmPendingAction = () => {
    if (pendingAction !== null) {
      pendingAction.onSelect();
    }
    setPendingAction(null);
    toggleDropdown({
      dropdownComponentInstanceIdFromProps: actionsDropdownId,
    });
  };

  const handleClosePendingAction = () => {
    setPendingAction(null);
    toggleDropdown({
      dropdownComponentInstanceIdFromProps: actionsDropdownId,
    });
  };

  const handleMouseEnter = (index: number) => {
    setRecordFieldListHoverPosition(index);
  };

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
            <StyledCardHeader>
              {/* @kvoip-woulz proprietary:begin */}
              <StyledTitleFieldContainer>
                {renderField('title', globalIndex++)}
              </StyledTitleFieldContainer>
              {/* @kvoip-woulz proprietary:end */}
              <StyledCardHeaderActions>
                <Dropdown
                  dropdownId={actionsDropdownId}
                  dropdownPlacement="bottom-end"
                  clickableComponent={
                    <StyledActionsButton
                      variant="secondary"
                      accent="blue"
                      title="Actions"
                      Icon={IconPlus}
                      justify="center"
                    />
                  }
                  dropdownComponents={
                    <DropdownContent>
                      <DropdownMenuItemsContainer>
                        {ACCOUNT_PAYABLE_ACTION_ITEMS.map((action) => (
                          <MenuItem
                            key={action.id}
                            text={action.label}
                            LeftIcon={action.icon}
                            onClick={() => handleActionSelection(action)}
                          />
                        ))}
                      </DropdownMenuItemsContainer>
                    </DropdownContent>
                  }
                />
              </StyledCardHeaderActions>
              {pendingAction && (
                <ConfirmationModal
                  modalId={actionsModalId}
                  title={pendingAction.confirmation?.title ?? ''}
                  subtitle={pendingAction.confirmation?.subtitle ?? ''}
                  confirmButtonText={
                    pendingAction.confirmation?.confirmButtonText ?? 'Confirm'
                  }
                  onConfirmClick={handleConfirmPendingAction}
                  onClose={handleClosePendingAction}
                />
              )}
            </StyledCardHeader>
            {/* @kvoip-woulz proprietary:begin */}
            <StyledCardHeaderDivider />
            {/* @kvoip-woulz proprietary:end */}

            <StyledFieldsSectionContainer>
              {ACCOUNT_PAYABLE_BASIC_FIELDS.filter(
                (fieldName) => fieldName !== 'title',
              ).map((fieldName) => renderField(fieldName, globalIndex++))}
            </StyledFieldsSectionContainer>

            <StyledFieldsSectionContainer>
              <StyledSectionTitle>
                {getAccountPayableFieldSectionLabel(
                  AccountPayableFieldSection.Financial,
                )}
              </StyledSectionTitle>
              <StyledFinancialFieldsGreyBox>
                {ACCOUNT_PAYABLE_FINANCIAL_FIELDS.map((fieldName) =>
                  renderField(fieldName, globalIndex++),
                )}
              </StyledFinancialFieldsGreyBox>
            </StyledFieldsSectionContainer>

            <StyledFieldsSectionContainer>
              <StyledSectionTitle>
                {getAccountPayableFieldSectionLabel(
                  AccountPayableFieldSection.PaymentInfo,
                )}
              </StyledSectionTitle>
              <StyledPaymentInfoFieldsGreyBox>
                {ACCOUNT_PAYABLE_PAYMENT_INFO_FIELDS.map((fieldName) =>
                  renderField(fieldName, globalIndex++),
                )}
              </StyledPaymentInfoFieldsGreyBox>
            </StyledFieldsSectionContainer>

            <StyledFieldsSectionContainer>
              <StyledSectionTitle>
                {getAccountPayableFieldSectionLabel(
                  AccountPayableFieldSection.AdditionalInfo,
                )}
              </StyledSectionTitle>
              <StyledAdditionalInfoFieldsGreyBox>
                {ACCOUNT_PAYABLE_ADDITIONAL_INFO_FIELDS.map((fieldName) =>
                  renderField(fieldName, globalIndex++),
                )}
              </StyledAdditionalInfoFieldsGreyBox>
            </StyledFieldsSectionContainer>

            <StyledFieldsSectionContainer>
              <StyledSectionTitle>
                {getAccountPayableFieldSectionLabel(
                  AccountPayableFieldSection.SystemInfo,
                )}
              </StyledSectionTitle>
              <StyledSystemInfoFieldsGreyBox>
                {ACCOUNT_PAYABLE_SYSTEM_FIELDS.map((fieldName) =>
                  renderField(fieldName, globalIndex++),
                )}
              </StyledSystemInfoFieldsGreyBox>
            </StyledFieldsSectionContainer>
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

type AccountPayableDraftFieldsCardProps = {
  objectNameSingular: string;
  objectRecordId: string;
  isInRightDrawer?: boolean;
};

const AccountPayableDraftFieldsCard = ({
  objectNameSingular,
  objectRecordId,
  isInRightDrawer = false,
}: AccountPayableDraftFieldsCardProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.AccountPayable,
  });

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const objectPermissions = useMemo(() => {
    return getObjectPermissionsFromMapByObjectMetadataId({
      objectPermissionsByObjectMetadataId,
      objectMetadataId: objectMetadataItem.id,
    });
  }, [objectMetadataItem.id, objectPermissionsByObjectMetadataId]);

  return (
    <RecordCreateProvider
      objectMetadataItem={objectMetadataItem}
      draftRecordId={objectRecordId}
    >
      <AccountPayableDraftFieldsCardInner
        objectNameSingular={objectNameSingular}
        objectMetadataItem={objectMetadataItem}
        objectPermissions={objectPermissions}
        isInRightDrawer={isInRightDrawer}
      />
    </RecordCreateProvider>
  );
};

type AccountPayableDraftFieldsCardInnerProps = {
  objectNameSingular: string;
  objectMetadataItem: ObjectMetadataItem;
  objectPermissions: ObjectPermissions;
  isInRightDrawer: boolean;
};

const AccountPayableDraftFieldsCardInner = ({
  objectNameSingular,
  objectMetadataItem,
  objectPermissions,
  isInRightDrawer,
}: AccountPayableDraftFieldsCardInnerProps) => {
  const { draftRecordId, draftValues, resetDraft } = useRecordCreateContext();

  const { goBackFromCommandMenu } = useCommandMenuHistory();
  const navigateApp = useNavigateApp();
  const { toggleDropdown } = useToggleDropdown();
  const { openModal } = useModal();

  const { createOneRecord, loading: createLoading } = useCreateOneRecord({
    objectNameSingular,
    shouldMatchRootQueryFilter: true,
  });

  const [pendingAction, setPendingAction] = useState<ActionDropdownItem | null>(
    null,
  );
  const [saving, setSaving] = useState(false);

  const instanceId = useMemo(
    () => `account-payable-draft-fields-${draftRecordId}`,
    [draftRecordId],
  );
  const actionsDropdownId = `${instanceId}-actions-dropdown`;
  const actionsModalId = `${instanceId}-actions-modal`;

  const setRecordFieldListHoverPosition = useSetRecoilComponentState(
    recordFieldListHoverPositionComponentState,
    instanceId,
  );

  const handleMouseEnter = useCallback(
    (index: number) => {
      setRecordFieldListHoverPosition(index);
    },
    [setRecordFieldListHoverPosition],
  );

  const handleActionSelection = (action: ActionDropdownItem) => {
    if (action.confirmation) {
      setPendingAction(action);
      openModal(actionsModalId);
    } else {
      action.onSelect();
      toggleDropdown({
        dropdownComponentInstanceIdFromProps: actionsDropdownId,
      });
    }
  };

  const handleConfirmPendingAction = () => {
    if (pendingAction !== null) {
      pendingAction.onSelect();
    }
    setPendingAction(null);
    toggleDropdown({
      dropdownComponentInstanceIdFromProps: actionsDropdownId,
    });
  };

  const handleClosePendingAction = () => {
    setPendingAction(null);
    toggleDropdown({
      dropdownComponentInstanceIdFromProps: actionsDropdownId,
    });
  };

  const handleSave = useCallback(async () => {
    setSaving(true);

    try {
      const createdRecord = await createOneRecord(draftValues);
      const createdRecordId = createdRecord?.id;

      if (!isDefined(createdRecordId)) {
        return;
      }

      resetDraft();

      if (isInRightDrawer === true) {
        goBackFromCommandMenu();
        return;
      }

      navigateApp(AppPath.RecordIndexPage, {
        objectNamePlural: objectMetadataItem.namePlural,
      });
    } finally {
      setSaving(false);
    }
  }, [
    createOneRecord,
    draftValues,
    goBackFromCommandMenu,
    isInRightDrawer,
    navigateApp,
    objectMetadataItem.namePlural,
    resetDraft,
  ]);

  let globalIndex = 0;

  return (
    <RecordFieldListComponentInstanceContext.Provider value={{ instanceId }}>
      <PropertyBox>
        <StyledCardHeader>
          <StyledTitleFieldContainer>
            <RecordCreateField
              fieldName="title"
              position={globalIndex++}
              objectPermissions={objectPermissions}
              instanceIdPrefix={instanceId}
              onMouseEnter={handleMouseEnter}
            />
          </StyledTitleFieldContainer>
          <StyledCardHeaderActions>
            <Dropdown
              dropdownId={actionsDropdownId}
              dropdownPlacement="bottom-end"
              clickableComponent={
                <StyledActionsButton
                  variant="secondary"
                  accent="blue"
                  title="Actions"
                  Icon={IconPlus}
                  justify="center"
                />
              }
              dropdownComponents={
                <DropdownContent>
                  <DropdownMenuItemsContainer>
                    {ACCOUNT_PAYABLE_ACTION_ITEMS.map((action) => (
                      <MenuItem
                        key={action.id}
                        text={action.label}
                        LeftIcon={action.icon}
                        onClick={() => handleActionSelection(action)}
                      />
                    ))}
                  </DropdownMenuItemsContainer>
                </DropdownContent>
              }
            />
          </StyledCardHeaderActions>
          {pendingAction !== null && (
            <ConfirmationModal
              modalId={actionsModalId}
              title={pendingAction.confirmation?.title ?? ''}
              subtitle={pendingAction.confirmation?.subtitle ?? ''}
              confirmButtonText={
                pendingAction.confirmation?.confirmButtonText ?? 'Confirm'
              }
              onConfirmClick={handleConfirmPendingAction}
              onClose={handleClosePendingAction}
            />
          )}
        </StyledCardHeader>
        <StyledCardHeaderDivider />
        <StyledFieldsSectionContainer>
          {ACCOUNT_PAYABLE_BASIC_FIELDS.filter(
            (fieldName) => fieldName !== 'title',
          ).map((fieldName) => (
            <RecordCreateField
              key={fieldName}
              fieldName={fieldName}
              position={globalIndex++}
              objectPermissions={objectPermissions}
              instanceIdPrefix={instanceId}
              onMouseEnter={handleMouseEnter}
            />
          ))}
        </StyledFieldsSectionContainer>

        <StyledFieldsSectionContainer>
          <StyledSectionTitle>
            {getAccountPayableFieldSectionLabel(
              AccountPayableFieldSection.Financial,
            )}
          </StyledSectionTitle>
          <StyledFinancialFieldsGreyBox>
            {ACCOUNT_PAYABLE_FINANCIAL_FIELDS.map((fieldName) => (
              <RecordCreateField
                key={fieldName}
                fieldName={fieldName}
                position={globalIndex++}
                objectPermissions={objectPermissions}
                instanceIdPrefix={instanceId}
                onMouseEnter={handleMouseEnter}
              />
            ))}
          </StyledFinancialFieldsGreyBox>
        </StyledFieldsSectionContainer>

        <StyledFieldsSectionContainer>
          <StyledSectionTitle>
            {getAccountPayableFieldSectionLabel(
              AccountPayableFieldSection.PaymentInfo,
            )}
          </StyledSectionTitle>
          <StyledPaymentInfoFieldsGreyBox>
            {ACCOUNT_PAYABLE_PAYMENT_INFO_FIELDS.map((fieldName) => (
              <RecordCreateField
                key={fieldName}
                fieldName={fieldName}
                position={globalIndex++}
                objectPermissions={objectPermissions}
                instanceIdPrefix={instanceId}
                onMouseEnter={handleMouseEnter}
              />
            ))}
          </StyledPaymentInfoFieldsGreyBox>
        </StyledFieldsSectionContainer>

        <StyledFieldsSectionContainer>
          <StyledSectionTitle>
            {getAccountPayableFieldSectionLabel(
              AccountPayableFieldSection.AdditionalInfo,
            )}
          </StyledSectionTitle>
          <StyledAdditionalInfoFieldsGreyBox>
            {ACCOUNT_PAYABLE_ADDITIONAL_INFO_FIELDS.map((fieldName) => (
              <RecordCreateField
                key={fieldName}
                fieldName={fieldName}
                position={globalIndex++}
                objectPermissions={objectPermissions}
                instanceIdPrefix={instanceId}
                onMouseEnter={handleMouseEnter}
              />
            ))}
          </StyledAdditionalInfoFieldsGreyBox>
        </StyledFieldsSectionContainer>

        <StyledFieldsSectionContainer>
          <StyledSectionTitle>
            {getAccountPayableFieldSectionLabel(
              AccountPayableFieldSection.SystemInfo,
            )}
          </StyledSectionTitle>
          <StyledSystemInfoFieldsGreyBox>
            {ACCOUNT_PAYABLE_SYSTEM_FIELDS.map((fieldName) => (
              <RecordCreateField
                key={fieldName}
                fieldName={fieldName}
                position={globalIndex++}
                objectPermissions={objectPermissions}
                instanceIdPrefix={instanceId}
                onMouseEnter={handleMouseEnter}
              />
            ))}
          </StyledSystemInfoFieldsGreyBox>
        </StyledFieldsSectionContainer>

        <StyledButtonContainer>
          <StyledSaveButton
            variant="secondary"
            accent="blue"
            title="Save"
            Icon={IconDeviceFloppy}
            justify="center"
            onClick={handleSave}
            /* @kvoip-woulz proprietary:begin */
            fullWidth
            isLoading={saving || createLoading}
            /* @kvoip-woulz proprietary:end */
          />
        </StyledButtonContainer>
      </PropertyBox>

      <RecordFieldListCellHoveredPortal
        objectMetadataItem={objectMetadataItem}
        recordId={draftRecordId}
      />
      <RecordFieldListCellEditModePortal
        objectMetadataItem={objectMetadataItem}
        recordId={draftRecordId}
      />
    </RecordFieldListComponentInstanceContext.Provider>
  );
};
