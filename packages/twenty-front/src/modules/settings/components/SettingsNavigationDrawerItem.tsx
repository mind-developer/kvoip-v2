import { useMatch, useResolvedPath } from 'react-router-dom';

import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import {
  NavigationDrawerItem,
  NavigationDrawerItemProps,
} from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSubItemState } from '@/ui/navigation/navigation-drawer/types/NavigationDrawerSubItemState';

type SettingsNavigationDrawerItemProps = {
  item: SettingsNavigationItem;
  subItemState?: NavigationDrawerSubItemState;
};

export const SettingsNavigationDrawerItem = ({
  item,
  subItemState,
}: SettingsNavigationDrawerItemProps) => {
  const href = getSettingsPagePath(path);
  const pathName = useResolvedPath(href).pathname;
  const isActive = !!useMatch({
    path: pathName,
    end: !item.matchSubPages,
  });

  if (isDefined(item.isHidden) && item.isHidden) {
    return null;
  }

  if (isDefined(item.isAdvanced) && item.isAdvanced) {
    return (
      <AdvancedSettingsWrapper navigationDrawerItem>
        <NavigationDrawerItem
          indentationLevel={item.indentationLevel}
          subItemState={subItemState}
          label={item.label}
          to={href}
          Icon={item.Icon}
          active={isActive}
          soon={item.soon}
          onClick={item.onClick}
        />
      </AdvancedSettingsWrapper>
    );
  }

  return (
    <NavigationDrawerItem
      indentationLevel={item.indentationLevel}
      subItemState={subItemState}
      label={item.label}
      to={href}
      Icon={item.Icon}
      active={isActive}
      soon={item.soon}
      onClick={item.onClick}
    />
  );
};
