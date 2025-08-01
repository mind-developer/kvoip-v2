/* eslint-disable react/jsx-props-no-spreading */
import { zodResolver } from '@hookform/resolvers/zod';
import pick from 'lodash.pick';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ThemeColor } from 'twenty-ui/theme';
import { z } from 'zod';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';

import { useUpdateSector } from '@/settings/service-center/sectors/hooks/useUpdateSector';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { FinancialClosingFormSchema, SettingsFinancialClosingForm } from '@/settings/financial-closing/components/SettingsFinancialClosingForm';
import { useFindAllFinancialClosings } from '@/settings/financial-closing/hooks/useFindAllFinancialClosings';
import { useUpdateFinancialClosing } from '@/settings/financial-closing/hooks/useUpdateFinancialClosing';

const editFinancialClosingFormSchema = z
  .object({})
  .merge(FinancialClosingFormSchema)
  .extend({
    id: z.string(),
    workspaceId: z.string(),
  });

type SettingsEditFinancialClosingSchemaValues = z.infer<typeof editFinancialClosingFormSchema>;

export const SettingsFinancialClosingEdit = () => {
  // const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueSnackBar } = useSnackBar();

  const { financialClosings } = useFindAllFinancialClosings();
  const { editFinancialClosing } = useUpdateFinancialClosing();

  const { financialClosingId } = useParams<{ financialClosingId?: string }>();

  const activeFinancialClosing = financialClosings.find((financialClosing) => financialClosing.id === financialClosingId);

  const settingsFinancialClosingsPagePath = getSettingsPath(
    SettingsPath.FinancialClosing
  );

  const formConfig = useForm<SettingsEditFinancialClosingSchemaValues>({
    mode: 'onTouched',
    resolver: zodResolver(editFinancialClosingFormSchema),
  });

  const { isValid, isSubmitting } = formConfig.formState;
  const canSave = isValid && !isSubmitting;

  const onSave = async (formValues: any) => {
    const dirtyFieldsKeys = Object.keys(
      formConfig.formState.dirtyFields,
    ) as (keyof SettingsEditFinancialClosingSchemaValues)[];
    try {
      // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
      if (activeFinancialClosing?.id) {
        const updatedValues = {
          ...pick(formValues, dirtyFieldsKeys),
          id: formValues.id,
        };

        await editFinancialClosing(updatedValues);

        navigate(settingsFinancialClosingsPagePath);
      }
    } catch (err) {
      enqueueSnackBar((err as Error).message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title={'Fechamento Financeiro'}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          isCancelDisabled={isSubmitting}
          onCancel={() => navigate(settingsFinancialClosingsPagePath)}
          onSave={formConfig.handleSubmit(onSave)}
        />
      }
      links={[
        {
          children: 'Editar',
          href: `${settingsFinancialClosingsPagePath}`,
        },
        { children: `${activeFinancialClosing?.name ?? '--'}` },
      ]}
    >
      <FormProvider {...formConfig}>
        <SettingsPageContainer>
          {/* <SettingsServiceCenterSectorAboutForm activeFinancialClosing={activeFinancialClosing} /> */}
          <SettingsFinancialClosingForm activeFinancialClosing={activeFinancialClosing} />
        </SettingsPageContainer>
      </FormProvider>
    </SubMenuTopBarContainer>
  );
};
