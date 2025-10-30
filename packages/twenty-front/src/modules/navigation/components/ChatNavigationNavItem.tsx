import { AppPath } from '@/types/AppPath';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { type Theme, useTheme } from '@emotion/react';
// eslint-disable-next-line no-restricted-imports
import { IconMessageCircle } from '@tabler/icons-react';
import { useLocation } from 'react-router-dom';
import { IconBriefcase, IconHeadphones } from 'twenty-ui/display';

const navItemsAnimationVariants = (theme: Theme) => ({
  hidden: {
    height: 0,
    opacity: 0,
    marginTop: 0,
  },
  visible: {
    height: 'auto',
    opacity: 1,
    marginTop: theme.spacing(1),
  },
});

export const ChatNavigationNavItem = () => {
  const theme = useTheme();
  const { pathname, search } = useLocation();
  const currentPathWithSearch = pathname + search;

  const chatsPath = [
    {
      id: 'internalChat',
      label: 'Internal Chat',
      path: AppPath.InternalChatCenter,
      Icon: IconBriefcase,
    },
    {
      id: 'clientChat',
      label: 'Client Chat',
      path: AppPath.ClientChatCenter,
      Icon: IconHeadphones,
    },
  ];

  const shouldSubItemsBeDisplayed = pathname.startsWith(
    AppPath.ClientChatCenter,
  );

  return (
    <>
      <NavigationDrawerItem
        label="Chat"
        to={AppPath.ClientChatCenter}
        active={pathname.startsWith(AppPath.ClientChatCenter)}
        Icon={IconMessageCircle}
      />
      {/* <AnimatePresence>
        {shouldSubItemsBeDisplayed && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={navItemsAnimationVariants(theme)}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {chatsPath.map(({ id, label, path, Icon }) => {
              return (
                <div key={id}>
                  <NavigationDrawerSubItem
                    label={label}
                    to={path}
                    active={currentPathWithSearch === path}
                    Icon={Icon}
                  />
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence> */}
    </>
  );
};
