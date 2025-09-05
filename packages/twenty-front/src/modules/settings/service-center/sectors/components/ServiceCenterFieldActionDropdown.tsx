import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
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

// type ServiceCenterFieldActionDropdownProps = {
//   modalMessage: {
//     title: string;
//     subtitle: string;
//   };
//   onDelete?: () => void;
//   onDeactivate?: () => void;
//   onEdit: (action: ActionType) => void;
//   onSetAsLabelIdentifier?: () => void;
//   scopeKey: string;
//   isActive?: boolean;
// };

// export type ActionType = 'Edit' | 'View';

// export const ServiceCenterFieldActionDropdown = ({
//   modalMessage,
//   onDelete,
//   onDeactivate,
//   onEdit,
//   onSetAsLabelIdentifier,
//   scopeKey,
//   isActive,
// }: ServiceCenterFieldActionDropdownProps) => {
//   const { closeModal, openModal } = useModal();
//   const dropdownId = `${scopeKey}-settings-field-active-action-dropdown`;

//   const { closeDropdown } = useDropdown(dropdownId);

//   const handleEdit = (action: ActionType) => {
//     onEdit(action);
//     closeDropdown();
//   };

//   const handleDelete = () => {
//     onDelete?.();
//     closeModal(SERVICE_CENTER_ACTION_MODAL_ID);
//     closeDropdown();
//   };

//   const handleDeactivate = () => {
//     onDeactivate?.();
//     closeModal(SERVICE_CENTER_ACTION_MODAL_ID);
//     closeDropdown();
//   };

//   const handleSetAsLabelIdentifier = () => {
//     onSetAsLabelIdentifier?.();
//     closeDropdown();
//   };

//   return (
//     <>
//       <Dropdown
//         dropdownId={dropdownId}
//         clickableComponent={
//           <LightIconButton
//             aria-label="Active Field Options"
//             Icon={IconDotsVertical}
//             accent="tertiary"
//           />
//         }
//         dropdownComponents={
//           <DropdownContent>
//             <DropdownMenuItemsContainer>
//               <MenuItem
//                 text={'Edit'}
//                 LeftIcon={IconPencil}
//                 onClick={() => handleEdit('Edit')}
//               />
//               {!!onSetAsLabelIdentifier && (
//                 <MenuItem
//                   text="Set as record text"
//                   LeftIcon={IconTextSize}
//                   onClick={handleSetAsLabelIdentifier}
//                 />
//               )}
//               {!!onDelete && (
//                 <MenuItem
//                   text={'Delete'}
//                   LeftIcon={IconArchive}
//                   onClick={() => openModal(SERVICE_CENTER_ACTION_MODAL_ID)}
//                 />
//               )}
//               {!!onDeactivate && (
//                 <MenuItem
//                   text={isActive ? 'deactivate' : 'reactivate'}
//                   LeftIcon={IconArchive}
//                   onClick={() => openModal(SERVICE_CENTER_ACTION_MODAL_ID)}
//                 />
//               )}
//             </DropdownMenuItemsContainer>
//           </DropdownContent>
//         }
//       />
//       <ConfirmationModal
//         modalId={SERVICE_CENTER_ACTION_MODAL_ID}
//         title={modalMessage.title}
//         subtitle={modalMessage.subtitle}
//         onConfirmClick={onDelete ? handleDelete : handleDeactivate}
//         confirmButtonText="Continue"
//       />
//     </>
//   );
// };

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
  const { closeDropdown } = useDropdown(dropdownId);

  const [activeExtraModal, setActiveExtraModal] = useState<ExtraMenuItem | null>(null);

  const handleDelete = () => {
    onDelete?.();
    closeModal(SERVICE_CENTER_ACTION_MODAL_ID);
    closeDropdown();
  };

  const handleDeactivate = () => {
    onDeactivate?.();
    closeModal(SERVICE_CENTER_ACTION_MODAL_ID);
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
          <DropdownContent>
            <DropdownMenuItemsContainer>
              {/* --- FIXOS --- */}
              <MenuItem
                text={'Edit'}
                LeftIcon={IconPencil}
                onClick={() => {
                  onEdit('Edit');
                  closeDropdown();
                }}
              />

              {!!onSetAsLabelIdentifier && (
                <MenuItem
                  text="Set as record text"
                  LeftIcon={IconTextSize}
                  onClick={() => {
                    onSetAsLabelIdentifier?.();
                    closeDropdown();
                  }}
                />
              )}

              {!!onDelete && (
                <MenuItem
                  text={'Delete'}
                  LeftIcon={IconArchive}
                  onClick={() => openModal(SERVICE_CENTER_ACTION_MODAL_ID)}
                />
              )}

              {!!onDeactivate && (
                <MenuItem
                  text={isActive ? 'deactivate' : 'reactivate'}
                  LeftIcon={IconArchive}
                  onClick={() => openModal(SERVICE_CENTER_ACTION_MODAL_ID)}
                />
              )}

              {/* --- DINÂMICOS --- */}
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
                      closeDropdown();
                    }
                  }}
                />
              ))}
            </DropdownMenuItemsContainer>
          </DropdownContent>
        }
      />

      <ConfirmationModal
        modalId={SERVICE_CENTER_ACTION_MODAL_ID}
        title={modalMessage.title}
        subtitle={modalMessage.subtitle}
        onConfirmClick={onDelete ? handleDelete : handleDeactivate}
        confirmButtonText="Continue"
      />

      {/* Modal para itens dinâmicos */}
      {activeExtraModal && (
        <ConfirmationModal
          modalId={SERVICE_CENTER_ACTION_MODAL_ID}
          title={activeExtraModal.modalConfig?.title ?? ''}
          subtitle={activeExtraModal.modalConfig?.subtitle ?? ''}
          onConfirmClick={() => {
            activeExtraModal.modalConfig?.onConfirm();
            setActiveExtraModal(null);
            closeModal(SERVICE_CENTER_ACTION_MODAL_ID);
            closeDropdown();
          }}
          confirmButtonText={activeExtraModal.modalConfig?.confirmButtonText ?? 'Confirm'}
        />
      )}
    </>
  );
};
