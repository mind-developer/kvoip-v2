/* @kvoip-woulz proprietary */
import { useTheme } from '@emotion/react';
import React from 'react';
import { Session } from 'sip.js';
import { IconArrowRight } from 'twenty-ui/display';

interface TransferButtonProps {
  session: Session | null;
  type: 'attended' | 'blind';
  onOpenTransferModal: () => void;
}

const TransferButton: React.FC<TransferButtonProps> = ({ onOpenTransferModal }) => {
  const theme = useTheme();

  return (
    <IconArrowRight
      onClick={onOpenTransferModal}
      size={theme.icon.size.lg}
      stroke={theme.icon.stroke.sm}
      color={theme.font.color.secondary}
      style={{
        cursor: 'pointer',
        padding: theme.spacing(3),
        borderRadius: '50%',
        border: `1px solid #fff`,
      }}
    />
  );
};

export default TransferButton;
