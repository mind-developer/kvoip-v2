/* @kvoip-woulz proprietary */
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { lastVisitedViewPerObjectMetadataItemState } from '@/navigation/states/lastVisitedViewPerObjectMetadataItemState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { AppPath } from '@/types/AppPath';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerItemsCollapsableContainer } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItemsCollapsableContainer';
import { NavigationDrawerSubItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSubItem';
import { getNavigationSubItemLeftAdornment } from '@/ui/navigation/navigation-drawer/utils/getNavigationSubItemLeftAdornment';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { coreViewsFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreViewsFromObjectMetadataItemFamilySelector';
import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { IconBuildingSkyscraper, useIcons } from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { getAppPath } from '~/utils/navigation/getAppPath';

export type NavigationDrawerFinancialRegistersGroupProps = {
  accountReceivableMetadataItem: ObjectMetadataItem | undefined;
  accountPayableMetadataItem: ObjectMetadataItem | undefined;
};

export const NavigationDrawerFinancialRegistersGroup = ({
  accountReceivableMetadataItem,
  accountPayableMetadataItem,
}: NavigationDrawerFinancialRegistersGroupProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const currentPath = useLocation().pathname;

  const lastVisitedViewPerObjectMetadataItem = useRecoilValue(
    lastVisitedViewPerObjectMetadataItemState,
  );

  const contextStoreCurrentViewId = useRecoilComponentValue(
    contextStoreCurrentViewIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  // Get views for both entities
  const accountReceivableViews = useRecoilValue(
    coreViewsFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: accountReceivableMetadataItem?.id ?? '',
    }),
  );

  const accountPayableViews = useRecoilValue(
    coreViewsFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: accountPayableMetadataItem?.id ?? '',
    }),
  );

  // Don't render if both items are missing
  if (!accountReceivableMetadataItem && !accountPayableMetadataItem) {
    return null;
  }

  // Check if either entity is currently active
  const isAccountReceivableActive =
    accountReceivableMetadataItem &&
    (currentPath ===
      getAppPath(AppPath.RecordIndexPage, {
        objectNamePlural: accountReceivableMetadataItem.namePlural,
      }) ||
      currentPath.includes(
        getAppPath(AppPath.RecordShowPage, {
          objectNameSingular: accountReceivableMetadataItem.nameSingular,
          objectRecordId: '',
        }) + '/',
      ));

  const isAccountPayableActive =
    accountPayableMetadataItem &&
    (currentPath ===
      getAppPath(AppPath.RecordIndexPage, {
        objectNamePlural: accountPayableMetadataItem.namePlural,
      }) ||
      currentPath.includes(
        getAppPath(AppPath.RecordShowPage, {
          objectNameSingular: accountPayableMetadataItem.nameSingular,
          objectRecordId: '',
        }) + '/',
      ));

  const isActive = isAccountReceivableActive || isAccountPayableActive;

  // Determine navigation path for the parent item
  // Navigate to the active one, or default to account receivable
  const lastVisitedReceivableViewId = accountReceivableMetadataItem?.id
    ? lastVisitedViewPerObjectMetadataItem?.[accountReceivableMetadataItem.id]
    : undefined;

  const lastVisitedPayableViewId = accountPayableMetadataItem?.id
    ? lastVisitedViewPerObjectMetadataItem?.[accountPayableMetadataItem.id]
    : undefined;

  const defaultNavigationPath = accountReceivableMetadataItem
    ? getAppPath(
        AppPath.RecordIndexPage,
        { objectNamePlural: accountReceivableMetadataItem.namePlural },
        lastVisitedReceivableViewId
          ? { viewId: lastVisitedReceivableViewId }
          : undefined,
      )
    : accountPayableMetadataItem
      ? getAppPath(
          AppPath.RecordIndexPage,
          { objectNamePlural: accountPayableMetadataItem.namePlural },
          lastVisitedPayableViewId
            ? { viewId: lastVisitedPayableViewId }
            : undefined,
        )
      : '';

  // Build sub-items array
  const subItems: Array<{
    label: string;
    to: string;
    icon: any;
    isActive: boolean;
    objectMetadataItem: ObjectMetadataItem;
  }> = [];

  if (accountReceivableMetadataItem) {
    subItems.push({
      label: accountReceivableMetadataItem.labelPlural,
      to: getAppPath(
        AppPath.RecordIndexPage,
        { objectNamePlural: accountReceivableMetadataItem.namePlural },
        lastVisitedReceivableViewId
          ? { viewId: lastVisitedReceivableViewId }
          : undefined,
      ),
      icon: getIcon(accountReceivableMetadataItem.icon),
      isActive: isAccountReceivableActive || false,
      objectMetadataItem: accountReceivableMetadataItem,
    });
  }

  if (accountPayableMetadataItem) {
    subItems.push({
      label: accountPayableMetadataItem.labelPlural,
      to: getAppPath(
        AppPath.RecordIndexPage,
        { objectNamePlural: accountPayableMetadataItem.namePlural },
        lastVisitedPayableViewId
          ? { viewId: lastVisitedPayableViewId }
          : undefined,
      ),
      icon: getIcon(accountPayableMetadataItem.icon),
      isActive: isAccountPayableActive || false,
      objectMetadataItem: accountPayableMetadataItem,
    });
  }

  const shouldSubItemsBeDisplayed = isActive && subItems.length > 0;

  const selectedSubItemIndex = subItems.findIndex((item) => item.isActive);

  return (
    <NavigationDrawerItemsCollapsableContainer
      isGroup={shouldSubItemsBeDisplayed}
    >
      <NavigationDrawerItem
        label={t`Financial Records`}
        to={defaultNavigationPath}
        Icon={IconBuildingSkyscraper}
        active={!!isActive}
      />

      <AnimatedExpandableContainer
        isExpanded={!!shouldSubItemsBeDisplayed}
        dimension="height"
        mode="fit-content"
        containAnimation
      >
        {subItems.map((subItem, index) => (
          <NavigationDrawerSubItem
            key={subItem.objectMetadataItem.id}
            label={subItem.label}
            to={subItem.to}
            active={subItem.isActive}
            subItemState={getNavigationSubItemLeftAdornment({
              index,
              arrayLength: subItems.length,
              selectedIndex: selectedSubItemIndex,
            })}
            Icon={subItem.icon}
          />
        ))}
      </AnimatedExpandableContainer>
    </NavigationDrawerItemsCollapsableContainer>
  );
};
