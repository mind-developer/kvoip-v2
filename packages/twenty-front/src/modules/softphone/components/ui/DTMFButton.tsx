/* @kvoip-woulz proprietary */
import { useTheme } from '@emotion/react';
import { IconDialpad } from '@tabler/icons-react';
import { useIcons } from 'twenty-ui/display';

const DTMFButton = ({
  setIsSendingDTMF,
}: {
  setIsSendingDTMF: (value: boolean) => void;
}) => {
  const { getIcon } = useIcons();

  const theme = useTheme();

  return (
    <IconDialpad
      onClick={() => setIsSendingDTMF(true)}
      size={theme.icon.size.lg}
      stroke={theme.icon.stroke.sm}
      color={theme.font.color.secondary}
      style={{
        cursor: 'pointer',
        padding: theme.spacing(3),
        borderRadius: '50%',
        // eslint-disable-next-line @nx/workspace-no-hardcoded-colors
        border: `1px solid #fff`,
        backgroundColor: theme.background.tertiary,
      }}
    />
  );
};

export default DTMFButton;
