/* @kvoip-woulz proprietary */
import styled from '@emotion/styled';
import { Fragment, useCallback, useMemo, useState } from 'react';

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
import { useCreateFormFields } from '@/object-record/record-create/hooks/useCreateFormFields';
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
/* @kvoip-woulz proprietary:begin */
import { useFieldListFieldMetadataItems } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems';
/* @kvoip-woulz proprietary:end */
import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { AppPath } from '@/types/AppPath';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
/* @kvoip-woulz proprietary:begin */
import { TextInput } from '@/ui/input/components/TextInput';
/* @kvoip-woulz proprietary:end */
import {
  FieldMetadataType,
  RelationType,
  type ObjectPermissions,
} from 'twenty-shared/types';
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
/* @kvoip-woulz proprietary:begin */
import { turnIntoUndefinedIfWhitespacesOnly } from '~/utils/string/turnIntoUndefinedIfWhitespacesOnly';
/* @kvoip-woulz proprietary:end */
/* @kvoip-woulz proprietary:begin */
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
const StyledRelationFieldsGreyBox = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: ${({ theme }) => `1px solid ${theme.border.color.medium}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(2)};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledRelationFieldItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledRelationFieldLabel = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledRelationFieldValue = styled.div`
  width: 100%;
  display: flex;
`;
/* @kvoip-woulz proprietary:end */

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

/* @kvoip-woulz proprietary:begin */
const StyledTitleTextInput = styled(TextInput)`
  width: 100%;
`;
/* @kvoip-woulz proprietary:end */

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

  /* @kvoip-woulz proprietary:begin */
  const {
    inlineFieldMetadataItems,
    inlineRelationFieldMetadataItems,
    boxedRelationFieldMetadataItems,
  } = useFieldListFieldMetadataItems({
    objectNameSingular,
  });

  const fieldPositions = useMemo(() => {
    const positions = new Map<string, number>();
    let currentPosition = 0;

    inlineRelationFieldMetadataItems?.forEach((fieldMetadataItem) => {
      positions.set(fieldMetadataItem.name, currentPosition);
      currentPosition += 1;
    });

    inlineFieldMetadataItems?.forEach((fieldMetadataItem) => {
      positions.set(fieldMetadataItem.name, currentPosition);
      currentPosition += 1;
    });

    boxedRelationFieldMetadataItems?.forEach((fieldMetadataItem) => {
      positions.set(fieldMetadataItem.name, currentPosition);
      currentPosition += 1;
    });

    return positions;
  }, [
    inlineFieldMetadataItems,
    inlineRelationFieldMetadataItems,
    boxedRelationFieldMetadataItems,
  ]);
  /* @kvoip-woulz proprietary:end */

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

  /* @kvoip-woulz proprietary:begin */
  const handleMouseEnter = useCallback(
    (position?: number) => {
      if (!isDefined(position)) {
        return;
      }

      setRecordFieldListHoverPosition(position);
    },
    [setRecordFieldListHoverPosition],
  );
  /* @kvoip-woulz proprietary:end */

  const fieldsByName = mapArrayToObject(
    objectMetadataItem.fields,
    ({ name }) => name,
  );

  /* @kvoip-woulz proprietary:begin */
  const labelIdentifierFieldMetadataItem = objectMetadataItem.fields.find(
    ({ id }) => id === objectMetadataItem.labelIdentifierFieldMetadataId,
  );

  const headerFieldName = labelIdentifierFieldMetadataItem?.name ?? 'name';
  /* @kvoip-woulz proprietary:end */

  const objectPermissions = getObjectPermissionsFromMapByObjectMetadataId({
    objectPermissionsByObjectMetadataId,
    objectMetadataId: objectMetadataItem.id,
  });

  /* @kvoip-woulz proprietary:begin */
  /* @kvoip-woulz proprietary:begin */
  const relationFieldMetadataItems = useMemo(
    () =>
      objectMetadataItem.fields
        .filter(
          (fieldMetadataItem) =>
            fieldMetadataItem.type === FieldMetadataType.RELATION &&
            fieldMetadataItem.relation?.type === RelationType.MANY_TO_ONE &&
            fieldMetadataItem.isSystem !== true,
        )
        .sort((fieldA, fieldB) => {
          const positionA =
            fieldPositions.get(fieldA.name) ?? Number.MAX_SAFE_INTEGER;
          const positionB =
            fieldPositions.get(fieldB.name) ?? Number.MAX_SAFE_INTEGER;

          return positionA - positionB;
        }),
    [fieldPositions, objectMetadataItem.fields],
  );

  const relationFieldNames = useMemo(
    () => relationFieldMetadataItems.map(({ name }) => name),
    [relationFieldMetadataItems],
  );

  const relationJoinColumnFieldNames = useMemo(
    () =>
      relationFieldMetadataItems
        .map((fieldMetadataItem) => fieldMetadataItem.settings?.joinColumnName)
        .filter((joinColumnName): joinColumnName is string =>
          Boolean(joinColumnName),
        ),
    [relationFieldMetadataItems],
  );

  const predefinedFieldNames = useMemo(() => {
    return new Set<string>([
      ...ACCOUNT_PAYABLE_BASIC_FIELDS,
      ...ACCOUNT_PAYABLE_FINANCIAL_FIELDS,
      ...ACCOUNT_PAYABLE_PAYMENT_INFO_FIELDS,
      ...ACCOUNT_PAYABLE_ADDITIONAL_INFO_FIELDS,
      ...ACCOUNT_PAYABLE_SYSTEM_FIELDS,
      headerFieldName,
      ...relationFieldNames,
      ...relationJoinColumnFieldNames,
    ]);
  }, [headerFieldName, relationFieldNames, relationJoinColumnFieldNames]);

  const dynamicFieldNames = useMemo(
    () =>
      objectMetadataItem.fields
        .filter((fieldMetadataItem) => {
          if (predefinedFieldNames.has(fieldMetadataItem.name)) {
            return false;
          }

          if (fieldMetadataItem.isSystem === true) {
            return false;
          }

          if (fieldMetadataItem.type === FieldMetadataType.RELATION) {
            return false;
          }

          return true;
        })
        .sort((fieldA, fieldB) => {
          const positionA =
            fieldPositions.get(fieldA.name) ?? Number.MAX_SAFE_INTEGER;
          const positionB =
            fieldPositions.get(fieldB.name) ?? Number.MAX_SAFE_INTEGER;

          return positionA - positionB;
        })
        .map(({ name }) => name),
    [fieldPositions, objectMetadataItem.fields, predefinedFieldNames],
  );

  const additionalInfoFieldNames = useMemo(() => {
    const seen = new Set<string>();

    return [
      ...ACCOUNT_PAYABLE_ADDITIONAL_INFO_FIELDS,
      ...dynamicFieldNames,
    ].filter((fieldName) => {
      if (seen.has(fieldName)) {
        return false;
      }

      seen.add(fieldName);
      return true;
    });
  }, [dynamicFieldNames]);
  /* @kvoip-woulz proprietary:end */
  /* @kvoip-woulz proprietary:end */

  const renderField = (fieldName: string) => {
    const fieldMetadataItem = fieldsByName[fieldName];
    /* @kvoip-woulz proprietary:begin */
    const fieldPosition = fieldPositions.get(fieldName);
    /* @kvoip-woulz proprietary:end */

    if (!fieldMetadataItem || !isDefined(fieldPosition)) {
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
            /* @kvoip-woulz proprietary:begin */
            position: fieldPosition,
            /* @kvoip-woulz proprietary:end */
            objectMetadataItem,
            showLabel: true,
            labelWidth: 90,
          }),
          useUpdateRecord: useUpdateOneObjectRecordMutation,
          isDisplayModeFixHeight: true,
          /* @kvoip-woulz proprietary:begin */
          onMouseEnter: () => handleMouseEnter(fieldPosition),
          /* @kvoip-woulz proprietary:end */
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
                {renderField(headerFieldName)}
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
                /* @kvoip-woulz proprietary:begin */
                (fieldName) => fieldName !== headerFieldName,
                /* @kvoip-woulz proprietary:end */
              ).map((fieldName) => renderField(fieldName))}
            </StyledFieldsSectionContainer>

            <StyledFieldsSectionContainer>
              <StyledSectionTitle>
                {getAccountPayableFieldSectionLabel(
                  AccountPayableFieldSection.Financial,
                )}
              </StyledSectionTitle>
              <StyledFinancialFieldsGreyBox>
                {ACCOUNT_PAYABLE_FINANCIAL_FIELDS.map((fieldName) =>
                  renderField(fieldName),
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
                  renderField(fieldName),
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
                {additionalInfoFieldNames.map((fieldName) =>
                  renderField(fieldName),
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
                  renderField(fieldName),
                )}
              </StyledSystemInfoFieldsGreyBox>
            </StyledFieldsSectionContainer>

            {/* @kvoip-woulz proprietary:begin */}
            {relationFieldMetadataItems.length > 0 && (
              <StyledFieldsSectionContainer>
                <StyledSectionTitle>
                  {getAccountPayableFieldSectionLabel(
                    AccountPayableFieldSection.Others,
                  )}
                </StyledSectionTitle>
                <StyledRelationFieldsGreyBox>
                  {relationFieldMetadataItems.map((fieldMetadataItem) =>
                    renderField(fieldMetadataItem.name),
                  )}
                </StyledRelationFieldsGreyBox>
              </StyledFieldsSectionContainer>
            )}
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
  const { draftRecordId, draftValues, resetDraft, persistFieldValue } =
    useRecordCreateContext();

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

  /* @kvoip-woulz proprietary:begin */
  const { getRenderableField, fieldsByName, relationFieldConfigs } =
    useCreateFormFields({
      objectMetadataItem,
      objectNameSingular,
    });
  /* @kvoip-woulz proprietary:end */

  /* @kvoip-woulz proprietary:begin */
  const clearHoverState = useCallback(() => {
    setRecordFieldListHoverPosition(null);
  }, [setRecordFieldListHoverPosition]);
  /* @kvoip-woulz proprietary:end */

  const handleMouseEnter = useCallback(
    (position?: number) => {
      if (!isDefined(position)) {
        return;
      }

      setRecordFieldListHoverPosition(position);
    },
    [setRecordFieldListHoverPosition],
  );

  /* @kvoip-woulz proprietary:begin */
  const renderCreateField = useCallback(
    (fieldName: string, options?: { showLabel?: boolean }) => {
      const fieldConfig = getRenderableField(fieldName);
      if (!fieldConfig) {
        return null;
      }

      return (
        <RecordCreateField
          fieldName={fieldConfig.fieldName}
          position={fieldConfig.position}
          objectPermissions={objectPermissions}
          instanceIdPrefix={instanceId}
          onMouseEnter={handleMouseEnter}
          showLabel={options?.showLabel ?? true}
        />
      );
    },
    [getRenderableField, objectPermissions, instanceId, handleMouseEnter],
  );

  const relationSectionItems = useMemo(
    () =>
      relationFieldConfigs
        .map(({ relationFieldName, label }) => ({
          fieldName: relationFieldName,
          label,
        }))
        .filter(
          (
            item,
          ): item is {
            fieldName: string;
            label: string;
          } => item.label.length > 0,
        ),
    [relationFieldConfigs],
  );
  /* @kvoip-woulz proprietary:end */

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
      const inputValues: Record<string, unknown> = { ...draftValues };

      relationFieldConfigs.forEach(
        ({ relationFieldName, relationIdFieldName }) => {
          if (!relationIdFieldName) {
            return;
          }

          if (
            !Object.prototype.hasOwnProperty.call(
              inputValues,
              relationFieldName,
            )
          ) {
            return;
          }

          const relationValue = inputValues[relationFieldName];

          if (relationValue === undefined) {
            delete inputValues[relationFieldName];
            return;
          }

          if (
            relationValue !== null &&
            typeof relationValue === 'object' &&
            'id' in (relationValue as Record<string, unknown>)
          ) {
            inputValues[relationIdFieldName] = (
              relationValue as { id?: string | null }
            ).id;
          } else {
            inputValues[relationIdFieldName] =
              relationValue === '' ? null : relationValue;
          }

          delete inputValues[relationFieldName];
        },
      );

      const createdRecord = await createOneRecord(inputValues);
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
    relationFieldConfigs,
    navigateApp,
    objectMetadataItem.namePlural,
    resetDraft,
  ]);

  /* @kvoip-woulz proprietary:begin */
  const labelIdentifierFieldMetadataItem = objectMetadataItem.fields.find(
    ({ id }) => id === objectMetadataItem.labelIdentifierFieldMetadataId,
  );

  const headerFieldName = labelIdentifierFieldMetadataItem?.name ?? 'name';
  /* @kvoip-woulz proprietary:end */

  /* @kvoip-woulz proprietary:begin */
  const headerFieldConfig = getRenderableField(headerFieldName);
  const headerFieldPosition = headerFieldConfig?.position ?? 0;

  const headerFieldDefinition = useMemo(() => {
    if (!labelIdentifierFieldMetadataItem) {
      return null;
    }

    return formatFieldMetadataItemAsColumnDefinition({
      field: labelIdentifierFieldMetadataItem,
      position: headerFieldPosition ?? 0,
      objectMetadataItem,
      showLabel: false,
      labelWidth: 0,
    });
  }, [
    labelIdentifierFieldMetadataItem,
    headerFieldPosition,
    objectMetadataItem,
  ]);

  const headerFieldValue =
    (draftValues[headerFieldName] as string | undefined) ?? '';

  const handleHeaderFieldChange = useCallback(
    (newValue: string) => {
      if (!headerFieldDefinition) {
        return;
      }

      persistFieldValue({
        fieldDefinition: headerFieldDefinition,
        value: turnIntoUndefinedIfWhitespacesOnly(newValue),
      });
    },
    [headerFieldDefinition, persistFieldValue],
  );
  /* @kvoip-woulz proprietary:end */

  /* @kvoip-woulz proprietary:begin */
  const relationFieldNames = useMemo(
    () =>
      relationFieldConfigs.map(({ relationFieldName }) => relationFieldName),
    [relationFieldConfigs],
  );

  const relationIdFieldNames = useMemo(
    () =>
      relationFieldConfigs
        .map(({ relationIdFieldName }) => relationIdFieldName)
        .filter(
          (fieldName): fieldName is string =>
            typeof fieldName === 'string' && fieldName.length > 0,
        ),
    [relationFieldConfigs],
  );

  const predefinedFieldNames = useMemo(() => {
    return new Set<string>([
      ...ACCOUNT_PAYABLE_BASIC_FIELDS,
      ...ACCOUNT_PAYABLE_FINANCIAL_FIELDS,
      ...ACCOUNT_PAYABLE_PAYMENT_INFO_FIELDS,
      ...ACCOUNT_PAYABLE_ADDITIONAL_INFO_FIELDS,
      ...ACCOUNT_PAYABLE_SYSTEM_FIELDS,
      headerFieldName,
      ...relationFieldNames,
      ...relationIdFieldNames,
    ]);
  }, [headerFieldName, relationFieldNames, relationIdFieldNames]);

  const dynamicFieldNames = useMemo(
    () =>
      objectMetadataItem.fields
        .filter((fieldMetadataItem) => {
          if (predefinedFieldNames.has(fieldMetadataItem.name)) {
            return false;
          }

          if (fieldMetadataItem.isSystem === true) {
            return false;
          }

          if (fieldMetadataItem.type === FieldMetadataType.RELATION) {
            return false;
          }

          return getRenderableField(fieldMetadataItem.name) !== null;
        })
        .sort((fieldA, fieldB) => {
          const fieldAConfig = getRenderableField(fieldA.name);
          const fieldBConfig = getRenderableField(fieldB.name);

          return (
            (fieldAConfig?.position ?? Number.MAX_SAFE_INTEGER) -
            (fieldBConfig?.position ?? Number.MAX_SAFE_INTEGER)
          );
        })
        .map(({ name }) => name),
    [getRenderableField, objectMetadataItem.fields, predefinedFieldNames],
  );

  const additionalInfoFieldNames = useMemo(() => {
    const seen = new Set<string>();

    return [
      ...ACCOUNT_PAYABLE_ADDITIONAL_INFO_FIELDS,
      ...dynamicFieldNames,
    ].filter((fieldName) => {
      if (seen.has(fieldName)) {
        return false;
      }

      seen.add(fieldName);
      return true;
    });
  }, [dynamicFieldNames]);
  /* @kvoip-woulz proprietary:end */

  /* @kvoip-woulz proprietary:begin */
  return (
    <RecordFieldListComponentInstanceContext.Provider value={{ instanceId }}>
      <PropertyBox>
        <StyledCardHeader>
          <StyledTitleFieldContainer>
            {/* @kvoip-woulz proprietary:begin */}
            <StyledTitleTextInput
              value={headerFieldValue}
              onChange={handleHeaderFieldChange}
              placeholder="Empty"
              onFocus={clearHoverState}
              onMouseEnter={clearHoverState}
            />
            {/* @kvoip-woulz proprietary:end */}
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
            /* @kvoip-woulz proprietary:begin */
            (fieldName) => fieldName !== headerFieldName,
            /* @kvoip-woulz proprietary:end */
          ).map((fieldName) => {
            const fieldElement = renderCreateField(fieldName);
            if (!fieldElement) {
              return null;
            }

            return <Fragment key={fieldName}>{fieldElement}</Fragment>;
          })}
        </StyledFieldsSectionContainer>

        <StyledFieldsSectionContainer>
          <StyledSectionTitle>
            {getAccountPayableFieldSectionLabel(
              AccountPayableFieldSection.Financial,
            )}
          </StyledSectionTitle>
          <StyledFinancialFieldsGreyBox>
            {ACCOUNT_PAYABLE_FINANCIAL_FIELDS.map((fieldName) => {
              const fieldElement = renderCreateField(fieldName);
              if (!fieldElement) {
                return null;
              }

              return <Fragment key={fieldName}>{fieldElement}</Fragment>;
            })}
          </StyledFinancialFieldsGreyBox>
        </StyledFieldsSectionContainer>

        <StyledFieldsSectionContainer>
          <StyledSectionTitle>
            {getAccountPayableFieldSectionLabel(
              AccountPayableFieldSection.PaymentInfo,
            )}
          </StyledSectionTitle>
          <StyledPaymentInfoFieldsGreyBox>
            {ACCOUNT_PAYABLE_PAYMENT_INFO_FIELDS.map((fieldName) => {
              const fieldElement = renderCreateField(fieldName);
              if (!fieldElement) {
                return null;
              }

              return <Fragment key={fieldName}>{fieldElement}</Fragment>;
            })}
          </StyledPaymentInfoFieldsGreyBox>
        </StyledFieldsSectionContainer>

        <StyledFieldsSectionContainer>
          <StyledSectionTitle>
            {getAccountPayableFieldSectionLabel(
              AccountPayableFieldSection.AdditionalInfo,
            )}
          </StyledSectionTitle>
          <StyledAdditionalInfoFieldsGreyBox>
            {additionalInfoFieldNames.map((fieldName) => {
              const fieldElement = renderCreateField(fieldName);
              if (!fieldElement) {
                return null;
              }

              return <Fragment key={fieldName}>{fieldElement}</Fragment>;
            })}
          </StyledAdditionalInfoFieldsGreyBox>
        </StyledFieldsSectionContainer>

        <StyledFieldsSectionContainer>
          <StyledSectionTitle>
            {getAccountPayableFieldSectionLabel(
              AccountPayableFieldSection.SystemInfo,
            )}
          </StyledSectionTitle>
          <StyledSystemInfoFieldsGreyBox>
            {ACCOUNT_PAYABLE_SYSTEM_FIELDS.map((fieldName) => {
              const fieldElement = renderCreateField(fieldName);
              if (!fieldElement) {
                return null;
              }

              return <Fragment key={fieldName}>{fieldElement}</Fragment>;
            })}
          </StyledSystemInfoFieldsGreyBox>
        </StyledFieldsSectionContainer>

        {/* @kvoip-woulz proprietary:begin */}
        {relationSectionItems.length > 0 && (
          <StyledFieldsSectionContainer>
            <StyledSectionTitle>
              {getAccountPayableFieldSectionLabel(
                AccountPayableFieldSection.Others,
              )}
            </StyledSectionTitle>
            <StyledRelationFieldsGreyBox>
              {relationSectionItems.map(({ fieldName, label }) => (
                <StyledRelationFieldItem key={fieldName}>
                  <StyledRelationFieldLabel>{label}</StyledRelationFieldLabel>
                  <StyledRelationFieldValue>
                    {renderCreateField(fieldName, { showLabel: false })}
                  </StyledRelationFieldValue>
                </StyledRelationFieldItem>
              ))}
            </StyledRelationFieldsGreyBox>
          </StyledFieldsSectionContainer>
        )}
        {/* @kvoip-woulz proprietary:end */}

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
      {/* @kvoip-woulz proprietary:end */}
    </RecordFieldListComponentInstanceContext.Provider>
  );
};
