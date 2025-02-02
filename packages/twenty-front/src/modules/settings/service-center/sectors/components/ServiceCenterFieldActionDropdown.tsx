import {
  IconArchive,
  IconDotsVertical,
  IconPencil,
  IconTextSize,
  LightIconButton,
  MenuItem,
} from 'twenty-ui';

import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useState } from 'react';

type ServiceCenterFieldActionDropdownProps = {
  modalMessage: {
    title: string;
    subtitle: string;
  };
  onDelete?: () => void;
  onDeactivate?: () => void;
  onEdit: (action: ActionType) => void;
  onSetAsLabelIdentifier?: () => void;
  scopeKey: string;
  isActive?: boolean;
};

export type ActionType = 'Edit' | 'View';

export const ServiceCenterFieldActionDropdown = ({
  modalMessage,
  onDelete,
  onDeactivate,
  onEdit,
  onSetAsLabelIdentifier,
  scopeKey,
  isActive,
}: ServiceCenterFieldActionDropdownProps) => {
  // const { t } = useTranslation();

  const dropdownId = `${scopeKey}-settings-field-active-action-dropdown`;

  const { closeDropdown } = useDropdown(dropdownId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEdit = (action: ActionType) => {
    onEdit(action);
    closeDropdown();
  };

  const handleDelete = () => {
    onDelete?.();
    setIsModalOpen(false);
    closeDropdown();
  };

  const handleDeactivate = () => {
    onDeactivate?.();
    setIsModalOpen(false);
    closeDropdown();
  };

  const handleSetAsLabelIdentifier = () => {
    onSetAsLabelIdentifier?.();
    closeDropdown();
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
          <DropdownMenu width="100%">
            <DropdownMenuItemsContainer>
              <MenuItem
                text={'Edit'}
                LeftIcon={IconPencil}
                onClick={() => handleEdit('Edit')}
              />
              {!!onSetAsLabelIdentifier && (
                <MenuItem
                  text="Set as record text"
                  LeftIcon={IconTextSize}
                  onClick={handleSetAsLabelIdentifier}
                />
              )}
              {!!onDelete && (
                <MenuItem
                  text={'Delete'}
                  LeftIcon={IconArchive}
                  onClick={() => setIsModalOpen(true)}
                />
              )}
              {!!onDeactivate && (
                <MenuItem
                  text={isActive ? 'deactivate' : 'reactivate'}
                  LeftIcon={IconArchive}
                  onClick={() => setIsModalOpen(true)}
                />
              )}
            </DropdownMenuItemsContainer>
          </DropdownMenu>
        }
        dropdownHotkeyScope={{
          scope: dropdownId,
        }}
      />
      <ConfirmationModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        title={modalMessage.title}
        subtitle={modalMessage.subtitle}
        onConfirmClick={onDelete ? handleDelete : handleDeactivate}
        deleteButtonText="Continue"
      />
    </>
  );
};
