import { zodResolver } from '@hookform/resolvers/zod';
import { useContext, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

import { useCreateOneDatabaseConnection } from '@/databases/hooks/useCreateOneDatabaseConnection';
import { getForeignDataWrapperType } from '@/databases/utils/getForeignDataWrapperType';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  SettingsIntegrationDatabaseConnectionForm,
  settingsIntegrationPostgreSQLConnectionFormSchema,
  settingsIntegrationStripeConnectionFormSchema,
} from '@/settings/integrations/database-connection/components/SettingsIntegrationDatabaseConnectionForm';
import { useIsSettingsIntegrationEnabled } from '@/settings/integrations/hooks/useIsSettingsIntegrationEnabled';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { H2Title, Section } from 'twenty-ui';
import { useTranslation } from 'react-i18next';
import { CreateRemoteServerInput } from '~/generated-metadata/graphql';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import SripeLoginButton from './stripe/components/SripeLoginButton';
import {
  StripeContext,
  StripeIntegrationContextType,
} from './stripe/context/StripeContext';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const createRemoteServerInputPostgresSchema =
  settingsIntegrationPostgreSQLConnectionFormSchema.transform<CreateRemoteServerInput>(
    (values) => ({
      foreignDataWrapperType: 'postgres_fdw',
      foreignDataWrapperOptions: {
        dbname: values.dbname,
        host: values.host,
        port: values.port,
      },
      userMappingOptions: {
        password: values.password,
        user: values.user,
      },
      schema: values.schema,
      label: values.label,
    }),
  );

type SettingsIntegrationNewConnectionPostgresFormValues = z.infer<
  typeof createRemoteServerInputPostgresSchema
>;

const createRemoteServerInputStripeSchema =
  settingsIntegrationStripeConnectionFormSchema.transform<CreateRemoteServerInput>(
    (values) => ({
      foreignDataWrapperType: 'stripe_fdw',
      foreignDataWrapperOptions: {
        api_key: values.api_key,
      },
      label: values.label,
    }),
  );

type SettingsIntegrationNewConnectionStripeFormValues = z.infer<
  typeof createRemoteServerInputStripeSchema
>;

type SettingsIntegrationNewConnectionFormValues =
  | SettingsIntegrationNewConnectionPostgresFormValues
  | SettingsIntegrationNewConnectionStripeFormValues;

export const SettingsIntegrationNewDatabaseConnection = () => {
  const { t } = useTranslation();
  const { databaseKey = '' } = useParams();
  const navigate = useNavigate();

  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key === databaseKey,
  );

  const { createOneDatabaseConnection } = useCreateOneDatabaseConnection();
  const { enqueueSnackBar } = useSnackBar();

  const { stripeLogin } = useContext(
    StripeContext,
  ) as StripeIntegrationContextType;

  const isIntegrationEnabled = useIsSettingsIntegrationEnabled(databaseKey);

  const isIntegrationAvailable = !!integration && isIntegrationEnabled;

  useEffect(() => {
    if (!isIntegrationAvailable) {
      navigate(AppPath.NotFound);
    }
  }, [integration, databaseKey, navigate, isIntegrationAvailable]);

  const newConnectionSchema =
    databaseKey === 'postgresql'
      ? createRemoteServerInputPostgresSchema
      : createRemoteServerInputStripeSchema;

  const formConfig = useForm<SettingsIntegrationNewConnectionFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(newConnectionSchema),
  });

  if (!isIntegrationAvailable) return null;

  const settingsIntegrationsPagePath = getSettingsPagePath(
    SettingsPath.Integrations,
  );

  const canSave = formConfig.formState.isValid;

  const handleSave = async () => {
    const formValues = formConfig.getValues();

    try {
      const createdConnection = await createOneDatabaseConnection(
        newConnectionSchema.parse({
          ...formValues,
          foreignDataWrapperType: getForeignDataWrapperType(databaseKey),
        }),
      );

      const connectionId = createdConnection.data?.createOneRemoteServer.id;

      navigate(
        `${settingsIntegrationsPagePath}/${databaseKey}/${connectionId}`,
      );
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  const title =
    databaseKey === 'messenger'
      ? 'Messenger Inbox'
      : databaseKey === 'whatsapp'
        ? 'WhatsApp Inbox'
        : databaseKey === 'stripe'
          ? 'Stripe Connect'
          : t('connectANewDatabase');

  const description =
    databaseKey === 'messenger'
      ? 'Start supporting your customers via Facebook Messenger'
      : databaseKey === 'whatsapp'
        ? 'Start supporting your customers via WhatsApp'
        : databaseKey === 'stripe'
          ? ''
          : t('connectANewDatabaseDescription');

  return (
    <SubMenuTopBarContainer
      title="New"
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        {
          children: 'Integrations',
          href: settingsIntegrationsPagePath,
        },
        {
          children: integration.text,
          href: `${settingsIntegrationsPagePath}/${databaseKey}`,
        },
        { children: 'New' },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          onCancel={() =>
            navigate(`${settingsIntegrationsPagePath}/${databaseKey}`)
          }
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        <FormProvider
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...formConfig}
        >
          <SettingsHeaderContainer>
            <Breadcrumb
              links={[
                {
                  children: t('integrations'),
                  href: settingsIntegrationsPagePath,
                },
                {
                  children: integration.text,
                  href: `${settingsIntegrationsPagePath}/${databaseKey}`,
                },
                { children: t('new') },
              ]}
            />
            <SaveAndCancelButtons
              isSaveDisabled={!canSave}
              onCancel={() =>
                navigate(`${settingsIntegrationsPagePath}/${databaseKey}`)
              }
              onSave={handleSave}
            />
          </SettingsHeaderContainer>
          <Section>
            <H2Title title={title} description={description} />

            {databaseKey === 'whatsapp' && (
              <SettingsIntegrationDatabaseConnectionForm
                databaseKey={databaseKey}
              />
            )}

            {databaseKey === 'stripe' && (
              <SripeLoginButton onClick={stripeLogin} />
            )}
          </Section>
        </FormProvider>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
