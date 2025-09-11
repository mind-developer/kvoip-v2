/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { ChatAnex } from '@/chat/call-center/components/ChatAnex';
import { PaneChatHeader } from '@/chat/call-center/components/PaneChatHeader';
import StyledAudio from '@/chat/call-center/components/StyledAudio';
import { AvatarComponent } from '@/chat/call-center/components/UserInfoChat';
import { MODAL_IMAGE_POPUP } from '@/chat/call-center/constants/MODAL_IMAGE_POPUP';
import { CallCenterContext } from '@/chat/call-center/context/CallCenterContext';
import { useSendWhatsappMessages } from '@/chat/call-center/hooks/useSendWhatsappMessages';
import { CallCenterContextType } from '@/chat/call-center/types/CallCenterContextType';
import StyledImage from '@/chat/components/StyledImage';
import { StyledMessageBubble } from '@/chat/components/StyledMessageBubble';
import { NoSelectedChat } from '@/chat/error-handler/components/NoSelectedChat';
import { useUploadFileToBucket } from '@/chat/hooks/useUploadFileToBucket';
import { TDateFirestore } from '@/chat/types/chat';
import { validVideoTypes } from '@/chat/types/FileTypes';
import { MessageType } from '@/chat/types/MessageType';
import { IMessage, statusEnum } from '@/chat/types/WhatsappDocument';
import { formatDate } from '@/chat/utils/formatDate';
import { isWhatsappDocument } from '@/chat/utils/isWhatsappDocument';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { Person } from '@/people/types/Person';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconExclamationCircleFilled } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { useContext, useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { IconPlayerPause, IconTrash, useIcons } from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
import { v4 } from 'uuid';

const StyledPaneChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 0;
  padding: ${({ theme }) => theme.spacing(3)};
  padding-top: 0;
  gap: ${({ theme }) => theme.spacing(0)};
  width: 100%;
  background-color: ${({ theme }) =>
    theme.name === 'dark' ? 'black' : theme.background.primary};
`;

const StyledChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0)};
  max-width: 100%;
  height: 100%;
  overflow-y: auto;
  margin-inline: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(6)};
  padding-top: ${({ theme }) => theme.spacing(5)};
`;

const StyledMessageContainer = styled.div<{ fromMe: boolean }>`
  display: flex;
  flex-direction: ${({ fromMe }) => (fromMe ? 'row-reverse' : 'row')};
  align-items: center;
  width: 100%;
  justify-content: flex-start;
  border-radius: ${({ theme }) => theme.spacing(2)};
  transition: all 0.15s;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledAvatarMessage = styled.div`
  align-self: flex-end;
  // margin-top: 4px;
  z-index: 1;
`;

const StyledMessageItem = styled.div<{ isSystemMessage: boolean }>`
  display: flex;
  align-items: ${({ isSystemMessage }) =>
    isSystemMessage ? 'flex-end' : 'flex-start'};
  justify-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  width: auto;
  max-width: 70%;
  margin-left: ${({ isSystemMessage, theme }) =>
    isSystemMessage ? '0' : theme.spacing(2)};
  margin-right: ${({ isSystemMessage, theme }) =>
    isSystemMessage ? theme.spacing(2) : '0'};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledNameAndTimeContainer = styled.div<{ isSystemMessage: boolean }>`
  align-items: center;
  display: flex;
  flex-direction: ${({ isSystemMessage }) =>
    isSystemMessage ? 'row-reverse' : 'row'};
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledDateContainer = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledDocumentContainer = styled.div<{ isSystemMessage: boolean }>`
  display: flex;
  flex-direction: ${({ isSystemMessage }) =>
    isSystemMessage ? 'row-reverse' : 'row'};
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDocument = styled.a`
  color: ${({ theme }) => theme.font.color.primary};
  text-decoration: none;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const StyledMessage = styled.div<{ isSystemMessage: boolean }>`
  max-width: ${({ isSystemMessage }) => (isSystemMessage ? 'none' : '100%')};
  text-align: left;
`;

const StyledVideo = styled.video<{ isSystemMessage: boolean }>`
  display: block;
  margin-left: ${({ isSystemMessage }) => (isSystemMessage ? 'auto' : '0')};
  margin-right: ${({ isSystemMessage }) => (isSystemMessage ? '0' : 'auto')};
  max-height: 150px;
`;

const StyledLine = styled.p`
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
  padding: 0;
  word-break: break-word;
`;

const StyledInputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.xxl};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(2)};
`;

const StyledInput = styled.textarea`
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  font-size: ${({ theme }) => theme.font.size.md};
  font-family: ${({ theme }) => theme.font.family};
  color: ${({ theme }) => theme.font.color.tertiary};
  height: 10px;
  max-height: 200px;
  &::placeholder {
    line-height: 10px;
  }
`;

const StyledDiv = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledAnexDiv = styled.div`
  bottom: ${({ theme }) => theme.spacing(3)};
  cursor: pointer;
`;

const StyledImageContainer = styled.div<{ isSystemMessage: boolean }>`
  display: flex;
  flex-direction: ${({ isSystemMessage }) =>
    isSystemMessage ? 'row-reverse' : 'row'};
`;

const StyledIconButton = styled(IconButton)`
  border-radius: 50%;
  cursor: pointer;
  height: 24px;
  padding: '5px';
  min-width: 24px;
  animation: swap 0.5s cubic-bezier(0, 1.06, 0.53, 0.99);
  @keyframes swap {
    0% {
      transform: translateY(5px);
    }
    100% {
      transform: translateY(0px);
    }
  }
`;

const StyledButton = styled(Button)`
  font-weight: ${({ theme }) => theme.font.weight.regular};
  justify-content: center;
  width: 100%;
`;

const StyledMessageEvent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1)};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.color.gray50};
  padding-block: ${({ theme }) => theme.spacing(3)};
