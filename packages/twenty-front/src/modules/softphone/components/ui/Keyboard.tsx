/* @kvoip-woulz proprietary */
import styled from '@emotion/styled';
import React from 'react';

const StyledKeyboard = styled.div<{ isVisible: boolean }>`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: ${({ theme }) => theme.spacing(2)};
  justify-items: center;
  margin-top: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(5)};
  
  /* Transições suaves */
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transform: ${({ isVisible }) => 
    isVisible ? 'translateY(0)' : 'translateY(-10px)'};
  max-height: ${({ isVisible }) => (isVisible ? '300px' : '0')};
  overflow: hidden;
  transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out, max-height 0.3s ease-in-out;
  pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
`;

const StyledKey = styled.div`
  border-radius: 50%;
  border: 2px solid #fff;
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.xxl};
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ theme }) => theme.spacing(15)};
  height: ${({ theme }) => theme.spacing(15)};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  
  /* Transições suaves para hover e active */
  transition: background-color 0.2s ease, transform 0.1s ease;

  &:hover {
    background-color: ${({ theme }) => theme.background.overlayTertiary};
    transform: scale(1.02);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Keyboard = ({ 
  onClick, 
  isVisible = true 
}: { 
  onClick: (key: string) => void;
  isVisible?: boolean;
}) => {
  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  return (
    <StyledKeyboard isVisible={isVisible}>
      {keys.map((row, rowIndex) => (
        <React.Fragment key={rowIndex}>
          {row.map((key, keyIndex) => (
            <StyledKey
              key={`${rowIndex}-${keyIndex}`}
              className="keyboard-key"
              onClick={() => onClick(key)}
            >
              {key}
            </StyledKey>
          ))}
        </React.Fragment>
      ))}
    </StyledKeyboard>
  );
};

export default Keyboard;
