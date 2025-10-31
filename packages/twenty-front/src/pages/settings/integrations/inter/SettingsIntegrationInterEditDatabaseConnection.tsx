/* @kvoip-woulz proprietary */

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { SettingsIntegrationInterDatabaseConnectionForm } from '@/settings/integrations/inter/components/SettingsIntegrationInterDatabaseConnectionForm';
import { useFindAllInterIntegrations } from '@/settings/integrations/inter/hooks/useFindAllInterIntegrations';
import { useUpdateInterIntegration } from '@/settings/integrations/inter/hooks/useUpdateInterIntegration';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { z } from 'zod';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

// Validation schema with pattern validation for Inter-specific fields
export const settingsIntegrationInterConnectionFormSchema = z.object({
  id: z.string(),
  integrationName: z.string().min(1, 'Integration name is required'),
  clientId: z.string().min(1, 'Client ID is required'),
  clientSecret: z.string().min(1, 'Client Secret is required'),
  currentAccount: z
    .string()
    .regex(
      /^\d{8}-\d{2}$/,
      'Current account must be in the format XXXXXXXX-XX',
    ),
  status: z.string().optional(),
  privateKey: z.any().optional(),
  certificate: z.any().optional(),
  expirationDate: z.coerce.date().optional(),
});

export type SettingsEditIntegrationInterConnectionFormValues = z.infer<
  typeof settingsIntegrationInterConnectionFormSchema
>;

export const SettingsIntegrationInterEditDatabaseConnection = () => {
  const navigate = useNavigateSettings();
  const navigateApp = useNavigateApp();
  const { enqueueErrorSnackBar } = useSnackBar();
  const settingsIntegrationsPagePath = getSettingsPath(
    SettingsPath.Integrations,
  );

  const { updateInterIntegration } = useUpdateInterIntegration();

  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll?.integrations?.find(
    ({ from: { key } }) => key === 'inter',
  );

  const { connectionId } = useParams<{ connectionId?: string }>();

  const { interIntegrations, loading } = useFindAllInterIntegrations();
  const activeConnection = interIntegrations?.find(
    (wa) => wa.id === connectionId,
  );

  const isIntegrationAvailable = !!integration;
  const isDataLoaded = !loading && interIntegrations !== undefined;

  const formConfig = useForm<SettingsEditIntegrationInterConnectionFormValues>({
    mode: 'onChange',
    resolver: zodResolver(settingsIntegrationInterConnectionFormSchema),
    defaultValues: {
      id: activeConnection?.id,
      clientId: activeConnection?.clientId,
      clientSecret: activeConnection?.clientSecret,
      integrationName: activeConnection?.integrationName,
      currentAccount: activeConnection?.currentAccount,
      expirationDate: activeConnection?.expirationDate ?? undefined,
      certificate: activeConnection?.certificate,
      privateKey: activeConnection?.privateKey,
    },
  });

  useEffect(() => {
    if (!isIntegrationAvailable) {
      navigateApp(AppPath.NotFound);
    }
    // eslint-disable-next-line no-sparse-arrays
  }, [integration, , navigateApp, isIntegrationAvailable]);

  if (!isIntegrationAvailable || !isDataLoaded) return null;

  const canSave = formConfig.formState.isValid;

  const handleUpdate = async () => {
    const formValues = formConfig.getValues();

    try {
      await updateInterIntegration({
        id: formValues?.id,
        clientId: formValues.clientId,
        integrationName: formValues.integrationName,
        clientSecret: formValues.clientSecret,
        currentAccount: formValues.currentAccount,
        certificate: formValues.certificate,
        privateKey: formValues.privateKey,
        expirationDate: formValues.expirationDate,
      });

      navigate(SettingsPath.IntegrationInterDatabase);
    } catch (error) {
      // TODO: Add proper error message
      enqueueErrorSnackBar({
        message: (error as Error).message,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title={`Edit ${activeConnection?.integrationName}`}
      links={[
        {
          children: 'Workspace',
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: 'Integrations',
          href: settingsIntegrationsPagePath,
        },
        {
          children: integration.text,
          href: `${settingsIntegrationsPagePath}/inter`,
        },
        { children: `Edit ${activeConnection?.integrationName}` },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          onCancel={() => navigate(SettingsPath.IntegrationInterDatabase)}
          onSave={handleUpdate}
        />
      }
    >
      <SettingsPageContainer>
        <FormProvider
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...formConfig}
        >
          <Section>
            <H2Title
              title=""
              description="Edit the information to connect your integration"
            />
            <SettingsIntegrationInterDatabaseConnectionForm />
          </Section>
        </FormProvider>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
