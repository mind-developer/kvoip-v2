/* @kvoip-woulz proprietary */
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from 'twenty-shared/types';

import { SettingsFinancialClosings } from '@/settings/financial-closing/components/SettingsFinancialClosings';
import { useFindAllFinancialClosings } from '@/settings/financial-closing/hooks/useFindAllFinancialClosings';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';

export const SettingsFinancialClosing = () => {
  const { t } = useLingui();

  const { financialClosings, refetch } = useFindAllFinancialClosings();

  useEffect(() => {
    refetch();
  }, []);

  return (
    <SubMenuTopBarContainer
      title={t`Financial Closings`}
      actionButton={
        <UndecoratedLink to={getSettingsPath(SettingsPath.FinancialClosingNew)}>
          <Button
            Icon={IconPlus}
            title={t`Add Financial Closing`}
            accent="blue"
            size="small"
          />
        </UndecoratedLink>
      }
      links={[
        {
          children: t`Financial Closings`,
        },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title=""
            description={t`Manage all financial closings here.`}
          />
          <SettingsFinancialClosings
            financialClosings={financialClosings}
            refetchFinancialClosings={refetch}
          />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
