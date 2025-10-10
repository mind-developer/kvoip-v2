/* @kvoip-woulz proprietary */
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useLingui } from '@lingui/react/macro';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { ShowServiceCenterTelephonyTabs } from '~/pages/settings/service-center/SettingsServiceCenterShowTabs';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const SettingsServiceCenterTelephony = () => {

  const { t } = useLingui();

  return (
    <SubMenuTopBarContainer
      title={t`Extensions`}
      actionButton={
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.FinancialClosingNew)}
        >
          <Button
            Icon={IconPlus}
            title={t`Add Extension`}
            accent="blue"
            size="small"
          />
        </UndecoratedLink>
      }
      links={[
        {
          children: t`Service Center`,
        },
        { children: t`Extensions` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title="" description={t`Manage all extensions here.`} />
          <ShowServiceCenterTelephonyTabs />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