`;

// eslint-disable-next-line @nx/workspace-no-hardcoded-colors
const StyledModalOverlay = styled(motion.div)`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  user-select: none;
  width: 100%;
  z-index: 1000;
  animation: blur 0.3s ease-out;
  backdrop-filter: blur(20px);
  @keyframes blur {
    0% {
      backdrop-filter: blur(0px);
    }
    100% {
      backdrop-filter: blur(20px);
    }
  }
`;

const StyledModalImage = styled.img`
  max-width: 40%;
  max-height: 40dvh;
  object-fit: contain;
  ${MODAL_IMAGE_POPUP}
  border-radius: ${({ theme }) => theme.border.radius.md};
  transition: border-radius 0.3s;
  transition: transform cubic-bezier(0, 0.42, 0, 1.03) 0.3s;
  animation: zoom-in 800ms cubic-bezier(0, 0.42, 0, 1.03);
  &:hover {
    border-radius: 0;
    transform: scale(2);
  }
  @keyframes zoom-in {
    0% {
      transform: scale(0.95);
    }
    8% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
    }
  }
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
`;

const StyledContainer = styled.div<{ isSystemMessage: boolean }>`
  display: flex;
  justify-items: 'flex-end';
  justify-content: ${({ isSystemMessage }) =>
    isSystemMessage ? 'flex-end' : 'none'};
  width: 100%;
`;

const StyledNewMessagesButton = styled.button`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing(24)};
  right: ${({ theme }) => theme.spacing(6)};
  background-color: ${({ theme }) => theme.background.invertedPrimary};
  color: ${({ theme }) => theme.font.color.inverted};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;
  z-index: 2;
`;

const StyledAmplitudeValue = styled.div<{ amplitudeValue: number }>`
  width: 2px;
  margin-right: 1px;
  background-color: ${({ theme }) => theme.background.invertedPrimary};
  height: ${({ amplitudeValue }) =>
    Math.round(Math.min(60 * amplitudeValue + 3, 40))}px;
`;

const StyledUnreadMarker = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.color.red};
  font-weight: bold;
  font-size: ${({ theme }) => theme.font.size.sm};
  margin: ${({ theme }) => theme.spacing(2)} 0;
  position: relative;

  &::before {
    content: '';
    flex: 1;
    height: 1px;
    background-color: ${({ theme }) => theme.color.red};
    margin-right: ${({ theme }) => theme.spacing(2)};
  }

  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: ${({ theme }) => theme.color.red};
    margin-left: ${({ theme }) => theme.spacing(2)};
  }

  user-select: none;
`;

