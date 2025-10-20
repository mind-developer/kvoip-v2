/* @kvoip-woulz proprietary */
import { useTheme } from '@emotion/react';
import React, { useState } from 'react';
import { Session } from 'sip.js';
import { IconArrowRight, IconCheck } from 'twenty-ui/display';

interface TransferButtonProps {
  session: Session | null;
  type: 'attended' | 'blind';
  sendDTMF: (tone: string) => void;
}

const TransferButton: React.FC<TransferButtonProps> = ({ type, sendDTMF }) => {
  const [isTransferring, setIsTransferring] = useState(false);
  const theme = useTheme();

  const handleTransfer = () => {
    const extension = window.prompt('Digite a extensão para transferir:');

    console.log('Extension to transfer:', extension);
    console.log('Type of transfer:', type);

    if (extension && extension.trim()) {
      const extensionDigits = extension.trim();
      console.log('Transferindo para extensão:', extensionDigits);
      
      // Usar a função de transferência real (SessionManager)
      sendDTMF(extensionDigits);
      setIsTransferring(true);
    }
  };

  const handleCompleteTransfer = () => {
    console.log('Transferência completada');
    setIsTransferring(false);
  };

  return (
    <>
      {isTransferring ? (
        <IconCheck
          onClick={handleCompleteTransfer}
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
      ) : (
        <IconArrowRight
          onClick={handleTransfer}
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
      )}
    </>
  );
};

export default TransferButton;
