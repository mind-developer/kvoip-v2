/* eslint-disable react-hooks/rules-of-hooks */
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { SettingsIntegrationWhatsappDatabaseConnectionForm } from '@/settings/integrations/meta/whatsapp/components/SettingsIntegrationWhatsappDatabaseConnectionForm';
import { type Sector } from '@/settings/service-center/sectors/types/Sector';
import { AppPath } from '@/types/AppPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { z } from 'zod';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const settingsEditIntegrationWhatsappConnectionFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  phoneId: z.string(),
  businessAccountId: z.string(),
  accessToken: z.string().min(1),
  appId: z.string(),
  appKey: z.string(),
  apiType: z.string(),
  sectorId: z.string().min(1, 'Select a sector'),
});

export type SettingsEditIntegrationWhatsappConnectionFormValues = z.infer<
  typeof settingsEditIntegrationWhatsappConnectionFormSchema
>;

export const SettingsIntegrationWhatsappEditDatabaseConnection = () => {
  const navigate = useNavigateSettings();
  const navigateApp = useNavigateApp();
  const { enqueueErrorSnackBar } = useSnackBar();
  const settingsIntegrationsPagePath = getSettingsPath(
    SettingsPath.Integrations,
  );

  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key === 'whatsapp',
  );

  const { connectionId } = useParams<{ connectionId?: string }>();

  const whatsappIntegrations = useFindManyRecords<
    ObjectRecord & { __typename: string }
  >({
    objectNameSingular: 'whatsappIntegration',
    recordGqlFields: {
      id: true,
      name: true,
      phoneId: true,
      businessAccountId: true,
      accessToken: true,
      appId: true,
      appKey: true,
      apiType: true,
      defaultSectorId: true,
      defaultSector: {
        id: true,
        name: true,
        icon: true,
      },
    },
  }).records;
  const activeConnection = whatsappIntegrations.find(
    (wa) => wa.id === connectionId,
  );

  const { records: sectors } = useFindManyRecords<
    Sector & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Sector,
    recordGqlFields: { id: true, name: true, icon: true },
  });

  const isIntegrationAvailable = !!integration;

  useEffect(() => {
    if (!isIntegrationAvailable) {
      navigateApp(AppPath.NotFound);
    }
    // eslint-disable-next-line no-sparse-arrays
  }, [integration, , navigateApp, isIntegrationAvailable]);

  if (!isIntegrationAvailable) return null;

  const formConfig =
    useForm<SettingsEditIntegrationWhatsappConnectionFormValues>({
      mode: 'onTouched',
      resolver: zodResolver(
        settingsEditIntegrationWhatsappConnectionFormSchema,
      ),
      defaultValues: {
        id: activeConnection?.id,
        name: activeConnection?.name,
        phoneId: activeConnection?.phoneId,
        businessAccountId: activeConnection?.businessAccountId,
        appId: activeConnection?.appId,
        appKey: activeConnection?.appKey,
        apiType: activeConnection?.apiType,
        sectorId: (activeConnection as any)?.defaultSectorId || '',
      },
    });

  const canSave = formConfig.formState.isValid;

  const handleSave = async () => {
    const formValues = formConfig.getValues();

    try {
      // await updateWhatsappIntegration({
      //   id: formValues.id,
      //   name: formValues.name,
      //   phoneId: formValues.phoneId,
      //   businessAccountId: formValues.businessAccountId,
      //   accessToken: formValues.accessToken,
      //   appId: formValues.appId,
      //   appKey: formValues.appKey,
      //   apiType: formValues.apiType,
      // });

      navigate(SettingsPath.IntegrationWhatsappDatabase);
    } catch (error) {
      // TODO: Add proper error message
      enqueueErrorSnackBar({
        message: (error as Error).message,
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
          href: `${settingsIntegrationsPagePath}/whatsapp`,
        },
        { children: `Edit ${activeConnection?.name}` },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          onCancel={() => navigate(SettingsPath.IntegrationWhatsappDatabase)}
          onSave={handleSave}
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
            <SettingsIntegrationWhatsappDatabaseConnectionForm
              disabled={true}
              sectors={sectors}
              editableFields={['name', 'sectorId']}
            />
          </Section>
        </FormProvider>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
