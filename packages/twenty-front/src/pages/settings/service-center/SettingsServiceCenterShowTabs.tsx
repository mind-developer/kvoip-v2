/* @kvoip-woulz proprietary */
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { SettingsServiceCenterTelephonySkeletonLoader } from '@/settings/service-center/telephony/components/loaders/SettingsServiceCenterTelephonySkeletonLoader';
import { SettingsServiceCenterExtensionsTabContent } from '@/settings/service-center/telephony/components/SettingsServiceCenterExtensionsTabContent';
import { ServiceCenterTabContent } from '@/settings/service-center/telephony/components/SettingsServiceCenterTabContent';
import { useFindAllExternalExtensions } from '@/settings/service-center/telephony/hooks/useFindAllExternalExtensions';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useLingui } from '@lingui/react/macro';
import { IconPhone, IconUser } from '@tabler/icons-react';
import { useFindAllTelephonys } from '../../../modules/settings/service-center/telephony/hooks/useFindAllTelephony';

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
  const [shouldLoadExtensions, setShouldLoadExtensions] = useState(false);

  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    TAB_LIST_COMPONENT_ID,
  );

  const tabs = [
    {
      id: 'operators',
      title: t`Operators`,
      Icon: IconUser,
    },
    {
      id: 'all-extensions',
      title: t`All Extensions`,
      Icon: IconPhone,
    },
  ];

  const { telephonys, loading: telephonyLoading, refetch, hasError } = useFindAllTelephonys();

  // Só carrega extensões se a companhia já foi criada ou se não há erro
  const { extensions, refetch: refetchExtensions, loading: extensionsLoading } = useFindAllExternalExtensions({
    skip: !shouldLoadExtensions,
  });

  useEffect(() => {
    refetch();
  }, []);

  // Controla quando carregar as extensões
  useEffect(() => {
    if (!telephonyLoading && !hasError && telephonys && telephonys.length > 0) {
      // Se não está carregando, não há erro e há telefonia configurada, pode carregar extensões
      setShouldLoadExtensions(true);
    } else if (!telephonyLoading && hasError) {
      // Se há erro, não carrega extensões
      setShouldLoadExtensions(false);
    }
  }, [telephonyLoading, hasError, telephonys]);

  // Mostra loading enquanto está carregando telefonia ou se ainda não pode carregar extensões
  const isLoading = telephonyLoading || extensionsLoading;

  return (
    <>
      <StyledShowServiceCenterTabs isMobile={isMobile}>
        <TabList tabs={tabs} componentInstanceId={TAB_LIST_COMPONENT_ID} />

        {isLoading ? (
          <SettingsServiceCenterTelephonySkeletonLoader />
        ) : (
          <>
            {activeTabId === 'operators' && (
              <ServiceCenterTabContent telephonys={telephonys} refetch={refetch} />
            )}

            {activeTabId === 'all-extensions' && (
              <SettingsServiceCenterExtensionsTabContent 
                extensions={extensions || []} 
                telephonys={telephonys || []}
                refetch={refetchExtensions} 
              />
            )}
          </>
        )}
      </StyledShowServiceCenterTabs>
    </>
  );
};
