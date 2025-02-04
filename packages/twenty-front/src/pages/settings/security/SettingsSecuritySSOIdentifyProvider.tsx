/* @license Enterprise */

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import SettingsSSOIdentitiesProvidersForm from '@/settings/security/components/SSO/SettingsSSOIdentitiesProvidersForm';
import { useCreateSSOIdentityProvider } from '@/settings/security/hooks/useCreateSSOIdentityProvider';
import { SettingSecurityNewSSOIdentityFormValues } from '@/settings/security/types/SSOIdentityProvider';
import { sSOIdentityProviderDefaultValues } from '@/settings/security/utils/sSOIdentityProviderDefaultValues';
import { SSOIdentitiesProvidersParamsSchema } from '@/settings/security/validation-schemas/SSOIdentityProviderSchema';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trans } from '@lingui/react/macro';
import pick from 'lodash.pick';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

export const SettingsSecuritySSOIdentifyProvider = () => {
  const navigate = useNavigate();

  const { enqueueSnackBar } = useSnackBar();
  const { createSSOIdentityProvider } = useCreateSSOIdentityProvider();

  const form = useForm<SettingSecurityNewSSOIdentityFormValues>({
    mode: 'onSubmit',
    resolver: zodResolver(SSOIdentitiesProvidersParamsSchema),
    defaultValues: Object.values(sSOIdentityProviderDefaultValues).reduce(
      (acc, fn) => ({ ...acc, ...fn() }),
      {},
    ),
  });

  const handleSave = async () => {
    try {
      const type = form.getValues('type');

      await createSSOIdentityProvider(
        SSOIdentitiesProvidersParamsSchema.parse(
          pick(
            form.getValues(),
            Object.keys(sSOIdentityProviderDefaultValues[type]()),
          ),
        ),
      );

      navigate(getSettingsPagePath(SettingsPath.Security));
    } catch (error) {
      enqueueSnackBar((error as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title="New SSO Configuration"
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!formConfig.formState.isValid}
          onCancel={() => navigate(getSettingsPagePath(SettingsPath.Security))}
          onSave={handleSave}
        />
      }
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        {
          children: 'Security',
          href: getSettingsPagePath(SettingsPath.Security),
        },
        { children: 'New' },
      ]}
    >
      <FormProvider
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...form}
      >
        <SubMenuTopBarContainer
          title={t`New SSO Configuration`}
          actionButton={
            <SaveAndCancelButtons
              onCancel={() => navigate(SettingsPath.Security)}
              isSaveDisabled={form.formState.isSubmitting}
            />
          }
          links={[
            {
              children: <Trans>Workspace</Trans>,
              href: getSettingsPath(SettingsPath.Workspace),
            },
            {
              children: <Trans>Security</Trans>,
              href: getSettingsPath(SettingsPath.Security),
            },
            { children: <Trans>New SSO provider</Trans> },
          ]}
        >
          <SettingsSSOIdentitiesProvidersForm />
        </SubMenuTopBarContainer>
      </FormProvider>
    </form>
  );
};
