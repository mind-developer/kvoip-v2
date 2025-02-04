import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';
import { IconArrowUpRight, IconComponent, MenuItemCommand } from 'twenty-ui';

import { useCommandMenuOnItemClick } from '@/command-menu/hooks/useCommandMenuOnItemClick';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';

export type CommandMenuItemProps = {
  label: string;
  description?: string;
  to?: string;
  id: string;
  onClick?: () => void;
  Icon?: IconComponent;
  hotKeys?: string[];
  shouldCloseCommandMenuOnClick?: boolean;
};

export const CommandMenuItem = ({
  label,
  description,
  to,
  id,
  onClick,
  Icon,
  hotKeys,
  shouldCloseCommandMenuOnClick,
}: CommandMenuItemProps) => {
  const { onItemClick } = useCommandMenuOnItemClick();

  if (isNonEmptyString(to) && !Icon) {
    Icon = IconArrowUpRight;
  }

  const { isSelectedItemIdSelector } = useSelectableList();
  const isSelectedItemId = useRecoilValue(isSelectedItemIdSelector(id));

  return (
    <MenuItemCommand
      LeftIcon={Icon}
      text={label}
      description={description}
      hotKeys={hotKeys}
      onClick={() =>
        onItemClick({
          shouldCloseCommandMenuOnClick,
          onClick,
          to,
        })
      }
      isSelected={isSelectedItemId}
    />
  );
};
