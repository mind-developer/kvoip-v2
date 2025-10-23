/* @kvoip-woulz proprietary */
import { TextInput } from '@/ui/input/components/TextInput';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import React from 'react';
import { Session } from 'sip.js';
import { IconArrowLeft, IconPhone, useIcons } from 'twenty-ui/display';
import { CallState } from '../../types/callState';
import { CallStatus } from '../../types/callStatusEnum';
import IncomingCallBody from '../dialer/IncomingCallBody';
import DTMFButton from '../ui/DTMFButton';
import HoldButton from '../ui/HoldButton';
import Keyboard from '../ui/Keyboard';
import KeyboardToggleButton from '../ui/KeyboardToggleButton';
import TransferButton from '../ui/TransferButton';

const StyledTextAndCallButton = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledDefaultContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
`;

const StyledOngoingCallContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(3)};
  width: 100%;
`;

const StyledControlsContainer = styled.div<{ column?: boolean; gap?: number }>`
  align-items: center;
  display: flex;
  flex-direction: ${({ column }) => (column ? 'column' : 'row')};
  gap: ${({ theme, gap }) => theme.spacing(gap || 1)};
`;

const StyledIncomingNumber = styled.span<{ alignSelf?: string }>`
  align-self: ${({ alignSelf }) => alignSelf || 'start'};
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledEndButton = styled.div`
  color: ${({ theme }) => theme.color.red10};
  font-size: ${({ theme }) => theme.font.size.md};
  width: 100%;
  text-align: center;

  background-color: ${({ theme }) => theme.color.red};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  padding-block: ${({ theme }) => theme.spacing(2)};

  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.color.red50};
  }
