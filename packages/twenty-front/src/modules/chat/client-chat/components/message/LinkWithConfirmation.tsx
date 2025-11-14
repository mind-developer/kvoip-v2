/* @kvoip-woulz proprietary */
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { createPortal } from 'react-dom';

type LinkWithConfirmationProps = {
  href: string;
  children: React.ReactNode;
  LinkComponent: React.ElementType;
};

export const LinkWithConfirmation = ({
  href,
  children,
  LinkComponent,
}: LinkWithConfirmationProps) => {
  const { openModal, closeModal } = useModal();
  const { t } = useLingui();

  // Gera um ID único para o modal baseado na URL
  const modalId = useMemo(
    () => `link-confirmation-${href.replace(/[^a-zA-Z0-9]/g, '-')}`,
    [href],
  );

  const isModalOpened = useRecoilComponentValue(
    isModalOpenedComponentState,
    modalId,
  );

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    openModal(modalId);
  };

  const handleConfirm = () => {
    closeModal(modalId);
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  const handleCancel = () => {
    closeModal(modalId);
  };

  return (
    <>
      <LinkComponent href={href} onClick={handleClick}>
        {children}
      </LinkComponent>
      {isModalOpened &&
        createPortal(
          <ConfirmationModal
            modalId={modalId}
            title={t`Leaving Website`}
            subtitle={
              <>
                {t`You are about to leave this website and visit`}
                <strong> {href}</strong>
                <br />
                <br />
                {t`Woulz is not responsible for the content or the safety of the website you are visiting.`}
              </>
            }
            onConfirmClick={handleConfirm}
            onClose={handleCancel}
            confirmButtonText={t`Continue`}
            confirmButtonAccent="danger"
          />,
          document.body,
        )}
    </>
  );
};
