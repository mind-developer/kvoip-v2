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
import { AppPath } from '@/types/AppPath';
import { TextInput } from '@/ui/input/components/TextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
/* @kvoip-woulz proprietary:begin */
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
/* @kvoip-woulz proprietary:end */
import {
  FieldMetadataType,
  RelationType,
  type ObjectPermissions,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconChevronDown,
  IconDeviceFloppy,
  IconFileImport,
  IconFileText,
  type IconComponent,
} from 'twenty-ui/display';
/* @kvoip-woulz proprietary:begin */
import {
  IconCalendarEvent,
  IconCheckbox,
  IconHome,
  IconMail,
  IconNotes,
  IconPaperclip,
} from 'twenty-ui/display';
/* @kvoip-woulz proprietary:end */
import { Button } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';
import { turnIntoUndefinedIfWhitespacesOnly } from '~/utils/string/turnIntoUndefinedIfWhitespacesOnly';

import {
  ACCOUNT_PAYABLE_EXCLUDED_SYSTEM_FIELDS,
  ACCOUNT_PAYABLE_PRIMARY_FIELDS,
  ACCOUNT_PAYABLE_RELATION_FIELDS,
  ACCOUNT_PAYABLE_REQUIRED_FIELDS,
} from '../config/accountPayableFieldGroups';

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

const StyledFieldsGreyBox = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: ${({ theme }) => `1px solid ${theme.border.color.medium}`};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledFieldsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledRelationSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledRelationFieldsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledRelationFieldItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledRelationFieldLabel = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledCardHeader = styled.div`
  display: flex;
  /* @kvoip-woulz proprietary:begin */
  align-items: flex-end;
  /* @kvoip-woulz proprietary:end */
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

/* @kvoip-woulz proprietary:begin */
const StyledFieldsSectionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledFieldsSectionTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;
/* @kvoip-woulz proprietary:end */

/* @kvoip-woulz proprietary:begin */
const StyledDraftLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledDraftTabListContainer = styled.div`
  width: 100%;
`;

const StyledDraftTabList = styled(TabList)`
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledDraftActionsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  gap: ${({ theme }) => theme.spacing(2)};
`;
/* @kvoip-woulz proprietary:end */

const StyledTitleFieldContainer = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
`;

const StyledTitleFieldContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledTitleTextInput = styled(TextInput)`
  width: 100%;

  /* @kvoip-woulz proprietary:begin */
  label {
    display: none;
  }

  input {
    font-size: ${({ theme }) => theme.font.size.xl};
    font-weight: ${({ theme }) => theme.font.weight.semiBold};
    border: none;
    padding: 0;
    background: transparent;
  }

  input:focus {
    border: none;
    box-shadow: none;
  }
  /* @kvoip-woulz proprietary:end */
`;

const StyledTitleHelperText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

const StyledActionsButton = styled(Button)`
  /* @kvoip-woulz proprietary:begin */
  width: 100%;
  border-width: 2px !important;
  padding: 0 ${({ theme }) => theme.spacing(3)};
  font-size: ${({ theme }) => theme.font.size.md};
  svg {
    width: 18px;
    height: 18px;
  }

  &:focus,
  &:focus-visible,
  &:active {
    border-color: ${({ theme }) => theme.border.color.medium} !important;
    box-shadow: 0 0 0 3px ${({ theme }) => theme.background.transparent.medium} !important;
  }
  /* @kvoip-woulz proprietary:end */
`;

