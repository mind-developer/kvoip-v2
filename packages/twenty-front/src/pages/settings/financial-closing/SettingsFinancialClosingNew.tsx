/* @kvoip-woulz proprietary */
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  FinancialClosingFormSchema,
  SettingsFinancialClosingForm,
} from '@/settings/financial-closing/components/SettingsFinancialClosingForm';
import { useCreateFinancialClosing } from '@/settings/financial-closing/hooks/useCreateFinancialClosing';
import { CreateFinancialClosingInput } from '@/settings/financial-closing/types/CreateFinancialClosingInput';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const newFinancialClosingFormSchema = FinancialClosingFormSchema.extend({
  workspaceId: z.string(),
  id: z.string().optional(),
});

type FinancialClosingFormValues = z.infer<typeof newFinancialClosingFormSchema>;

export const SettingsFinancialClosingNew = () => {
  const navigate = useNavigate();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { createFinancialClosing } = useCreateFinancialClosing();

  const formConfig = useForm<FinancialClosingFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(newFinancialClosingFormSchema),
    defaultValues: {
      id: '',
      name: '',
      lastDayMonth: false,
      time: '00:00',
      day: undefined, 
      billingModelIds: [],
      workspaceId: currentWorkspace?.id,
    },
  });

  const { isValid, isSubmitting, errors } = formConfig.formState;
  const canSave = isValid && !isSubmitting;

  const settingsFinancialClosingPagePath = getSettingsPath(
    SettingsPath.FinancialClosing,
  );

  const onSave = async (formValue: FinancialClosingFormValues) => {
    try {
      const financialClosingData: CreateFinancialClosingInput = {
        name: formValue.name,
        day: formValue.day,
        lastDayMonth: formValue.lastDayMonth,
        time: formValue.time,
        billingModelIds: formValue.billingModelIds,
        workspaceId: formValue.workspaceId,
      };

      await createFinancialClosing(financialClosingData);

      navigate(settingsFinancialClosingPagePath);
    } catch (err) {
      enqueueErrorSnackBar({
        message: (err as Error).message,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title={t`Financial Closing`}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          isCancelDisabled={isSubmitting}
          onCancel={() => navigate(settingsFinancialClosingPagePath)}
          onSave={formConfig.handleSubmit(onSave)}
        />
      }
      links={[
        {
          children: t`Financial Closings`,
          href: getSettingsPath(SettingsPath.FinancialClosing),
        },
        { children: t`New` },
      ]}
    >
      <FormProvider {...formConfig}>
        <SettingsPageContainer>
          <SettingsFinancialClosingForm />
        </SettingsPageContainer>
      </FormProvider>
    </SubMenuTopBarContainer>
  );
};
