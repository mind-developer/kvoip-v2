/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { useTheme } from '@emotion/react';
import React from 'react';
import { useIcons } from 'twenty-ui/display';

interface KeyboardToggleButtonProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const KeyboardToggleButton: React.FC<KeyboardToggleButtonProps> = ({
  isExpanded,
  onToggle,
}) => {
  const theme = useTheme();
  const { getIcon } = useIcons();

  const KeyboardIcon = getIcon('IconKeyboard');
  const KeyboardOffIcon = getIcon('IconKeyboardOff');

  return (
    <div
      style={{ cursor: 'pointer' }}
      onClick={onToggle}
    >
      {isExpanded ? (
        <KeyboardOffIcon
          color={theme.font.color.tertiary}
          size={theme.icon.size.md}
        />
      ) : (
        <KeyboardIcon
          color={theme.font.color.tertiary}
          size={theme.icon.size.md}
        />
      )}
    </div>
  );
};

export default KeyboardToggleButton;
