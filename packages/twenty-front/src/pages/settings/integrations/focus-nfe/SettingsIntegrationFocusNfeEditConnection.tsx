/* eslint-disable react-hooks/rules-of-hooks */
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationFocusNfeDatabaseConnectionForm } from '@/settings/integrations/focus-nfe/components/SettingsIntegrationFocusNfeDatabaseConnectionForm';
import { useGetAllFocusNfeIntegrationsByWorkspace } from '@/settings/integrations/focus-nfe/hooks/useGetAllFocusNfeIntegrationByWorkspace';
import { useUpdateFocusNfeIntegration } from '@/settings/integrations/focus-nfe/hooks/useUpdateFocusNfeIntegration';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
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

export const settingsIntegrationFocusNfeConnectionFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  token: z.string().optional(),
  companyName: z.string().min(1),
  cnpj: z.string().min(14),
  cpf: z.string().optional().nullable(),
  ie: z.string().min(1),
  inscricaoMunicipal: z.string(),
  cnaeCode: z.string(),
  cep: z.string().min(1),
  street: z.string(),
  number: z.string(),
  neighborhood: z.string(),
  city: z.string().min(1),
  state: z.string().min(1),
  taxRegime: z.string(),
});

export type SettingsEditIntegrationFocusNfeConnectionFormValues = z.infer<
  typeof settingsIntegrationFocusNfeConnectionFormSchema
>;

export const SettingsIntegrationFocusNfeEditDatabaseConnection = () => {
  const navigate = useNavigateSettings();
  const navigateApp = useNavigateApp();
  const { enqueueSnackBar } = useSnackBar();
  const settingsIntegrationsPagePath = getSettingsPath(
    SettingsPath.Integrations,
  );

  const { updateFocusNfeIntegration } = useUpdateFocusNfeIntegration();

  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key.includes('focus'),
  );

  const { connectionId } = useParams<{ connectionId?: string }>();

  const { focusNfeIntegrations } = useGetAllFocusNfeIntegrationsByWorkspace();
  const activeConnection = focusNfeIntegrations.find(
    (wa) => wa.id === connectionId,
  );

  const isIntegrationAvailable = !!integration;

  useEffect(() => {
    if (!isIntegrationAvailable) {
      navigateApp(AppPath.NotFound);
    }
    // eslint-disable-next-line no-sparse-arrays
  }, [integration, navigateApp, isIntegrationAvailable]);

  if (!isIntegrationAvailable) return null;

  const formConfig =
    useForm<SettingsEditIntegrationFocusNfeConnectionFormValues>({
      mode: 'onChange',
      resolver: zodResolver(settingsIntegrationFocusNfeConnectionFormSchema),
      defaultValues: {
        id: activeConnection?.id,
        name: activeConnection?.name,
        token: activeConnection?.token,
        companyName: activeConnection?.companyName,
        cnpj: activeConnection?.cnpj,
        cpf: activeConnection?.cpf || null,
        ie: activeConnection?.ie || undefined,
        inscricaoMunicipal: activeConnection?.inscricaoMunicipal,
        cnaeCode: activeConnection?.cnaeCode || undefined,
        cep: activeConnection?.cep,
        street: activeConnection?.street,
        number: activeConnection?.number,
        neighborhood: activeConnection?.neighborhood,
        city: activeConnection?.city,
        state: activeConnection?.state,
        taxRegime: activeConnection?.taxRegime,
      },
    });

  const canSave = formConfig.formState.isValid;

  const handleUpdate = async () => {
    const formValues = formConfig.getValues();

    try {
      await updateFocusNfeIntegration({
        id: formValues?.id,
        name: formValues?.name,
        token: formValues?.token,
        companyName: formValues?.companyName,
        cnpj: formValues?.cnpj,
        cpf: formValues?.cpf || null,
        ie: formValues?.ie || null,
        inscricaoMunicipal: formValues?.inscricaoMunicipal,
        cnaeCode: formValues?.cnaeCode || null,
        cep: formValues?.cep,
        street: formValues?.street,
        number: formValues?.number,
        neighborhood: formValues?.neighborhood,
        city: formValues?.city,
        state: formValues?.state,
        taxRegime: formValues?.taxRegime,
      });

      navigate(SettingsPath.IntegrationFocusNfe);
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title={`Edit ${activeConnection?.name}`}
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
          href: `${settingsIntegrationsPagePath}/focus-nfe`,
        },
        { children: `Edit ${activeConnection?.name}` },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          onCancel={() => navigate(SettingsPath.IntegrationFocusNfe)}
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
            <SettingsIntegrationFocusNfeDatabaseConnectionForm />
          </Section>
        </FormProvider>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
