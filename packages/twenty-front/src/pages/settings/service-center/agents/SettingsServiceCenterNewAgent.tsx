import { useNavigate } from 'react-router-dom';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import SettingsServiceCenterAgentAboutForm from '@/settings/service-center/agents/components/SettingsServiceCenterAgentAboutForm';
import { useNewAgentForm } from '@/settings/service-center/agents/hooks/useNewAgentForm';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { t } from '@lingui/core/macro';
import { FormProvider } from 'react-hook-form';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

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
      <FormProvider {...form}>
        <div style={{ overflow: 'visible' }}>
          <SettingsServiceCenterAgentAboutForm />
        </div>
      </FormProvider>
    </SubMenuTopBarContainer>
  );
};
