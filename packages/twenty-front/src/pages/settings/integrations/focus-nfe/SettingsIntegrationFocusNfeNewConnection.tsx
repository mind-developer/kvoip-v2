import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createTextValidationSchema } from '@/object-record/record-field/ui/validation-schemas/textWithPatternSchema';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationFocusNfeDatabaseConnectionForm } from '@/settings/integrations/focus-nfe/components/SettingsIntegrationFocusNfeDatabaseConnectionForm';
import { useCreateFocusNfeIntegration } from '@/settings/integrations/focus-nfe/hooks/useCreateFocusNfeIntegration';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { H2Title, Info } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { z } from 'zod';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const createFocusNfeFormSchema = (objectMetadataItem?: ObjectMetadataItem) => {
  if (!objectMetadataItem) {
    return z.object({
      name: z.string().min(1, 'Name is required'),
      token: z.string().min(1, 'Token is required'),
      companyName: z.string().min(1, 'Company name is required'),
      cnpj: z.string(),
      cpf: z.string().optional(),
      ie: z.string(),
      inscricaoMunicipal: z.string(),
      cnaeCode: z.string().optional(),
      cep: z.string(),
      street: z.string(),
      number: z.string(),
      neighborhood: z.string(),
      city: z.string().min(1, 'City is required'),
      state: z.string(),
      taxRegime: z.string(),
    });
  }

  const getFieldValidationSchema = (fieldName: string) => {
    const field = objectMetadataItem.fields.find((f) => f.name === fieldName);
    const validation = field?.settings?.validation;

    if (validation?.pattern) {
      return createTextValidationSchema(
        validation.pattern,
        validation.errorMessage,
      );
    }
    return z.string();
  };

  return z.object({
    name: z.string().min(1, 'Name is required'),
    token: z.string().min(1, 'Token is required'),
    companyName: z.string().min(1, 'Company name is required'),
    cnpj: getFieldValidationSchema('cnpj'),
    cpf: getFieldValidationSchema('cpf').optional(),
    ie: getFieldValidationSchema('ie'),
    inscricaoMunicipal: getFieldValidationSchema('inscricaoMunicipal'),
    cnaeCode: getFieldValidationSchema('cnaeCode').optional(),
    cep: getFieldValidationSchema('cep'),
    street: z.string(),
    number: z.string(),
    neighborhood: z.string(),
    city: z.string().min(1, 'City is required'),
    state: getFieldValidationSchema('state'),
    taxRegime: z.string(),
  });
};

export type SettingsIntegrationFocusNfeConnectionFormValues = {
  name: string;
  token: string;
  companyName: string;
  cnpj: string;
  cpf?: string;
  ie: string;
  inscricaoMunicipal: string;
  cnaeCode?: string;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  taxRegime: string;
};

export const SettingsIntegrationFocusNfeNewDatabaseConnection = () => {
  const navigate = useNavigateSettings();
  const navigateApp = useNavigateApp();
  const { enqueueErrorSnackBar } = useSnackBar();
  const settingsIntegrationsPagePath = getSettingsPath(
    SettingsPath.Integrations,
  );

  const { createFocusNfeIntegration, loading } =
    useCreateFocusNfeIntegration();

  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key.includes('focus'),
  );

  const isIntegrationAvailable = !!integration;

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: 'focusNFe',
  });

  const dynamicFormSchema = useMemo(
    () => createFocusNfeFormSchema(objectMetadataItem),
    [objectMetadataItem],
  );

  const formConfig =
    useForm<SettingsIntegrationFocusNfeConnectionFormValues>({
      mode: 'onChange',
      resolver: zodResolver(dynamicFormSchema),
    });

  useEffect(() => {
    formConfig.clearErrors();
  }, [dynamicFormSchema, formConfig]);

  useEffect(() => {
    if (!isIntegrationAvailable) {
      navigateApp(AppPath.NotFound);
    }
  }, [isIntegrationAvailable, navigateApp]);

  if (!isIntegrationAvailable) return null;

  const canSave = formConfig.formState.isValid;

  const handleSave = async () => {
    const formValues = formConfig.getValues();

    try {
      await createFocusNfeIntegration({
        name: formValues.name,
        token: formValues.token,
        companyName: formValues.companyName,
        cnpj: formValues.cnpj,
        cpf: formValues.cpf || null,
        ie: formValues.ie || null,
        inscricaoMunicipal: formValues.inscricaoMunicipal,
        cnaeCode: formValues.cnaeCode || null,
        cep: formValues.cep,
        street: formValues.street,
        number: formValues.number,
        neighborhood: formValues.neighborhood,
        city: formValues.city,
        state: formValues.state,
        taxRegime: formValues.taxRegime,
      });

      navigate(SettingsPath.IntegrationFocusNfe);
    } catch (error) {
      enqueueErrorSnackBar({
        message: (error as Error).message,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title="New"
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
        { children: 'New' },
      ]}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          onCancel={() => navigate(SettingsPath.IntegrationFocusNfe)}
          onSave={handleSave}
        />
      }
    >
      <SettingsPageContainer>
        <FormProvider {...formConfig}>
          <Section>
            <H2Title
              title="Connect a new integration"
              description="Provide a name and an API key to connect this workspace"
            />
            <Info
              text={'Read how to retrieve the API key'}
              to="https://focusnfe.com.br/doc/#introducao"
              buttonTitle="Go to doc"
            />
            <SettingsIntegrationFocusNfeDatabaseConnectionForm
              disabled={loading}
              objectMetadataItem={objectMetadataItem}
            />
          </Section>
        </FormProvider>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};