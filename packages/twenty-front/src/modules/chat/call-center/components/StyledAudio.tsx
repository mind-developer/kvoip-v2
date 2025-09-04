import styled from '@emotion/styled';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { useState } from 'react';
import { IconButton } from 'twenty-ui/input';

const StyledAudioContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StyledScrubber = styled.input`
  height: 2px;
  width: 100px;
  &&::-moz-range-thumb,
  &&::-webkit-slider-thumb {
    height: 10px;
    width: 10px;
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
    opacity: 0.3;
  }
  &&::-moz-range-progress {
    background-color: ${({ theme }) => theme.font.color.primary};
    opacity: 0.3;
  }
`;

const StyledAudio = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>();

  return (
    <StyledAudioContainer>
      <IconButton
        Icon={isPlaying ? IconPlayerPause : IconPlayerPlay}
        onClick={() => setIsPlaying(!isPlaying)}
        variant="tertiary"
      />
      <StyledScrubber type="range" />
      {/* <StyledCurrentTime/> */}
    </StyledAudioContainer>
  );
};

export default StyledAudio;
