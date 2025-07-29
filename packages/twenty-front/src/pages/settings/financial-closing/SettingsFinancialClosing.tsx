import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';

import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useEffect } from 'react';
import { H2Title, IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SettingsFinancialClosings } from '@/settings/financial-closing/components/SettingsFinancialClosings';
import { useFindAllFinancialClosings } from '@/settings/financial-closing/hooks/useFindAllFinancialClosings';

export const SettingsFinancialClosing = () => {
  // const { t } = useTranslation();

  const { financialClosings, refetch } = useFindAllFinancialClosings();

  useEffect(() => {
    refetch();
  }, []);

  return (
    <SubMenuTopBarContainer
      title={'Fechamentos'}
      actionButton={
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.FinancialClosingNew)}
        >
          <Button
            Icon={IconPlus}
            title={'Add Fechamento'}
            accent="blue"
            size="small"
          />
        </UndecoratedLink>
      }
      links={[
        {
          children: 'Kvoip',
          // href: getSettingsPath(SettingsPath.ServiceCenter),
        },
        { children: 'Fechamento' },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title="" description={'Gerencie todos os fechamentos financeiros aqui.'} />
          <SettingsFinancialClosings financialClosings={financialClosings} refetchFinancialClosings={refetch} />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
