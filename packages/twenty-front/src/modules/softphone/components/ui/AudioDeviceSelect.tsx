/* @kvoip-woulz proprietary */
import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { InputLabel } from '@/ui/input/components/InputLabel';

interface AudioDevice {
  deviceId: string;
  label: string;
  kind: string;
}

interface AudioDeviceSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: AudioDevice[];
  label: string;
}

const SelectContainer = styled.div`
  position: relative;
  width: 300px;
`;

const SelectButton = styled.button`
  width: 100%;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  text-align: left;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    border-color: #d1d5db;
  }

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-top: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
`;

const Option = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;

  &:hover {
    background-color: #f3f4f6;
  }

  &.selected {
    background-color: #e5e7eb;
  }
`;

const AudioDeviceSelect: React.FC<AudioDeviceSelectProps> = ({
  value,
  onChange,
  options,
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(option => option.deviceId === value);
  const displayValue = selectedOption ? selectedOption.label : 'Selecione um dispositivo';

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o evento se propague
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (e: React.MouseEvent, deviceId: string) => {
    e.stopPropagation(); // Impede que o evento se propague
    onChange(deviceId);
    setIsOpen(false);
  };

  return (
    <SelectContainer ref={containerRef}>
      <InputLabel>{label}</InputLabel>
      <SelectButton onClick={handleButtonClick}>
        <span>{displayValue}</span>
        <span>{isOpen ? '▼' : '▶'}</span>
      </SelectButton>
      {isOpen && (
        <Dropdown>
          {options.map(option => (
            <Option
              key={option.deviceId}
              onClick={(e) => handleOptionClick(e, option.deviceId)}
              className={option.deviceId === value ? 'selected' : ''}
            >
              {option.label}
            </Option>
          ))}
        </Dropdown>
      )}
    </SelectContainer>
  );
};

export default AudioDeviceSelect; 