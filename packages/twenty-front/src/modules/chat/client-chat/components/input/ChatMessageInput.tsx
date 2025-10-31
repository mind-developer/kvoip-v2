import { AudioVisualizer } from '@/chat/client-chat/components/effects/AudioVisualizer';
import { UploadMediaPopup } from '@/chat/client-chat/components/input/UploadMediaPopup';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  ChatMessageType,
  type ClientChat,
  type ClientChatMessage,
} from 'twenty-shared/types';
import { IconPlayerPause, IconTrash, useIcons } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

const StyledInputContainer = styled.div`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.xxl};
  display: flex;
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledInput = styled.textarea`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.font.color.primary};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.md};
  line-height: 32px;
  max-height: 120px;
  min-height: 32px;
  outline: none;
  overflow-y: auto;
  resize: none;
  width: 100%;
`;

const StyledDiv = styled.div`
  align-items: center;
  bottom: ${({ theme }) => theme.spacing(3.5)};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledUploadMediaDiv = styled.div`
  bottom: ${({ theme }) => theme.spacing(3)};
  cursor: pointer;
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconButton = styled(IconButton)`
  align-items: center;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  height: 24px;
  justify-content: center;
  padding: 0;
  width: 24px;
`;

type ChatMessageInputProps = {
  selectedChat: ClientChat;
  newMessage: string;
  onInputChange: (ev: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onInputKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  recordingState: 'none' | 'recording' | 'paused';
  onStartRecording: () => void;
  mediaRecorder: MediaRecorder | null;
  audioStream: MediaStream | null;
  lastMessage: ClientChatMessage | null;
  onSendMessage: () => void;
};

export const ChatMessageInput = memo(
  ({
    selectedChat,
    newMessage,
    onInputChange,
    onInputKeyDown,
    recordingState,
    onStartRecording,
    mediaRecorder,
    audioStream,
    lastMessage,
    onSendMessage,
  }: ChatMessageInputProps) => {
    const theme = useTheme();
    const { getIcon } = useIcons();
    const [isUploadMediaPopupOpen, setIsUploadMediaPopupOpen] =
      useState<boolean>(false);
    const [audioVisualizerWidth, setAudioVisualizerWidth] =
      useState<number>(200);
    const inputContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (inputContainerRef.current) {
        setAudioVisualizerWidth(inputContainerRef.current.clientWidth);
      }
    }, [inputContainerRef]);

    const IconMicrophone = getIcon('IconMicrophone');
    const IconArrowUp = getIcon('IconArrowUp');
    const UploadMediaIcon = getIcon('IconPaperclip');

    const handleUploadMediaClick = useCallback(() => {
      if (recordingState === 'none') {
        setIsUploadMediaPopupOpen(!isUploadMediaPopupOpen);
        return;
      }
      mediaRecorder && mediaRecorder.stop();
    }, [recordingState, isUploadMediaPopupOpen, mediaRecorder]);

    const handleMicrophoneClick = useCallback(() => {
      switch (recordingState) {
        case 'none':
          onStartRecording();
          break;
        case 'recording':
          mediaRecorder && mediaRecorder.pause();
          break;
        case 'paused':
          mediaRecorder && mediaRecorder.resume();
          break;
      }
    }, [recordingState, onStartRecording, mediaRecorder]);

    const handleSendClick = useCallback(() => {
      onSendMessage();
      mediaRecorder && mediaRecorder.stop();
    }, [onSendMessage, mediaRecorder]);

    return (
      <StyledInputContainer>
        <StyledUploadMediaDiv>
          <StyledIconButton
            disabled={lastMessage?.type === ChatMessageType.TEMPLATE}
            Icon={recordingState === 'none' ? UploadMediaIcon : IconTrash}
            accent={recordingState === 'none' ? 'default' : 'danger'}
            variant="tertiary"
            size="small"
            onClick={handleUploadMediaClick}
          />
        </StyledUploadMediaDiv>
        {isUploadMediaPopupOpen && (
          <UploadMediaPopup
            setIsUploadMediaPopupOpen={setIsUploadMediaPopupOpen}
            clientChat={selectedChat}
          />
        )}
        {recordingState !== 'none' && (
          <div
            onClick={(e) => e.preventDefault()}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxHeight: 30,
              overflow: 'clip',
              pointerEvents: 'none',
            }}
            ref={inputContainerRef}
          >
            <AudioVisualizer
              stream={audioStream}
              isRecording={recordingState === 'recording'}
              width={audioVisualizerWidth}
              barWidth={audioVisualizerWidth / 20}
              color={theme.font.color.primary}
              barCount={80}
              scrollSpeed={1}
            />
          </div>
        )}
        {recordingState === 'none' && (
          <StyledInput
            autoComplete="off"
            rows={1}
            disabled={lastMessage?.type === ChatMessageType.TEMPLATE}
            className="new-message-input"
            placeholder="Message"
            onChange={onInputChange}
            value={newMessage}
            onKeyDown={onInputKeyDown}
          />
        )}
        <StyledDiv>
          {!newMessage.length && (
            <StyledIconButton
              Icon={
                recordingState !== 'recording'
                  ? IconMicrophone
                  : IconPlayerPause
              }
              onClick={handleMicrophoneClick}
              size="small"
            />
          )}
          {(newMessage.length > 0 || recordingState !== 'none') && (
            <StyledIconButton
              disabled={lastMessage?.type === ChatMessageType.TEMPLATE}
              Icon={(props) => (
                <IconArrowUp
                  {...props}
                  color={theme.font.color.inverted}
                  style={{ pointerEvents: 'none' }}
                />
              )}
              onClick={handleSendClick}
              variant="primary"
              accent="blue"
              size="medium"
            />
          )}
        </StyledDiv>
      </StyledInputContainer>
    );
  },
);
