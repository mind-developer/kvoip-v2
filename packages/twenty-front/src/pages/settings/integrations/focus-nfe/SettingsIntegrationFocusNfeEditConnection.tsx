/* eslint-disable react-hooks/rules-of-hooks */
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsIntegrationFocusNfeDatabaseConnectionForm } from '@/settings/integrations/focus-nfe/components/SettingsIntegrationFocusNfeDatabaseConnectionForm';
import { useGetAllFocusNfeIntegrationsByWorkspace } from '@/settings/integrations/focus-nfe/hooks/useGetAllFocusNfeIntegrationByWorkspace';
import { useUpdateFocusNfeIntegration } from '@/settings/integrations/focus-nfe/hooks/useUpdateFocusNfeIntegration';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { z } from 'zod';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
/* @kvoip-woulz proprietary:begin */
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { createTextValidationSchema } from '@/object-record/record-field/ui/validation-schemas/textWithPatternSchema';

// Create form schema dynamically based on field metadata
const createFocusNfeEditFormSchema = (objectMetadataItem?: ObjectMetadataItem) => {
  if (!objectMetadataItem) {
    return z.object({
      id: z.string(),
      name: z.string().min(1, 'Name is required'),
      token: z.string().optional(),
      companyName: z.string().min(1, 'Company name is required'),
      cnpj: z.string(),
      cpf: z.string().optional().nullable(),
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
      return createTextValidationSchema(validation.pattern, validation.errorMessage);
    }
    return z.string();
  };

  return z.object({
    id: z.string(),
    name: z.string().min(1, 'Name is required'),
    token: z.string().optional(),
    companyName: z.string().min(1, 'Company name is required'),
    cnpj: getFieldValidationSchema('cnpj'),
    cpf: getFieldValidationSchema('cpf').optional().nullable(),
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
/* @kvoip-woulz proprietary:end */

// Static schema for type inference
export const settingsIntegrationFocusNfeConnectionFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  token: z.string().optional(),
  companyName: z.string().min(1),
  cnpj: z.string(),
  cpf: z.string().optional().nullable(),
  ie: z.string(),
  inscricaoMunicipal: z.string(),
  cnaeCode: z.string().optional(),
  cep: z.string(),
  street: z.string(),
  number: z.string(),
  neighborhood: z.string(),
  city: z.string().min(1),
  state: z.string(),
  taxRegime: z.string(),
});

export type SettingsEditIntegrationFocusNfeConnectionFormValues = z.infer<
  typeof settingsIntegrationFocusNfeConnectionFormSchema
>;

export const SettingsIntegrationFocusNfeEditDatabaseConnection = () => {
  const navigate = useNavigateSettings();
  const navigateApp = useNavigateApp();
  const { enqueueErrorSnackBar } = useSnackBar();
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

  /* @kvoip-woulz proprietary:begin */
  // Get FocusNFe object metadata for dynamic validation
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: 'focusNFe',
  });

  // Create dynamic form schema based on field metadata
  const dynamicFormSchema = useMemo(
    () => createFocusNfeEditFormSchema(objectMetadataItem),
    [objectMetadataItem],
  );
  /* @kvoip-woulz proprietary:end */

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
      /* @kvoip-woulz proprietary:begin */
      resolver: zodResolver(dynamicFormSchema),
      /* @kvoip-woulz proprietary:end */
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

  /* @kvoip-woulz proprietary:begin */
  useEffect(() => {
    formConfig.clearErrors();
  }, [dynamicFormSchema, formConfig]);
  /* @kvoip-woulz proprietary:end */

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
            {/* @kvoip-woulz proprietary:begin */}
            <SettingsIntegrationFocusNfeDatabaseConnectionForm
              objectMetadataItem={objectMetadataItem}
            />
            {/* @kvoip-woulz proprietary:end */}
          </Section>
        </FormProvider>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
