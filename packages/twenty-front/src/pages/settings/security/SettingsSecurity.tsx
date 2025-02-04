import styled from '@emotion/styled';
import { H2Title, IconLock, Section, Tag } from 'twenty-ui';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsReadDocumentationButton } from '@/settings/developers/components/SettingsReadDocumentationButton';
import { SettingsSSOIdentitiesProvidersListCard } from '@/settings/security/components/SettingsSSOIdentitiesProvidersListCard';
import { SettingsSecurityOptionsList } from '@/settings/security/components/SettingsSecurityOptionsList';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';

const StyledContainer = styled.div`
  width: 100%;
`;

const StyledMainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(10)};
  min-height: 200px;
`;

const StyledSection = styled(Section)`
  flex-shrink: 0;
`;

export const SettingsSecurity = () => {
  return (
    <SubMenuTopBarContainer
      title="Security"
      actionButton={<SettingsReadDocumentationButton />}
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: 'Security' },
      ]}
    >
      <SettingsPageContainer>
        <StyledMainContent>
          <StyledSection>
            <H2Title
              title="SSO"
              description="Configure an SSO connection"
              adornment={
                <Tag
                  text={'Enterprise'}
                  color={'transparent'}
                  Icon={IconLock}
                  variant={'border'}
                />
              }
            />
            <SettingsSSOIdentitiesProvidersListCard />
          </StyledSection>
          {IsApprovedAccessDomainsEnabled && (
            <StyledSection>
              <H2Title
                title={t`Approved Domains`}
                description={t`Anyone with an email address at these domains is allowed to sign up for this workspace.`}
              />
              <SettingsApprovedAccessDomainsListCard />
            </StyledSection>
          )}
          <Section>
            <StyledContainer>
              <H2Title
                title="Authentication"
                description="Customize your workspace security"
              />
              <SettingsSecurityAuthProvidersOptionsList />
            </StyledContainer>
          </Section>
        </StyledMainContent>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
