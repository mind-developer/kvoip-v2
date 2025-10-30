/* eslint-disable react/jsx-props-no-spreading */
/* @kvoip-woulz proprietary */
import { zodResolver } from '@hookform/resolvers/zod';
import pick from 'lodash.pick';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';

import {
  FinancialClosingFormSchema,
  SettingsFinancialClosingForm,
} from '@/settings/financial-closing/components/SettingsFinancialClosingForm';
import { useFindAllFinancialClosings } from '@/settings/financial-closing/hooks/useFindAllFinancialClosings';
import { useUpdateFinancialClosing } from '@/settings/financial-closing/hooks/useUpdateFinancialClosing';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useLingui } from '@lingui/react/macro';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const editFinancialClosingFormSchema = z
  .object({})
  .merge(FinancialClosingFormSchema)
  .extend({
    id: z.string(),
    workspaceId: z.string(),
  });

type SettingsEditFinancialClosingSchemaValues = z.infer<
  typeof editFinancialClosingFormSchema
>;

export const SettingsFinancialClosingEdit = () => {
  const navigate = useNavigate();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  const { financialClosings } = useFindAllFinancialClosings();
  const { editFinancialClosing } = useUpdateFinancialClosing();

  const { financialClosingId } = useParams<{ financialClosingId?: string }>();

  const activeFinancialClosing = financialClosings.find(
    (financialClosing) => financialClosing.id === financialClosingId,
  );

  const settingsFinancialClosingsPagePath = getSettingsPath(
    SettingsPath.FinancialClosing,
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
          onCancel={() => navigate(settingsFinancialClosingsPagePath)}
          onSave={formConfig.handleSubmit(onSave)}
        />
      }
      links={[
        {
          children: t`Financial Closings`,
          href: getSettingsPath(SettingsPath.FinancialClosing),
        },
        {
          children: t`Edit`,
        },
      ]}
    >
      <FormProvider {...formConfig}>
        <SettingsPageContainer>
          {/* <SettingsServiceCenterSectorAboutForm activeFinancialClosing={activeFinancialClosing} /> */}
          <SettingsFinancialClosingForm
            activeFinancialClosing={activeFinancialClosing}
          />
        </SettingsPageContainer>
      </FormProvider>
    </SubMenuTopBarContainer>
  );
};
