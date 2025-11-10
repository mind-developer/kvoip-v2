import styled from '@emotion/styled';
import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import { type LegacyRef, useEffect, useRef, useState } from 'react';
import {
  ChatMessageDeliveryStatus,
  type ClientChatMessage,
} from 'twenty-shared/types';
import { IconButton } from 'twenty-ui/input';
import { ATTEMPTING_MESSAGE_KEYFRAMES } from '../../constants/attemptingMessageKeyframes';

const StyledAudioContainer = styled.div<{ isPending: boolean }>`
  display: flex;
  align-items: center;
  gap: 5px;
  ${({ isPending }) => (isPending ? ATTEMPTING_MESSAGE_KEYFRAMES : '')}
`;

const StyledTime = styled.p`
  color: ${({ theme }) => theme.font.color.primary};
  min-width: 30px;
  @keyframes appear {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
`;

const StyledScrubber = styled.input`
  height: 2px;
  width: 100px;
  &&::-moz-range-thumb,
  &&::-webkit-slider-thumb {
    height: 5px;
    width: 5px;
    border-radius: 50%; /* Makes it a circle */
    background-color: ${({ theme }) => theme.font.color.primary};
    border: none;
  }
  &&::-webkit-slider-runnable-track,
  &&::-moz-range-track {
    background-color: ${({ theme }) => theme.font.color.primary};
    opacity: 1;
  }
  &&::-moz-range-track {
    background-color: ${({ theme }) => theme.font.color.tertiary};
  }
  &&::-moz-range-progress {
    background-color: ${({ theme }) => theme.font.color.primary};
  }
`;

const AudioMessage = ({ message }: { message: ClientChatMessage }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [audioBlob] = useState<Blob | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>();
  const isPending =
    message.deliveryStatus === ChatMessageDeliveryStatus.PENDING;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      // When loadedmetadata fires, try to set duration from the audio element.
      // Sometimes, especially with blob/file URLs or quick streams,
      // browsers (notably Chrome) report audio.duration as Infinity or 0.
      // The workaround is to seek to a very large currentTime value;
      // the browser then internally computes and sets .duration to the true value.
      // After this, ontimeupdate will fire and we can safely set duration.
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) {
          const directDuration = audioRef.current.duration;
          if (isFinite(directDuration) && directDuration > 0) {
            setDuration(directDuration);
          } else {
            audioRef.current.currentTime = 1e101;
            audioRef.current.ontimeupdate = function () {
              if (audioRef.current) {
                const realDuration = audioRef.current.duration;
                if (isFinite(realDuration) && realDuration > 0) {
                  setDuration(realDuration);
                  audioRef.current.ontimeupdate = null;
                  audioRef.current.currentTime = 0;
                }
              }
            };
          }
        }
      });
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) setCurrentTime(audioRef.current.currentTime % 60);
      });
    }
  }, [audioRef]);

  return (
    <StyledAudioContainer isPending={isPending}>
      <IconButton
        Icon={isPlaying ? IconPlayerPauseFilled : IconPlayerPlayFilled}
        onClick={() => {
          if (!audioRef.current) return;
          if (!isPlaying) {
            audioRef.current.play();
            setIsPlaying(true);
            return;
          }
          audioRef.current.pause();
          setIsPlaying(false);
        }}
        variant="tertiary"
      />
      <StyledScrubber
        type="range"
        min={0}
        max={duration || 1}
        value={currentTime}
        step={0.01}
        aria-valuenow={currentTime}
        aria-valuemax={duration || 1}
        aria-valuemin={0}
        onChange={(e) => {
          if (audioRef.current) {
            const newTime = Number(e.target.value);
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
          }
        }}
        disabled={isPending || !isFinite(duration)}
      />
      {!isPending && (
        <StyledTime>
          {!isPlaying ? (
            <>
              {Math.floor((duration ?? 0) / 60)}:
              {String((duration % 60).toFixed(0)).padStart(2, '0')}
            </>
          ) : (
            <>
              {Math.floor(currentTime / 60)}:
              {String((currentTime % 60).toFixed(0)).padStart(2, '0')}
            </>
          )}
        </StyledTime>
      )}
      <audio
        src={message.attachmentUrl ?? ''}
        ref={audioRef as LegacyRef<HTMLAudioElement>}
      />
    </StyledAudioContainer>
  );
};

export default AudioMessage;