`;

interface CallControlsProps {
  callState: CallState;
  isKeyboardExpanded: boolean;
  isSendingDTMF: boolean;
  dtmf: string;
  currentNumber: string;
  session: Session | null;
  onCall: () => void;
  onAccept: () => void;
  onReject: () => void;
  onEnd: () => void;
  onMute: () => void;
  onKeyboardClick: (key: string) => void;
  onSendDtmf: (key: string) => void;
  onToggleKeyboard: () => void;
  onSetIsSendingDTMF: (value: boolean) => void;
  onSetCurrentNumber: (number: string) => void;
  setCallState: React.Dispatch<React.SetStateAction<CallState>>;
  transferCall: (to: string) => void;
  onOpenTransferModal: () => void;
}

export const CallControls: React.FC<CallControlsProps> = ({
  callState,
  isKeyboardExpanded,
  isSendingDTMF,
  dtmf,
  currentNumber,
  session,
  onCall,
  onAccept,
  onReject,
  onEnd,
  onMute,
  onKeyboardClick,
  onSendDtmf,
  onToggleKeyboard,
  onSetIsSendingDTMF,
  onSetCurrentNumber,
  setCallState,
  transferCall,
  onOpenTransferModal
}) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const IconMicrophoneOff = getIcon('IconMicrophoneOff');

  // Debug logs
  // console.log('CallControls render - callState:', {
  //   isRegistered: callState.isRegistered,
  //   isInCall: callState.isInCall,
  //   callStatus: callState.callStatus,
  //   currentNumber: callState.currentNumber
  // });
  // console.log('CallControls render - UI state:', {
  //   isKeyboardExpanded,
  //   isSendingDTMF,
  //   currentNumber
  // });

  // Chamada recebida
  if (callState.incomingCall && !callState.isInCall) {
    return (
      <IncomingCallBody
        incomingCallNumber={callState.incomingCallNumber}
        onAccept={onAccept}
        onReject={onReject}
      />
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <StyledDefaultContainer>
        <StyledTextAndCallButton>
          {/* Input de discagem */}
          {!callState.isInCall && !callState.callStatus && (
            <TextInput
              placeholder={t`Dial the phone number`}
              fullWidth
              value={currentNumber}
              onChange={(e) => {
                if (!callState.isInCall) {
                  onSetCurrentNumber(e.replace(/\D/g, ''));
                }
              }}
              RightIcon={() => (
                <KeyboardToggleButton
                  isExpanded={isKeyboardExpanded}
                  onToggle={onToggleKeyboard}
                />
              )}
              disabled={callState.isInCall}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && callState.isRegistered) {
                  onCall();
                }
              }}
            />
          )}

          {/* Botão de chamada */}
          {(() => {
            const shouldShowCallButton = callState.isRegistered &&
              !callState.isInCall &&
              !callState.callStatus &&
              !isKeyboardExpanded;
            
            // console.log('Should show call button:', shouldShowCallButton, {
            //   isRegistered: callState.isRegistered,
            //   isInCall: callState.isInCall,
            //   callStatus: callState.callStatus,
            //   isKeyboardExpanded
            // });
            
            return shouldShowCallButton && (
              <IconPhone
                onClick={() => {
                  // console.log('Botão de chamada clicado!');
                  onCall();
                }}
                size={theme.icon.size.lg}
                stroke={theme.icon.stroke.sm}
                color={theme.color.green20}
                style={{
                  cursor: 'pointer',
                  padding: theme.spacing(1),
                  borderRadius: '50%',
                  backgroundColor: theme.color.green60,
                }}
              />
            );
          })()}

          {/* Input DTMF */}
          {isSendingDTMF && (
            <TextInput
              placeholder={t`Dial the phone number (DTMF)`}
              fullWidth
              value={dtmf}
              // onChange={(e) => {
              //   onSendDtmf(e);
              // }}
              onKeyDown={(e) => {
                e.preventDefault();

                onSendDtmf(e.key);
                // if (e.key === 'Backspace') {
                //   // Prevenir o comportamento padrão do backspace
                //   e.preventDefault();
                //   // Remover o último caractere do dtmf sem enviar DTMF
                //   const newDtmf = dtmf.slice(0, -1);
                //   onSendDtmf(newDtmf);
                // }
              }}
              RightIcon={() => (
                <KeyboardToggleButton
                  isExpanded={isKeyboardExpanded}
                  onToggle={onToggleKeyboard}
                />
              )}
            />
          )}

          {/* Botão voltar do DTMF */}
          {isSendingDTMF && !isKeyboardExpanded && (
            <IconArrowLeft
              onClick={() => {
                onSetIsSendingDTMF(false);
                onToggleKeyboard();
              }}
              size={theme.icon.size.lg}
              stroke={theme.icon.stroke.sm}
              color={theme.color.red10}
              style={{
                cursor: 'pointer',
                padding: theme.spacing(1),
                borderRadius: '50%',
                backgroundColor: theme.color.red50,
              }}
            />
          )}
        </StyledTextAndCallButton>

        {/* Teclado */}
        <Keyboard
          isVisible={isKeyboardExpanded}
          onClick={!isSendingDTMF ? onKeyboardClick : onSendDtmf}
        />

        {/* Botão de chamada quando teclado expandido */}
        {callState.isRegistered &&
          !callState.isInCall &&
          !callState.callStatus &&
          isKeyboardExpanded && (
            <IconPhone
              onClick={onCall}
              size={theme.icon.size.lg}
              stroke={theme.icon.stroke.sm}
              color={theme.color.gray30}
              style={{
                cursor: 'pointer',
                padding: theme.spacing(5),
                borderRadius: '50%',
                backgroundColor: theme.color.green60,
              }}
            />
          )}

        {/* Botão voltar do DTMF quando teclado expandido */}
        {isSendingDTMF && isKeyboardExpanded && (
          <IconArrowLeft
            onClick={() => {
              onSetIsSendingDTMF(false);
              onToggleKeyboard();
            }}
            size={theme.icon.size.lg}
            stroke={theme.icon.stroke.sm}
            color={theme.color.red10}
            style={{
              cursor: 'pointer',
              padding: theme.spacing(5),
              borderRadius: '50%',
              backgroundColor: theme.color.red50,
            }}
          />
        )}
      </StyledDefaultContainer>

      {/* Chamada em andamento */}
      {callState.isInCall && !isSendingDTMF && (
        <StyledOngoingCallContainer>
          <StyledIncomingNumber alignSelf="center">
            {currentNumber}
          </StyledIncomingNumber>

          <StyledControlsContainer column={false} gap={5}>
            <HoldButton
              session={session}
              isOnHold={callState.isOnHold}
              setCallState={setCallState}
              callState={callState}
            />

            <div
              onClick={onMute}
              style={{
                cursor: 'pointer',
                padding: theme.spacing(3),
                borderRadius: '50%',
                border: `1px solid #fff`,
                backgroundColor: callState.isMuted
                  ? theme.background.overlaySecondary
                  : theme.background.tertiary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconMicrophoneOff
                size={theme.icon.size.lg}
                stroke={theme.icon.stroke.sm}
                color={theme.font.color.secondary}
              />
            </div>

              <TransferButton
                session={session}
                type="attended"
                onOpenTransferModal={onOpenTransferModal}
              />

            <DTMFButton setIsSendingDTMF={onSetIsSendingDTMF} />
          </StyledControlsContainer>

          <StyledEndButton onClick={onEnd}>
            {t`End call`}
          </StyledEndButton>
        </StyledOngoingCallContainer>
      )}

      {/* Botão encerrar para chamadas em andamento */}
      {(callState.callStatus === CallStatus.CALLING ||
        callState.callStatus === CallStatus.STARTING_CALL) && (
        <StyledEndButton onClick={onEnd}>
          {t`End call`}
        </StyledEndButton>
      )}
    </div>
  );
};
