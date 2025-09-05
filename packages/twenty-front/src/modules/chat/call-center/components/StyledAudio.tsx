import AudioCanvas from '@/chat/call-center/components/AudioCanvas';
import { IMessage } from '@/chat/types/WhatsappDocument';
import styled from '@emotion/styled';
import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import { LegacyRef, useEffect, useRef, useState } from 'react';
import { IconButton } from 'twenty-ui/input';
import { ATTEMPTING_MESSAGE_KEYFRAMES } from '../constants/ATTEMPTING_MESSAGE_KEYFRAMES';
import { MessageStatus } from '../types/MessageStatus';

const StyledAudioContainer = styled.div<{ status: MessageStatus }>`
  display: flex;
  align-items: center;
  gap: 5px;
  ${({ status }) =>
    status === 'attempting' ? ATTEMPTING_MESSAGE_KEYFRAMES : ''}
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
    height: 15px;
    width: 15px;
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

const StyledAudio = ({ message }: { message: IMessage }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [rangeValue, setRangeValue] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>();

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) setDuration(audioRef.current.duration);
      });
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) setCurrentTime(audioRef.current.currentTime % 60);
      });
    }
  }, [audioRef]);

  return (
    <StyledAudioContainer status={message.status}>
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
        max={100}
        value={(currentTime / duration) * 100}
        onDragStart={() => console.log('scrubbing')}
        onDragEnd={() => console.log('end scrubbing')}
        onChange={(e) => {
          if (audioRef.current) {
            audioRef.current.currentTime =
              duration * (parseInt(e.target.value) / 100);
          }
        }}
      />
      {message.status !== 'attempting' && (
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
        src={message.message}
        ref={audioRef as LegacyRef<HTMLAudioElement>}
      />
      {audioBlob && <AudioCanvas audioBlob={audioBlob} />}
    </StyledAudioContainer>
  );
};

export default StyledAudio;
