import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';

import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { Trans, useLingui } from '@lingui/react/macro';
import { useTheme } from '@emotion/react';

export const SettingsCompanyFinancialClosingExecutionShow = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <SubMenuTopBarContainer
      title={'Detalhes de Execução da Companhia'}
      // actionButton={
      //   <UndecoratedLink
      //     to={getSettingsPath(SettingsPath.FinancialClosingNew)}
      //   >
      //     <Button
      //       Icon={IconPlus}
      //       title={'Add Fechamento'}
      //       accent="blue"
      //       size="small"
      //     />
      //   </UndecoratedLink>
      // }
      links={[
        {
          children: 'Fechamentos',
          href: getSettingsPath(SettingsPath.FinancialClosing),
        },
        { children: 'Detalhes' },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title="" description={'Detalhes da execução da companhia no fechamento financeiro'} />


        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
