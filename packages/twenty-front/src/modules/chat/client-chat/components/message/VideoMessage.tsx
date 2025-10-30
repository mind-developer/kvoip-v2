import styled from '@emotion/styled';
import {
  IconMaximize,
  IconMinimize,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import { LegacyRef, useEffect, useRef, useState } from 'react';
import {
  ChatMessageDeliveryStatus,
  ClientChatMessage,
} from 'twenty-shared/types';
import { IconButton } from 'twenty-ui/input';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { ATTEMPTING_MESSAGE_KEYFRAMES } from '../../constants/attemptingMessageKeyframes';

const StyledVideoWrapper = styled.div<{ isPending: boolean }>`
  position: relative;
  display: inline-block;
  ${({ isPending }) => (isPending ? ATTEMPTING_MESSAGE_KEYFRAMES : '')}
`;

const StyledTime = styled.p`
  color: ${({ theme }) => theme.font.color.inverted};
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
  width: 100%;
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
    background-color: ${({ theme }) => theme.font.color.primary};
  }
  &&::-moz-range-progress {
    background-color: ${({ theme }) => theme.font.color.primary};
  }
`;

const StyledVideo = styled.video`
  max-width: 240px;
  width: 300px;
  border-radius: ${({ theme }) => theme.spacing(3)};
  overflow: hidden;
`;

const StyledOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  border-radius: ${({ theme }) => theme.spacing(3)};
  overflow: hidden;
`;

const StyledCenterControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
`;

const StyledBottomBar = styled.div`
  margin: ${({ theme }) => theme.spacing(1)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(4px);
  pointer-events: auto;
  border-radius: ${({ theme }) => theme.spacing(3)};
  overflow: hidden;
`;

const StyledIconButton = styled(IconButton)`
  background: rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(4px);
  border: none;
  padding: ${({ theme }) => theme.spacing(3)};
  border-radius: 50%;
  aspect-ratio: 1/1;
  height: 40px;
  width: 40px;
`;

const VideoMessage = ({ message }: { message: ClientChatMessage }) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [hasResolvedDuration, setHasResolvedDuration] =
    useState<boolean>(false);
  const [userInteracted, setUserInteracted] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const hideControlsTimeoutRef = useRef<number | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>();
  const isPending =
    message.deliveryStatus === ChatMessageDeliveryStatus.PENDING;
  const videoUrl =
    REACT_APP_SERVER_BASE_URL + '/files/' + message.attachmentUrl;

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    video.load();

    const handleLoadedMetadata = () => {
      if (!videoRef.current) return;
      const directDuration = videoRef.current.duration;
      if (isFinite(directDuration) && directDuration > 0) {
        setDuration(directDuration);
        setHasResolvedDuration(true);
        return;
      }
      videoRef.current.currentTime = 1e101;
      videoRef.current.ontimeupdate = function () {
        if (!videoRef.current) return;
        const realDuration = videoRef.current.duration;
        if (isFinite(realDuration) && realDuration > 0) {
          setDuration(realDuration);
          setHasResolvedDuration(true);
          if (!userInteracted) {
            videoRef.current.currentTime = 0;
          }
          videoRef.current.ontimeupdate = null;
        }
      };
    };

    const handleEnded = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [videoRef, userInteracted]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFsChange = () =>
      setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleFsChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Auto-hide controls on inactivity while playing
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      if (hideControlsTimeoutRef.current) {
        window.clearTimeout(hideControlsTimeoutRef.current);
        hideControlsTimeoutRef.current = null;
      }
      return;
    }
    if (hideControlsTimeoutRef.current) {
      window.clearTimeout(hideControlsTimeoutRef.current);
    }
    hideControlsTimeoutRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, 2000);
    return () => {
      if (hideControlsTimeoutRef.current) {
        window.clearTimeout(hideControlsTimeoutRef.current);
        hideControlsTimeoutRef.current = null;
      }
    };
  }, [isPlaying, currentTime]);

  const handleUserActivity = () => {
    setShowControls(true);
    if (isPlaying) {
      if (hideControlsTimeoutRef.current) {
        window.clearTimeout(hideControlsTimeoutRef.current);
      }
      hideControlsTimeoutRef.current = window.setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <StyledVideoWrapper
      isPending={isPending}
      onMouseMove={handleUserActivity}
      onTouchStart={handleUserActivity}
    >
      <StyledVideo
        src={videoUrl}
        ref={videoRef as LegacyRef<HTMLVideoElement>}
        playsInline
        muted={false}
      />
      <StyledOverlay
        style={{
          opacity: showControls ? 1 : 0,
          transition: 'opacity 150ms ease',
        }}
      >
        <StyledCenterControls>
          <StyledIconButton
            Icon={isPlaying ? IconPlayerPauseFilled : IconPlayerPlayFilled}
            onClick={() => {
              if (!videoRef.current) return;
              if (!isPlaying) {
                videoRef.current.play();
                setIsPlaying(true);
                return;
              }
              videoRef.current.pause();
              setIsPlaying(false);
            }}
            variant="tertiary"
            disabled={isPending}
          />
        </StyledCenterControls>
        <StyledBottomBar>
          <StyledScrubber
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            step={0.01}
            aria-valuenow={currentTime}
            aria-valuemax={duration || 0}
            aria-valuemin={0}
            onChange={(e) => {
              if (videoRef.current) {
                const newTime = Number(e.target.value);
                videoRef.current.currentTime = newTime;
                setCurrentTime(newTime);
                if (!userInteracted) setUserInteracted(true);
              }
            }}
            disabled={isPending || !hasResolvedDuration || !isFinite(duration)}
          />
          <StyledIconButton
            Icon={isFullscreen ? IconMinimize : IconMaximize}
            onClick={toggleFullscreen}
            variant="tertiary"
            disabled={isPending}
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
        </StyledBottomBar>
      </StyledOverlay>
    </StyledVideoWrapper>
  );
};

export default VideoMessage;
