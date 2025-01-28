import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  SettingsRoleAboutForm,
  SettingsRoleFormSchema
} from '@/settings/roles/forms/SettingsRoleAboutForm';
import { useCreateRole } from '@/settings/roles/hooks/useCreateRole';
import { CreateRoleInput, Role } from '@/settings/roles/types/Role';

import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useTranslation } from 'react-i18next';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { H1Title } from 'twenty-ui';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const newRoleFormSchema = SettingsRoleFormSchema.extend({
  workspaceId: z.string(),
});

type SettingsNewRoleSchemaValues = z.infer<typeof newRoleFormSchema>;

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

export const SettingsNewRole = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();
  const { createRole } = useCreateRole();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const formConfig = useForm<SettingsNewRoleSchemaValues>({
    mode: 'onTouched',
    resolver: zodResolver(newRoleFormSchema),
    defaultValues: {
      icon: '',
      name: '',
      description: '',
      canAccessWorkspaceSettings: false,
      permissions: [],
      workspaceId: currentWorkspace?.id,
    },
  });

  const { isValid, isSubmitting } = formConfig.formState;
  const canSave = isValid && !isSubmitting;

  const settingsRolesPagePath = getSettingsPath(SettingsPath.MembersRoles);

  const [selectedReportRole, setSelectedReportRole] = useState('');

  const onSave = async (formValue: SettingsNewRoleSchemaValues) => {
    try {
      const roleData: CreateRoleInput = {
        icon: formValue.icon,
        name: formValue.name,
        description: formValue.description,
        canAccessWorkspaceSettings: formValue.canAccessWorkspaceSettings,
        permissions: formValue.permissions,
        workspaceId: formValue.workspaceId,
        reportsTo: selectedReportRole as unknown as Role
      };

      await createRole(roleData);
      navigate(settingsRolesPagePath);
    } catch (err) {
      enqueueSnackBar((err as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>
      <SubMenuTopBarContainer 
        links={[
        {
            children: 'Workspace',
            href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: 'Roles',
          href: getSettingsPath(SettingsPath.MembersRoles),
        },
        {
          children: t('rolesDescription')
        }
        ]} 
        title={""}>
        <SettingsPageContainer >
          <SettingsHeaderContainer>
            <StyledH1Title title={t("newRole")} />
            <SaveAndCancelButtons
              isSaveDisabled={!canSave}
              isCancelDisabled={isSubmitting}
              onCancel={() => navigate(settingsRolesPagePath)}
              onSave={formConfig.handleSubmit(onSave)}
            />
          </SettingsHeaderContainer>
          <SettingsRoleAboutForm selectedReportRole={selectedReportRole} setSelectedReportRole={setSelectedReportRole}/>
        </SettingsPageContainer>
      </SubMenuTopBarContainer>
    </FormProvider>
  );
};