/* @kvoip-woulz proprietary:begin */
const StyledDraftActionsButton = styled(StyledActionsButton)`
  width: 100%;
  justify-content: center;
`;
/* @kvoip-woulz proprietary:end */

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

  const handleMouseEnter = useCallback(
    (position?: number) => {
      if (!isDefined(position)) {
        return;
      }

      setRecordFieldListHoverPosition(position);
    },
    [setRecordFieldListHoverPosition],
  );

  const fieldsByName = mapArrayToObject(
    objectMetadataItem.fields,
    ({ name }) => name,
  );

  const labelIdentifierFieldMetadataItem = objectMetadataItem.fields.find(
    ({ id }) => id === objectMetadataItem.labelIdentifierFieldMetadataId,
  );

  const headerFieldName = labelIdentifierFieldMetadataItem?.name ?? 'name';

  const objectPermissions = getObjectPermissionsFromMapByObjectMetadataId({
    objectPermissionsByObjectMetadataId,
    objectMetadataId: objectMetadataItem.id,
  });

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

  const relationJoinColumnFieldNames = useMemo(
    () =>
      relationFieldMetadataItems
        .map((fieldMetadataItem) => fieldMetadataItem.settings?.joinColumnName)
        .filter((joinColumnName): joinColumnName is string =>
          Boolean(joinColumnName),
        ),
    [relationFieldMetadataItems],
  );

  const excludedFieldNamesSet = useMemo(
    () =>
      new Set<string>([
        headerFieldName,
        ...ACCOUNT_PAYABLE_EXCLUDED_SYSTEM_FIELDS,
        ...relationJoinColumnFieldNames,
      ]),
    [headerFieldName, relationJoinColumnFieldNames],
  );

  const dynamicFieldNames = useMemo(
    () =>
      objectMetadataItem.fields
        .filter((fieldMetadataItem) => {
          if (excludedFieldNamesSet.has(fieldMetadataItem.name)) {
            return false;
          }

          if (fieldMetadataItem.isSystem === true) {
            return false;
          }

          if (fieldMetadataItem.type === FieldMetadataType.RELATION) {
            return false;
          }

          return fieldPositions.has(fieldMetadataItem.name);
        })
        .sort((fieldA, fieldB) => {
          const positionA =
            fieldPositions.get(fieldA.name) ?? Number.MAX_SAFE_INTEGER;
          const positionB =
            fieldPositions.get(fieldB.name) ?? Number.MAX_SAFE_INTEGER;

          return positionA - positionB;
        })
        .map(({ name }) => name),
    [excludedFieldNamesSet, fieldPositions, objectMetadataItem.fields],
  );

  const orderedFieldNames = useMemo(() => {
    const seen = new Set<string>();
    const fieldNames: string[] = [];

    const pushFieldName = (fieldName: string | undefined) => {
      if (!fieldName) {
        return;
      }

      if (excludedFieldNamesSet.has(fieldName)) {
        return;
      }

      if (seen.has(fieldName)) {
        return;
      }

      if (!fieldsByName[fieldName]) {
        return;
      }

      seen.add(fieldName);
      fieldNames.push(fieldName);
    };

    ACCOUNT_PAYABLE_PRIMARY_FIELDS.forEach(pushFieldName);
    dynamicFieldNames.forEach(pushFieldName);
    ACCOUNT_PAYABLE_RELATION_FIELDS.forEach(pushFieldName);
    relationFieldMetadataItems.forEach(({ name }) => pushFieldName(name));

    return fieldNames;
  }, [
    excludedFieldNamesSet,
    fieldsByName,
    dynamicFieldNames,
    relationFieldMetadataItems,
  ]);

  /* @kvoip-woulz proprietary:begin */
  const relationFieldNameSet = useMemo(
    () => new Set<string>(relationFieldMetadataItems.map(({ name }) => name)),
    [relationFieldMetadataItems],
  );

  const requiredFieldNameSet = useMemo(
    () => new Set<string>(ACCOUNT_PAYABLE_REQUIRED_FIELDS),
    [],
  );

  const essentialFieldNames = useMemo(() => {
    const sorted = [...ACCOUNT_PAYABLE_REQUIRED_FIELDS].filter(
      (fieldName) => fieldsByName[fieldName],
    );

    sorted.sort((fieldA, fieldB) => {
      const positionA = fieldPositions.get(fieldA) ?? Number.MAX_SAFE_INTEGER;
      const positionB = fieldPositions.get(fieldB) ?? Number.MAX_SAFE_INTEGER;

      return positionA - positionB;
    });

    return sorted;
  }, [fieldsByName, fieldPositions]);

  const optionalFieldNames = useMemo(() => {
    const optionalDefaults = ACCOUNT_PAYABLE_PRIMARY_FIELDS.filter(
      (fieldName) =>
        !requiredFieldNameSet.has(fieldName) &&
        !relationFieldNameSet.has(fieldName) &&
        fieldsByName[fieldName],
    );

    optionalDefaults.sort((fieldA, fieldB) => {
      const positionA = fieldPositions.get(fieldA) ?? Number.MAX_SAFE_INTEGER;
      const positionB = fieldPositions.get(fieldB) ?? Number.MAX_SAFE_INTEGER;

      return positionA - positionB;
    });

    return optionalDefaults;
  }, [
    relationFieldNameSet,
    requiredFieldNameSet,
    fieldsByName,
    fieldPositions,
  ]);

  const connectionFieldNames = useMemo(() => {
    const essentialRelationNames = new Set<string>(
      essentialFieldNames.filter((fieldName) =>
        relationFieldNameSet.has(fieldName),
      ),
    );

    const connections = relationFieldMetadataItems
      .map(({ name }) => name)
      .filter((fieldName) => !essentialRelationNames.has(fieldName));

    connections.sort((fieldA, fieldB) => {
      const positionA = fieldPositions.get(fieldA) ?? Number.MAX_SAFE_INTEGER;
      const positionB = fieldPositions.get(fieldB) ?? Number.MAX_SAFE_INTEGER;

      return positionA - positionB;
    });

    return connections;
  }, [
    essentialFieldNames,
    relationFieldMetadataItems,
    relationFieldNameSet,
    fieldPositions,
  ]);

  const additionalFieldNames = useMemo(() => {
    const excludedNames = new Set([
      ...essentialFieldNames,
      ...optionalFieldNames,
      ...connectionFieldNames,
    ]);

    return orderedFieldNames.filter(
      (fieldName) => !excludedNames.has(fieldName),
    );
  }, [
    connectionFieldNames,
    essentialFieldNames,
    optionalFieldNames,
    orderedFieldNames,
  ]);
  /* @kvoip-woulz proprietary:end */

  const renderField = (fieldName: string) => {
    const fieldMetadataItem = fieldsByName[fieldName];
    const fieldPosition = fieldPositions.get(fieldName);

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
            position: fieldPosition,
            objectMetadataItem,
            showLabel: true,
            labelWidth: 90,
          }),
          useUpdateRecord: useUpdateOneObjectRecordMutation,
          isDisplayModeFixHeight: true,
          onMouseEnter: () => handleMouseEnter(fieldPosition),
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

  /* @kvoip-woulz proprietary:begin */
  const renderFieldsSection = (title: string, fieldNames: string[]) => {
    if (fieldNames.length === 0) {
      return null;
    }

    return (
      <StyledFieldsGreyBox key={title}>
        <StyledFieldsSectionTitle>{title}</StyledFieldsSectionTitle>
        <StyledFieldsList>
          {fieldNames.map((fieldName) => renderField(fieldName))}
        </StyledFieldsList>
      </StyledFieldsGreyBox>
    );
  };
  /* @kvoip-woulz proprietary:end */

  return (
    <RecordFieldListComponentInstanceContext.Provider value={{ instanceId }}>
      <PropertyBox>
        {isPrefetchLoading ? (
          <PropertyBoxSkeletonLoader />
        ) : (
          <>
            <StyledCardHeader>
              <StyledTitleFieldContainer>
                {renderField(headerFieldName)}
              </StyledTitleFieldContainer>
              <StyledCardHeaderActions>
                <Dropdown
                  dropdownId={actionsDropdownId}
                  dropdownPlacement="bottom-end"
                  clickableComponent={
                    <StyledActionsButton
                      variant="secondary"
                      accent="default"
                      title="Actions"
                      Icon={IconChevronDown}
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
            <StyledCardHeaderDivider />

            {/* @kvoip-woulz proprietary:begin */}
            <StyledFieldsSectionsContainer>
              {renderFieldsSection('Essential Fields', essentialFieldNames)}
              {renderFieldsSection('Optional Fields', optionalFieldNames)}
              {renderFieldsSection('Additional Fields', additionalFieldNames)}
              {renderFieldsSection(
                'Connections & Integrations',
                connectionFieldNames,
              )}
            </StyledFieldsSectionsContainer>
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
  /* @kvoip-woulz proprietary:begin */
  const tabListComponentId = useMemo(() => `${instanceId}-tabs`, [instanceId]);
  /* @kvoip-woulz proprietary:end */

  const setRecordFieldListHoverPosition = useSetRecoilComponentState(
    recordFieldListHoverPositionComponentState,
    instanceId,
  );

  const { getRenderableField, fieldsByName, relationFieldConfigs } =
    useCreateFormFields({
      objectMetadataItem,
      objectNameSingular,
    });

  const clearHoverState = useCallback(() => {
    setRecordFieldListHoverPosition(null);
  }, [setRecordFieldListHoverPosition]);

  const handleMouseEnter = useCallback(
    (position?: number) => {
      if (!isDefined(position)) {
        return;
      }

      setRecordFieldListHoverPosition(position);
    },
    [setRecordFieldListHoverPosition],
  );

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

  const relationFieldNames = useMemo(
    () =>
      relationFieldConfigs.map(({ relationFieldName }) => relationFieldName),
    [relationFieldConfigs],
  );

  const relationFieldNameSet = useMemo(
    () => new Set<string>(relationFieldNames),
    [relationFieldNames],
  );

  /* @kvoip-woulz proprietary:begin */
  const objectRelationNamesSet = useMemo(() => {
    const names = new Set<string>();

    objectMetadataItem.fields.forEach((fieldMetadataItem) => {
      if (
        fieldMetadataItem.type === FieldMetadataType.RELATION &&
        fieldMetadataItem.isActive !== false
      ) {
        names.add(fieldMetadataItem.name);
      }
    });

    return names;
  }, [objectMetadataItem.fields]);

  const supportsTasksTab = objectRelationNamesSet.has('taskTargets');
  const supportsNotesTab = objectRelationNamesSet.has('noteTargets');
  const supportsFilesTab = objectRelationNamesSet.has('attachments');
  const supportsEmailsTab = objectRelationNamesSet.has('emails');
  const supportsCalendarTab =
    objectRelationNamesSet.has('calendarEvents') ||
    objectRelationNamesSet.has('eventParticipants');

  const draftTabs = useMemo<SingleTabProps[]>(() => {
    const tabs: SingleTabProps[] = [
      {
        id: 'home',
        title: 'Home',
        Icon: IconHome,
        disabled: false,
      },
    ];

    const disabledTabConfig = {
      disabled: true,
      disabledTooltip: 'Save to access this section',
    };

    if (supportsTasksTab) {
      tabs.push({
        id: 'tasks',
        title: 'Tasks',
        Icon: IconCheckbox,
        ...disabledTabConfig,
      });
    }

    if (supportsNotesTab) {
      tabs.push({
        id: 'notes',
        title: 'Notes',
        Icon: IconNotes,
        ...disabledTabConfig,
      });
    }

    if (supportsFilesTab) {
      tabs.push({
        id: 'files',
        title: 'Files',
        Icon: IconPaperclip,
        ...disabledTabConfig,
      });
    }

    if (supportsEmailsTab) {
      tabs.push({
        id: 'emails',
        title: 'Emails',
        Icon: IconMail,
        ...disabledTabConfig,
      });
    }

    if (supportsCalendarTab) {
      tabs.push({
        id: 'calendar',
        title: 'Calendar',
        Icon: IconCalendarEvent,
        ...disabledTabConfig,
      });
    }

    return tabs;
  }, [
    supportsCalendarTab,
    supportsEmailsTab,
    supportsFilesTab,
    supportsNotesTab,
    supportsTasksTab,
  ]);
  /* @kvoip-woulz proprietary:end */

  const relationFieldPriorityMap = useMemo(() => {
    const priorities = new Map<string, number>();

    ACCOUNT_PAYABLE_RELATION_FIELDS.forEach((fieldName, index) => {
      priorities.set(fieldName, index);
    });

    return priorities;
  }, []);

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

  const requiredFieldNamesSet = useMemo(
    () => new Set<string>(ACCOUNT_PAYABLE_REQUIRED_FIELDS),
    [],
  );

  const requiredRelationFieldNamesSet = useMemo(() => {
    const names = new Set<string>();

    relationFieldConfigs.forEach(({ relationFieldName }) => {
      if (requiredFieldNamesSet.has(relationFieldName)) {
        names.add(relationFieldName);
      }
    });

    return names;
  }, [relationFieldConfigs, requiredFieldNamesSet]);

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

  const labelIdentifierFieldMetadataItem = objectMetadataItem.fields.find(
    ({ id }) => id === objectMetadataItem.labelIdentifierFieldMetadataId,
  );

  const headerFieldName = labelIdentifierFieldMetadataItem?.name ?? 'name';

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

  const headerFieldLabel = labelIdentifierFieldMetadataItem?.label ?? 'Title';

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

  const excludedFieldNamesSet = useMemo(
    () =>
      new Set<string>([
        headerFieldName,
        ...ACCOUNT_PAYABLE_EXCLUDED_SYSTEM_FIELDS,
        ...relationIdFieldNames,
      ]),
    [headerFieldName, relationIdFieldNames],
  );

  const dynamicFieldNames = useMemo(
    () =>
      objectMetadataItem.fields
        .filter((fieldMetadataItem) => {
          const { name } = fieldMetadataItem;

          if (excludedFieldNamesSet.has(name)) {
            return false;
          }

          if (relationFieldNameSet.has(name)) {
            return false;
          }

          if (fieldMetadataItem.isSystem === true) {
            return false;
          }

          if (fieldMetadataItem.type === FieldMetadataType.RELATION) {
            return false;
          }

          return getRenderableField(name) !== null;
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
    [
      excludedFieldNamesSet,
      getRenderableField,
      objectMetadataItem.fields,
      relationFieldNameSet,
    ],
  );

  const orderedBaseFieldNames = useMemo(() => {
    const seen = new Set<string>();
    const fieldNames: string[] = [];

    const pushFieldName = (fieldName: string | undefined) => {
      if (!fieldName) {
        return;
      }

      if (excludedFieldNamesSet.has(fieldName)) {
        return;
      }

      if (relationFieldNameSet.has(fieldName)) {
        return;
      }

      if (seen.has(fieldName)) {
        return;
      }

      if (getRenderableField(fieldName) === null) {
        return;
      }

      seen.add(fieldName);
      fieldNames.push(fieldName);
    };

    ACCOUNT_PAYABLE_PRIMARY_FIELDS.forEach(pushFieldName);
    dynamicFieldNames.forEach(pushFieldName);

    return fieldNames;
  }, [
    excludedFieldNamesSet,
    dynamicFieldNames,
    getRenderableField,
    relationFieldNameSet,
  ]);

  const orderedRelationFieldItems = useMemo(
    () =>
      relationFieldConfigs
        .map((config) => {
          const fieldConfig = getRenderableField(config.relationFieldName);

          if (!fieldConfig) {
            return null;
          }

          return {
            ...config,
            position: fieldConfig.position,
            priority:
              relationFieldPriorityMap.get(config.relationFieldName) ??
              Number.MAX_SAFE_INTEGER,
          };
        })
        .filter(
          (
            config,
          ): config is {
            relationFieldName: string;
            relationIdFieldName: string;
            label: string;
            position: number;
            priority: number;
          } => config !== null,
        )
        .sort((configA, configB) => {
          if (configA.priority !== configB.priority) {
            return configA.priority - configB.priority;
          }

          return configA.position - configB.position;
        }),
    [getRenderableField, relationFieldConfigs, relationFieldPriorityMap],
  );

  /* @kvoip-woulz proprietary:begin */
  const essentialBaseFieldNames = useMemo(
    () =>
      orderedBaseFieldNames.filter((fieldName) =>
        requiredFieldNamesSet.has(fieldName),
      ),
    [orderedBaseFieldNames, requiredFieldNamesSet],
  );

  const optionalBaseFieldNames = useMemo(() => {
    const optionalDefaults = new Set<string>(
      ACCOUNT_PAYABLE_PRIMARY_FIELDS.filter(
        (fieldName) =>
          !requiredFieldNamesSet.has(fieldName) &&
          !relationFieldNameSet.has(fieldName),
      ),
    );

    return orderedBaseFieldNames.filter((fieldName) =>
      optionalDefaults.has(fieldName),
    );
  }, [orderedBaseFieldNames, relationFieldNameSet, requiredFieldNamesSet]);

  const additionalBaseFieldNames = useMemo(() => {
    const excludedNames = new Set([
      ...essentialBaseFieldNames,
      ...optionalBaseFieldNames,
    ]);

    return orderedBaseFieldNames.filter(
      (fieldName) => !excludedNames.has(fieldName),
    );
  }, [essentialBaseFieldNames, optionalBaseFieldNames, orderedBaseFieldNames]);

  const essentialRelationFieldItems = useMemo(
    () =>
      orderedRelationFieldItems.filter(({ relationFieldName }) =>
        requiredFieldNamesSet.has(relationFieldName),
      ),
    [orderedRelationFieldItems, requiredFieldNamesSet],
  );

  const connectionRelationFieldItems = useMemo(
    () =>
      orderedRelationFieldItems.filter(
        ({ relationFieldName }) =>
          !requiredFieldNamesSet.has(relationFieldName),
      ),
    [orderedRelationFieldItems, requiredFieldNamesSet],
  );
  /* @kvoip-woulz proprietary:end */

  const getFieldCurrentValue = useCallback(
    (fieldName: string) => {
      if (Object.prototype.hasOwnProperty.call(draftValues, fieldName)) {
        return draftValues[fieldName];
      }

      const fieldMetadataItem = fieldsByName[fieldName];

      return fieldMetadataItem?.defaultValue ?? undefined;
    },
    [draftValues, fieldsByName],
  );

  const isValueFilled = useCallback((value: unknown) => {
    if (value === null || value === undefined) {
      return false;
    }

    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    if (typeof value === 'number') {
      return !Number.isNaN(value);
    }

    if (typeof value === 'boolean') {
      return value;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === 'object') {
      const record = value as Record<string, unknown>;

      if ('id' in record) {
        const idValue = record.id;

        if (typeof idValue === 'string') {
          return idValue.trim().length > 0;
        }

        return idValue !== null && idValue !== undefined;
      }

      return Object.keys(record).length > 0;
    }

    return true;
  }, []);

  const areRequiredFieldsFilled = useMemo(
    () =>
      ACCOUNT_PAYABLE_REQUIRED_FIELDS.every((fieldName) => {
        const fieldValue = getFieldCurrentValue(fieldName);

        if (requiredRelationFieldNamesSet.has(fieldName)) {
          return isValueFilled(fieldValue);
        }

        return isValueFilled(fieldValue);
      }),
    [
      getFieldCurrentValue,
      isValueFilled,
      requiredRelationFieldNamesSet,
      draftValues,
    ],
  );

  /* @kvoip-woulz proprietary:begin */
  const renderDraftSection = (
    title: string,
    baseFieldNames: string[],
    relationFieldItems: {
      relationFieldName: string;
      label: string;
    }[] = [],
  ) => {
    if (baseFieldNames.length === 0 && relationFieldItems.length === 0) {
      return null;
    }

    return (
      <StyledFieldsGreyBox key={title}>
        <StyledFieldsSectionTitle>{title}</StyledFieldsSectionTitle>
        {baseFieldNames.length > 0 && (
          <StyledFieldsList>
            {baseFieldNames.map((fieldName) => {
              const fieldElement = renderCreateField(
                fieldName as Parameters<typeof renderCreateField>[0],
              );
              if (!fieldElement) {
                return null;
              }

              return <Fragment key={fieldName}>{fieldElement}</Fragment>;
            })}
          </StyledFieldsList>
        )}
        {relationFieldItems.length > 0 && (
          <StyledRelationSection>
            <StyledRelationFieldsList>
              {relationFieldItems.map(({ relationFieldName, label }) => (
                <StyledRelationFieldItem key={relationFieldName}>
                  <StyledRelationFieldLabel>{label}</StyledRelationFieldLabel>
                  {renderCreateField(
                    relationFieldName as Parameters<
                      typeof renderCreateField
                    >[0],
                    {
                      showLabel: false,
                    },
                  )}
                </StyledRelationFieldItem>
              ))}
            </StyledRelationFieldsList>
          </StyledRelationSection>
        )}
      </StyledFieldsGreyBox>
    );
  };
  /* @kvoip-woulz proprietary:end */

  return (
    <RecordFieldListComponentInstanceContext.Provider value={{ instanceId }}>
      {/* @kvoip-woulz proprietary:begin */}
      <StyledDraftLayout>
        {draftTabs.length > 1 && (
          <StyledDraftTabListContainer>
            <StyledDraftTabList
              behaveAsLinks={false}
              loading={false}
              tabs={draftTabs}
              componentInstanceId={tabListComponentId}
              isInRightDrawer={isInRightDrawer}
            />
          </StyledDraftTabListContainer>
        )}
        <StyledDraftActionsContainer>
          <Dropdown
            dropdownId={actionsDropdownId}
            dropdownPlacement="bottom-end"
            clickableComponent={
              <StyledDraftActionsButton
                variant="secondary"
                accent="default"
                title="Actions"
                Icon={IconChevronDown}
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
        </StyledDraftActionsContainer>
        <PropertyBox>
          {/* @kvoip-woulz proprietary:end */}
          <StyledCardHeader>
            <StyledTitleFieldContainer>
              <StyledTitleFieldContent>
                {/* @kvoip-woulz proprietary:begin */}
                <StyledTitleTextInput
                  value={headerFieldValue}
                  onChange={handleHeaderFieldChange}
                  placeholder={headerFieldLabel}
                  autoFocus
                  fullWidth
                  autoGrow
                  inheritFontStyles
                  sizeVariant="md"
                  onFocus={clearHoverState}
                  onMouseEnter={clearHoverState}
                  spellCheck={false}
                />
                {/* @kvoip-woulz proprietary:end */}
              </StyledTitleFieldContent>
            </StyledTitleFieldContainer>
          </StyledCardHeader>
          <StyledCardHeaderDivider />
          {/* @kvoip-woulz proprietary:begin */}
          <StyledFieldsSectionsContainer>
            {renderDraftSection(
              'Essential Fields',
              essentialBaseFieldNames,
              essentialRelationFieldItems.map(
                ({ relationFieldName, label }) => ({
                  relationFieldName,
                  label,
                }),
              ),
            )}
            {renderDraftSection('Optional Fields', optionalBaseFieldNames)}
            {renderDraftSection('Additional Fields', additionalBaseFieldNames)}
            {renderDraftSection(
              'Connections & Integrations',
              [],
              connectionRelationFieldItems.map(
                ({ relationFieldName, label }) => ({
                  relationFieldName,
                  label,
                }),
              ),
            )}
          </StyledFieldsSectionsContainer>
          {/* @kvoip-woulz proprietary:end */}

          <StyledButtonContainer>
            <StyledSaveButton
              variant="secondary"
              accent="blue"
              title="Save"
              Icon={IconDeviceFloppy}
              justify="center"
              onClick={handleSave}
              fullWidth
              isLoading={saving || createLoading}
              disabled={!areRequiredFieldsFilled || saving || createLoading}
            />
          </StyledButtonContainer>
          {/* @kvoip-woulz proprietary:begin */}
        </PropertyBox>
      </StyledDraftLayout>
      {/* @kvoip-woulz proprietary:end */}

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
