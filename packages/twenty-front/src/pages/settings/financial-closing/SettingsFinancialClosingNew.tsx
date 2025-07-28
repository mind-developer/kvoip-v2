import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsFinancialClosingForm, FinancialClosingFormSchema} from '@/settings/financial-closing/components/SettingsFinancialClosingForm';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SettingsPath } from '@/types/SettingsPath';
import { useRecoilValue } from 'recoil';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CreateFinancialClosingInput } from '@/settings/financial-closing/types/CreateFinancialClosingInput';
import { useCreateFinancialClosing } from '@/settings/financial-closing/hooks/useCreateFinancialClosing';

// const financialClosingFormSchema = z.object({
//   name: z.string().min(3, 'Name is required'),
// });

const newFinancialClosingFormSchema = FinancialClosingFormSchema.extend({
  workspaceId: z.string(),
});

type FinancialClosingFormValues = z.infer<typeof newFinancialClosingFormSchema>;

export const SettingsFinancialClosingNew = () => {
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  // const { createSector } = useCreateSector();
  const { createFinancialClosing } = useCreateFinancialClosing();

  const formConfig = useForm<FinancialClosingFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(newFinancialClosingFormSchema),
    defaultValues: {
      name: '',
      last_day_month: false,
      time: '00:00',
      workspaceId: currentWorkspace?.id,
    },
  });

  const { isValid, isSubmitting } = formConfig.formState;
  const canSave = isValid && !isSubmitting;

  const settingsFinancialClosingPagePath = getSettingsPath(
    SettingsPath.FinancialClosing,
  );

  const onSave = async (formValue: FinancialClosingFormValues) => {
    try {      
      const financialClosingData: CreateFinancialClosingInput = {
        name: formValue.name,
        day: formValue.day,
        last_day_month: formValue.last_day_month,
        time: formValue.time,
        billingModelIds: formValue.billingModelIds,
        workspaceId: formValue.workspaceId,
      };
      
      await createFinancialClosing(financialClosingData);

      console.log('Submit', financialClosingData)

      navigate(settingsFinancialClosingPagePath);
    } catch (err) {
      enqueueSnackBar((err as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title={'Fechamento'}
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
          children: 'Kvoip',
          href: getSettingsPath(SettingsPath.FinancialClosing),
        },
        { children: 'Novo Fechamento' },
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
