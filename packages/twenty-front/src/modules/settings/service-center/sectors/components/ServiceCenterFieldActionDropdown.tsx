import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  IconArchive,
  IconComponent,
  IconDotsVertical,
  IconPencil,
  IconTextSize,
} from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem } from 'twenty-ui/navigation';
import { SERVICE_CENTER_ACTION_MODAL_ID } from '../constants/ServiceCenterActionModalId';
import { settingsDataModelFieldIconLabelFormSchema } from '@/settings/data-model/fields/forms/components/SettingsDataModelFieldIconLabelForm';

export type ActionType = 'Edit' | 'View';

type ExtraMenuItem = {
  text: string;
  icon: IconComponent;
  onClick?: () => void;
  modalConfig?: {
    title: string;
    subtitle: string;
    confirmButtonText?: string;
    onConfirm: () => void;
  };
};

type ServiceCenterFieldActionDropdownProps = {
  modalMessage?: {
    title: string;
    subtitle: string;
  };
  onDelete?: () => void;
  onDeactivate?: () => void;
  onEdit?: (action: ActionType) => void;
  onSetAsLabelIdentifier?: () => void;
  scopeKey: string;
  isActive?: boolean;
  extraMenuItems?: ExtraMenuItem[];
};

export const ServiceCenterFieldActionDropdown = ({
  modalMessage,
  onDelete,
  onDeactivate,
  onEdit,
  onSetAsLabelIdentifier,
  scopeKey,
  isActive,
  extraMenuItems,
}: ServiceCenterFieldActionDropdownProps) => {
  const { closeModal, openModal } = useModal();
  const dropdownId = `${scopeKey}-settings-field-active-action-dropdown`;

  const { toggleDropdown } = useToggleDropdown();
  const { t } = useLingui();

  const [activeExtraModal, setActiveExtraModal] =
    useState<ExtraMenuItem | null>(null);

  const handleDelete = () => {
    onDelete?.();
    closeModal(SERVICE_CENTER_ACTION_MODAL_ID);
    toggleDropdown();
  };

  const handleDeactivate = () => {
    onDeactivate?.();
    closeModal(SERVICE_CENTER_ACTION_MODAL_ID);
    toggleDropdown();
  };

  const handleSetAsLabelIdentifier = () => {
    onSetAsLabelIdentifier?.();
    toggleDropdown();
  };

  return (
    <>
      <Dropdown
        dropdownId={dropdownId}
        clickableComponent={
          <LightIconButton
            aria-label="Active Field Options"
            Icon={IconDotsVertical}
            accent="tertiary"
          />
        }
        dropdownComponents={
          <DropdownContent>
            <DropdownMenuItemsContainer>
              {/* --- FIXOS --- */}

              {!!onEdit && (              
                <MenuItem
                  text={t`Edit`}
                  LeftIcon={IconPencil}
                  onClick={() => {
                    onEdit('Edit');
                    toggleDropdown();
                  }}
                />
              )}

              {!!onSetAsLabelIdentifier && (
                <MenuItem
                  text={t`Set as record text`}
                  LeftIcon={IconTextSize}
                  onClick={() => {
                    onSetAsLabelIdentifier?.();
                    toggleDropdown();
                  }}
                />
              )}

              {!!onDelete && (
                <MenuItem
                  text={t`Delete`}
                  LeftIcon={IconArchive}
                  onClick={() => openModal(SERVICE_CENTER_ACTION_MODAL_ID)}
                />
              )}

              {!!onDeactivate && (
                <MenuItem
                  text={isActive ? t`deactivate` : t`reactivate`}
                  LeftIcon={IconArchive}
                  onClick={() => openModal(SERVICE_CENTER_ACTION_MODAL_ID)}
                />
              )}

              {extraMenuItems?.map((item, idx) => (
                <MenuItem
                  key={idx}
                  text={item.text}
                  LeftIcon={item.icon}
                  onClick={() => {
                    if (item.modalConfig) {
                      setActiveExtraModal(item);
                      openModal(SERVICE_CENTER_ACTION_MODAL_ID);
                    } else {
                      item.onClick?.();
                      toggleDropdown();
                    }
                  }}
                />
              ))}
            </DropdownMenuItemsContainer>
          </DropdownContent>
        }
      />

      {!!modalMessage && (
        <ConfirmationModal
          modalId={SERVICE_CENTER_ACTION_MODAL_ID}
          title={modalMessage.title}
          subtitle={modalMessage.subtitle}
          onConfirmClick={onDelete ? handleDelete : handleDeactivate}
          confirmButtonText={t`Continue`}
        />
      )}

      {activeExtraModal && (
        <ConfirmationModal
          modalId={SERVICE_CENTER_ACTION_MODAL_ID}
          title={activeExtraModal.modalConfig?.title ?? ''}
          subtitle={activeExtraModal.modalConfig?.subtitle ?? ''}
          onConfirmClick={() => {
            activeExtraModal.modalConfig?.onConfirm();
            setActiveExtraModal(null);
            closeModal(SERVICE_CENTER_ACTION_MODAL_ID);
            toggleDropdown();
          }}
          confirmButtonText={
            activeExtraModal.modalConfig?.confirmButtonText ?? t`Confirm`
          }
        />
      )}
    </>
  );
};
