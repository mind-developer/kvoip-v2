import { useNavigate } from 'react-router-dom';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import SettingsServiceCenterAgentAboutForm from '@/settings/service-center/agents/components/SettingsServiceCenterAgentAboutForm';
import { useNewAgentForm } from '@/settings/service-center/agents/hooks/useNewAgentForm';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { t } from '@lingui/core/macro';
import { FormProvider } from 'react-hook-form';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const SettingsServiceCenterNewAgent = () => {
  const navigate = useNavigate();
  const { form, onSubmit } = useNewAgentForm();

  const settingsServiceCenterAgentsPagePath = getSettingsPath(
    SettingsPath.ServiceCenterAgents,
  );

  return (
    <SubMenuTopBarContainer
      title={t`Create agent`}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!form.formState.isValid}
          onSave={onSubmit}
          onCancel={() => navigate(settingsServiceCenterAgentsPagePath)}
        />
      }
      links={[
        {
          children: 'Agents',
          href: getSettingsPath(SettingsPath.ServiceCenterAgents),
        },
        { children: 'New Agent' },
      ]}
    >
      <SettingsPageContainer>
        <FormProvider {...form}>
          <div style={{ overflow: 'visible' }}>
            <SettingsServiceCenterAgentAboutForm />
          </div>
        </FormProvider>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
