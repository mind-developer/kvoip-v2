/* @kvoip-woulz proprietary */
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title, IconPlus, IconSearch } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { ShowServiceCenterTelephonyTabs } from '~/pages/settings/service-center/SettingsServiceCenterShowTabs';

const StyledTextInput = styled(TextInput)`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  width: 100%;
`;

export const SettingsServiceCenterTelephony = () => {
  const { t } = useLingui();
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <SubMenuTopBarContainer
      title={t`Extensions`}
      actionButton={
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.ServiceCenterNewTelephonyExtension)}
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
          <StyledTextInput
            onChange={setSearchTerm}
            value={searchTerm}
            placeholder={t`Search extensions and operators...`}
            LeftIcon={IconSearch}
          />
          <ShowServiceCenterTelephonyTabs searchTerm={searchTerm} />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