export const PaneChat = () => {
  const {
    selectedChat,
    setSelectedChat,
    startService,
    setStartChatNumber,
    setStartChatIntegrationId,
  } = useContext(CallCenterContext) as CallCenterContextType;
  const [lastFromClient, setLastFromClient] = useState<IMessage | null>(null);

  const [newMessage, setNewMessage] = useState<string>('');
  const [isAnexOpen, setIsAnexOpen] = useState<boolean>(false);
  const theme = useTheme();
  const { enqueueSnackBar } = useSnackBar();

  const [recordingState, setRecordingState] = useState<
    'none' | 'recording' | 'paused'
  >('none');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null,
  );
  const [amplitudeValues, setAmplitudeValues] = useState<number[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalImageSrc, setModalImageSrc] = useState<string | null>(null);

  const [isAtBottom, setIsAtBottom] = useState(true);
  const [newMessagesIndicator, setNewMessagesIndicator] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { updateOneRecord } = useUpdateOneRecord<Person>({
    objectNameSingular: CoreObjectNameSingular.Person,
  });

  const { getIcon } = useIcons();

  const { uploadFileToBucket } = useUploadFileToBucket();
  const { sendWhatsappMessage } = useSendWhatsappMessages();
  // const { messengerSendMessage } = useMessengerSendMessage();

  useEffect(() => {
    if (isAtBottom && chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    } else if (!isAtBottom) {
      setNewMessagesIndicator(true);
    }
    const clientMessages = selectedChat?.messages.filter(
      (message) => !message.fromMe,
    );
    if (clientMessages)
      setLastFromClient(clientMessages[clientMessages.length - 1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat?.messages]);

  const onSendMessage = async (type: MessageType) => {
    if (!selectedChat) return;

    // const identifier = isWhatsappDocument(selectedChat)
    //   ? `+${selectedChat.client.phone}`
    //   : selectedChat.client.id;

    const identifier = `${selectedChat.client.phone}`;

    const sendMessageInputBase = {
      integrationId: selectedChat.integrationId,
      to: `${identifier}`,
      type,
      from: `_${currentWorkspaceMember?.name.firstName} ${currentWorkspaceMember?.name.lastName}`,
      fromMe: true,
      personId: selectedChat.personId,
    };

    // if (type === MessageType.FB_RESPONSE) {
    //   if (!audioBlob) {
    //     messengerSendMessage({
    //       ...sendMessageInputBase,
    //       message: newMessage.trim(),
    //     });

    //     setNewMessage('');
    //   } else if (audioBlob) {
    //     const uniqueFilename = `${identifier}-${v4()}.weba`;
    //     const audioFile = new File([audioBlob], uniqueFilename, {
    //       type: 'audio/webm',
    //     });

    //     const urlStorage = await uploadFileToBucket({
    //       file: audioFile,
    //       type: MessageType.AUDIO,
    //     });

    //     try {
    //       messengerSendMessage({
    //         ...sendMessageInputBase,
    //         type: MessageType.AUDIO,
    //         fileUrl: urlStorage,
    //       });
    //     } catch (error) {
    //       throw new Error('Failed to send audio message');
    //     }

    //     setAudioBlob(null);
    //   }
    // } else {
    if (type === MessageType.TEXT) {
      const sendMessageInput = {
        ...sendMessageInputBase,
        message:
          `*#${currentWorkspaceMember?.name.firstName} ${currentWorkspaceMember?.name.lastName}*\n` +
          newMessage.trim(),
      };
      sendWhatsappMessage(sendMessageInput);
      setNewMessage('');
    } else if (type === MessageType.AUDIO) {
      if (!audioBlob) {
        enqueueSnackBar('No audio recorded', {
          variant: SnackBarVariant.Warning,
        });
        return;
      }

      const cleanedIdentifier = identifier?.slice(1);
      const uniqueFilename = `${cleanedIdentifier}-${v4()}.weba`;
      const audioFile = new File([audioBlob], uniqueFilename, {
        type: 'audio/webm',
      });

      const urlStorage = await uploadFileToBucket({ file: audioFile, type });

      try {
        const sendMessageInput = {
          ...sendMessageInputBase,
          fileId: urlStorage,
        };

        sendWhatsappMessage(sendMessageInput);
      } catch (error) {
        throw new Error('Failed to send audio message');
      }

      setAudioBlob(null);
    }
    // }
  };

  let audioCtx = new window.AudioContext();
  const visualize = (stream: MediaStream, recorder: MediaRecorder) => {
    if (!audioCtx) {
      audioCtx = new AudioContext();
    }

    const source = audioCtx.createMediaStreamSource(stream);

    const bufferLength = 2048;
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = bufferLength;
    const dataArray = new Float32Array(bufferLength);

    source.connect(analyser);

    const setValues = () => {
      analyser.getFloatTimeDomainData(dataArray);
      const dataSquared = dataArray.map((data) => data ** 2);
      let total = 0;
      dataSquared.forEach((data) => (total += data));
      const rms = parseFloat(Math.sqrt(total / dataSquared.length).toFixed(5));
      setAmplitudeValues((prev) => [...prev.slice(-150), rms]);
    };

    const timeout = () =>
      setTimeout(() => {
        if (recorder.state === 'recording') setValues();
        if (stream.active) timeout();
      }, 50);
    timeout();
  };

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    visualize(stream, recorder);

    const chunks: Blob[] = [];
    // setAudioBlob(null);

    try {
      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
        const audioBlob = new Blob(chunks, {
          type: 'audio/webm',
        });
        setAudioBlob(audioBlob);
      };

      recorder.onstop = () => {
        setRecordingState('none');
        setAudioBlob(null);
        setAmplitudeValues([]);
      };

      recorder.onpause = () => {
        setRecordingState('paused');
      };

      recorder.onresume = () => {
        setRecordingState('recording');
      };

      recorder.start(50);
      setMediaRecorder(recorder);
      setRecordingState('recording');
    } catch (error) {
      enqueueSnackBar('Failed to start recording. Check microphone access.', {
        variant: SnackBarVariant.Warning,
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  };

  const handlePauseRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.pause();
    }
  };

  const handleResumeRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.resume();
    }
  };

  const AnexIcon = getIcon('IconPaperclip');
  const OpenOnAnotherTab = getIcon('IconExternalLink');

  if (!selectedChat) {
    return <NoSelectedChat />;
  }

  const handleSendMessage = () => {
    // essa mensagem é temporária e só existe no state.
    // ela será substituída pela mensagem verdadeira quando o firebase
    // recarregar os valores desse chat.
    // o único propósito dela é dar feedback imediato ao cliente.

    if (isWhatsappDocument(selectedChat)) {
      if (audioBlob) {
        setSelectedChat((prev) => {
          if (prev)
            return {
              ...prev,
              messages: [
                ...prev.messages,
                {
                  type: 'audio',
                  from: `_${currentWorkspaceMember?.name.firstName} ${currentWorkspaceMember?.name.lastName}`,
                  message: '',
                  fromMe: true,
                  status: 'attempting',
                  id: null,
                  createdAt: {
                    seconds: Date.now(),
                    nanoseconds: Date.now() * 1000,
                  },
                },
              ],
            };
        });
        onSendMessage(MessageType.AUDIO);
      } else {
        setSelectedChat((prev) => {
          if (prev)
            return {
              ...prev,
              messages: [
                ...prev.messages,
                {
                  type: 'text',
                  message: newMessage,
                  from: `_${currentWorkspaceMember?.name.firstName} ${currentWorkspaceMember?.name.lastName}`,
                  fromMe: true,
                  status: 'attempting',
                  id: null,
                  createdAt: {
                    seconds: Date.now(),
                    nanoseconds: Date.now() * 1000,
                  },
                },
              ],
            };
        });
        onSendMessage(MessageType.TEXT);
      }
    } else {
      onSendMessage(MessageType.FB_RESPONSE);
    }
  };

  const handleInputChange = (ev: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = ev.target;
    textarea.style.height = '10px';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;

    setNewMessage(ev.target.value);
  };

  const formatMessageContent = (message: string) => {
    return message.split('\n').map((str, index) => (
      <StyledLine key={index}>
        {str}
        {index !== message.split('\n').length - 1 && <br />}
      </StyledLine>
    ));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImageSrc(null);
  };

  const isMessageOlderThan24Hours = (date: TDateFirestore) => {
    const createdAt = new Date(date.seconds * 1000);
    const now = new Date().getTime();
    const diffInMilliseconds = now - createdAt.getTime();
    return diffInMilliseconds > 86400000;
  };

  const showStartConversationButton = isMessageOlderThan24Hours(
    selectedChat.lastMessage.createdAt,
  );

  const handleInputKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        chatContainerRef.current;
      const isBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setIsAtBottom(isBottom);

      if (isBottom) {
        setNewMessagesIndicator(false);
      }
    }
  };

  const handleUpdatePersonName = () => {
    if (!lastFromClient) return;
    updateOneRecord({
      idToUpdate: selectedChat.personId,
      updateOneRecordInput: {
        name: {
          firstName: lastFromClient.from.split(' ')[0],
          lastName: lastFromClient.from.split(' ').slice(1).join(' '),
        },
      },
    });
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
      setIsAtBottom(true);
      setNewMessagesIndicator(false);
    }
  };

  const renderButtons = () => {
    const IconMicrophone = getIcon('IconMicrophone');
    const IconArrowUp = getIcon('IconArrowUp');

    if (isWhatsappDocument(selectedChat) && showStartConversationButton) {
      return (
        <StyledButton
          title="Restart conversation using a template"
          variant="primary"
          accent="blue"
          size="medium"
          onClick={() => {
            setStartChatNumber(`+${selectedChat.client.phone}`);
            setStartChatIntegrationId(selectedChat.integrationId);
          }}
        />
      );
    }

    if (
      selectedChat.agent !== 'empty' &&
      selectedChat.status !== statusEnum.Resolved
    ) {
      return (
        <StyledInputContainer>
          <StyledAnexDiv>
            <StyledIconButton
              disabled={selectedChat.lastMessage.type === 'template'}
              Icon={recordingState === 'none' ? AnexIcon : IconTrash}
              accent={recordingState === 'none' ? 'default' : 'danger'}
              variant="tertiary"
              size="small"
              onClick={() => {
                if (recordingState === 'none') {
                  setIsAnexOpen(!isAnexOpen);
                  return;
                }
                handleStopRecording();
              }}
            />
          </StyledAnexDiv>
          {isAnexOpen && (
            <ChatAnex
              setIsAnexOpen={setIsAnexOpen}
              from={`_${currentWorkspaceMember?.name.firstName} ${currentWorkspaceMember?.name.lastName}`}
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
            >
              {amplitudeValues.map((amplitudeValue, i) => {
                return (
                  <StyledAmplitudeValue
                    key={i}
                    amplitudeValue={amplitudeValue}
                  />
                );
              })}
            </div>
          )}
          {recordingState === 'none' && (
            <StyledInput
              disabled={selectedChat.lastMessage.type === 'template'}
              className="new-message-input"
              placeholder="Message"
              onInput={handleInputChange}
              value={newMessage}
              ref={textareaRef}
              onKeyDown={handleInputKeyDown}
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
                onClick={() => {
                  switch (recordingState) {
                    case 'none':
                      handleStartRecording();
                      break;
                    case 'recording':
                      handlePauseRecording();
                      break;
                    case 'paused':
                      handleResumeRecording();
                      break;
                  }
                }}
                size="small"
              />
            )}
            {(newMessage.length > 0 || recordingState !== 'none') && (
              <StyledIconButton
                disabled={selectedChat.lastMessage.type === 'template'}
                Icon={(props) => (
                  <IconArrowUp
                    {...props}
                    color={theme.font.color.inverted}
                    style={{ pointerEvents: 'none' }}
                  />
                )}
                onClick={() => {
                  handleSendMessage();
                  handleStopRecording();
                }}
                variant="primary"
                accent="blue"
                size="medium"
              />
            )}
          </StyledDiv>
        </StyledInputContainer>
      );
    }

    if (selectedChat.status !== statusEnum.Resolved) {
      return (
        <StyledButton
          title="Start Service"
          variant="primary"
          accent="blue"
          size="medium"
          onClick={startService}
        />
      );
    }

    return <></>;
  };

  return (
    <>
      <StyledPaneChatContainer>
        <PaneChatHeader />
        <StyledChatContainer ref={chatContainerRef} onScroll={handleScroll}>
          {selectedChat.messages.map((message: IMessage, index: number) => {
            const isSystemMessage = message.fromMe;

            const validMessageType =
              message.type === MessageType.STARTED ||
              message.type === MessageType.TRANSFER ||
              message.type === MessageType.END ||
              message.type === MessageType.ONHOLD;

            let messageContent;

            if (validMessageType)
              return (
                <StyledMessageEvent>
                  <IconExclamationCircleFilled size={13} /> {message.message}
                </StyledMessageEvent>
              );

            switch (message.type) {
              case MessageType.IMAGE:
                messageContent = (
                  <StyledImageContainer
                    key={index}
                    isSystemMessage={isSystemMessage}
                  >
                    <StyledImage
                      message={message}
                      onClick={() => {
                        setModalImageSrc(message.message);
                        setIsModalOpen(true);
                      }}
                    />
                  </StyledImageContainer>
                );
                break;
              case MessageType.AUDIO:
                messageContent = <StyledAudio key={index} message={message} />;
                break;
              case MessageType.DOCUMENT: {
                const msg = message?.message
                  ? message.message.split('/').pop()?.split('?')[0]
                  : null;
                messageContent = (
                  <StyledDocumentContainer
                    key={index}
                    isSystemMessage={isSystemMessage}
                  >
                    <StyledDocument href={message.message} target="_blank">
                      {msg}
                    </StyledDocument>
                    <OpenOnAnotherTab
                      size={theme.icon.size.md}
                      stroke={theme.icon.stroke.sm}
                      color={theme.font.color.primary}
                    />
                  </StyledDocumentContainer>
                );
                break;
              }
              case MessageType.VIDEO:
                messageContent = (
                  <StyledVideo
                    isSystemMessage={isSystemMessage}
                    key={index}
                    controls
                  >
                    {validVideoTypes.map((type) => (
                      <source src={message.message} type={type} />
                    ))}
                  </StyledVideo>
                );
                break;
              default:
                messageContent = (
                  <StyledMessage key={index} isSystemMessage={isSystemMessage}>
                    {formatMessageContent(
                      isSystemMessage
                        ? //first line will be member name, which is redundant since we already show it in the avatar
                          message.message.replace(/^.*\n/, '')
                        : message.message,
                    )}
                  </StyledMessage>
                );
                break;
            }

            const unreadIndex =
              selectedChat.messages.length - selectedChat.unreadMessages;
            const showUnreadMarker = index === unreadIndex;
            const lastOfRow =
              selectedChat.messages[index + 1]?.from !== message.from;
            const clientMessages = selectedChat.messages.filter(
              (message) => !message.fromMe,
            );

            return (
              <>
                {showUnreadMarker && (
                  <StyledUnreadMarker>New Messages</StyledUnreadMarker>
                )}

                <StyledMessageContainer key={index} fromMe={isSystemMessage}>
                  <StyledAvatarMessage style={{ opacity: lastOfRow ? 1 : 0 }}>
                    <AvatarComponent
                      message={message}
                      selectedChat={selectedChat}
                      currentWorkspaceMember={currentWorkspaceMember}
                    />
                  </StyledAvatarMessage>
                  <StyledContainer isSystemMessage={isSystemMessage}>
                    <StyledMessageItem
                      key={index}
                      isSystemMessage={isSystemMessage}
                    >
                      <StyledMessageBubble
                        time={formatDate(message.createdAt).time}
                        message={message}
                        hasTail={lastOfRow}
                      >
                        {messageContent}
                      </StyledMessageBubble>
                      <StyledNameAndTimeContainer
                        isSystemMessage={isSystemMessage}
                      >
                        {isMessageOlderThan24Hours(message.createdAt) ?? (
                          <StyledDateContainer>
                            {formatDate(message.createdAt).date}
                          </StyledDateContainer>
                        )}
                      </StyledNameAndTimeContainer>
                    </StyledMessageItem>
                  </StyledContainer>
                </StyledMessageContainer>
              </>
            );
          })}
        </StyledChatContainer>
        {renderButtons()}
        {isModalOpen && modalImageSrc && (
          <StyledModalOverlay onClick={closeModal}>
            <StyledModalImage
              src={modalImageSrc}
              onClick={(ev) => ev.stopPropagation()}
            />
          </StyledModalOverlay>
        )}
      </StyledPaneChatContainer>
      {newMessagesIndicator && (
        <StyledNewMessagesButton onClick={scrollToBottom}>
          More recent
        </StyledNewMessagesButton>
      )}
    </>
  );
};
