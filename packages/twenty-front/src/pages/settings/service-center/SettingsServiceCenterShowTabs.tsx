import styled from '@emotion/styled';
import { useEffect } from 'react';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { SettingsServiceCenterExtensionsTabContent } from '@/settings/service-center/telephony/components/SettingsServiceCenterExtensionsTabContent';
import { ServiceCenterTabContent } from '@/settings/service-center/telephony/components/SettingsServiceCenterTabContent';
import { useFindAllExternalExtensions } from '@/settings/service-center/telephony/hooks/useFindAllExternalExtensions';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useLingui } from '@lingui/react/macro';
import { useFindAllTelephonys } from '../../../modules/settings/service-center/telephony/hooks/useFindAllTelephony';
import { useLinkMemberToExtension } from '@/settings/service-center/telephony/hooks/useLinkMemberToExtension';

const StyledShowServiceCenterTabs = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  justify-content: start;
  width: 100%;
`;

// export const TAB_LIST_COMPONENT_ID = 'show-page-right-tab-list';
const TAB_LIST_COMPONENT_ID = 'service-center-telephony-tabs';

type ShowServiceCenterTelephonyTabsProps = {
  isRightDrawer?: boolean;
  loading?: boolean;
};

export const ShowServiceCenterTelephonyTabs = ({
  isRightDrawer = false,
}: ShowServiceCenterTelephonyTabsProps) => {
  const isMobile = useIsMobile() || isRightDrawer;
  const { t } = useLingui();

  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    TAB_LIST_COMPONENT_ID,
  );

  const tabs = [
    {
      id: 'operators',
      title: t`Operators`,
      // Icon: IconFileText,
    },
    {
      id: 'all-extensions',
      title: t`All Extensions`,
      // Icon: IconFileText,
    },
  ];

  const { telephonys, refetch } = useFindAllTelephonys();
  const { extensions, refetch: refetchExtensions } = useFindAllExternalExtensions();
  const { linkMemberToExtension } = useLinkMemberToExtension();

  useEffect(() => {
    refetch();
  }, []);

  return (
    <>
      <StyledShowServiceCenterTabs isMobile={isMobile}>
        <TabList tabs={tabs} componentInstanceId={TAB_LIST_COMPONENT_ID} />

        {activeTabId === 'operators' && (
          <ServiceCenterTabContent telephonys={telephonys} refetch={refetch} />
        )}

        {activeTabId === 'all-extensions' && (
          <SettingsServiceCenterExtensionsTabContent extensions={extensions} refetch={refetchExtensions} />
        )}
      </StyledShowServiceCenterTabs>
    </>
  );
};
