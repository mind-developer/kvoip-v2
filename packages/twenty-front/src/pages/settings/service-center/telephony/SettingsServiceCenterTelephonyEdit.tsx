/* @kvoip-woulz proprietary */
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  SettingsServiceCenterTelephonyAboutForm,
  SettingsServiceCenterTelephonyFormSchema,
} from '@/settings/service-center/telephony/components/forms/SettingsServiceCenterTelephonyForm';
import { useDeleteTelephony } from '@/settings/service-center/telephony/hooks/useDeleteTelephony';
import { useFindAllTelephonys } from '@/settings/service-center/telephony/hooks/useFindAllTelephony';
import { useUpdateTelephony } from '@/settings/service-center/telephony/hooks/useUpdateTelephony';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const DELETE_TELEPHONY_MODAL_ID = 'delete-telephony-modal';

const editTelephonyFormSchema = z
  .object({})
  .merge(SettingsServiceCenterTelephonyFormSchema._def.schema);

type SettingsEditTelephonySchemaValues = z.infer<
  typeof editTelephonyFormSchema
>;

export const SettingsTelephonyEdit = () => {
  const navigate = useNavigate();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { openModal } = useModal();

  const { telephonys } = useFindAllTelephonys();
  const { editTelephony } = useUpdateTelephony();
  const { deleteTelephony } = useDeleteTelephony();

  const { telephonySlug } = useParams<{ telephonySlug?: string }>();

  const activeTelephony = telephonys.find(
    (telephony) => telephony.id === telephonySlug,
  );

  const settingsServiceCenterTelephonyPagePath = getSettingsPath(
    SettingsPath.ServiceCenterTelephony,
  );

  const formConfig = useForm<SettingsEditTelephonySchemaValues>({
    mode: 'onTouched',
    resolver: zodResolver(editTelephonyFormSchema),
  });

  const { isValid, isSubmitting } = formConfig.formState;

  const canSave = isValid && !isSubmitting;

  const onSave = async (formValues: SettingsEditTelephonySchemaValues) => {
    try {
      if (!activeTelephony?.id) return;

      const updatedValues = {
        memberId: formValues.memberId,
        numberExtension: formValues.extensionNumber,
        type: formValues.type,
        extensionName: formValues.extensionName,
        areaCode: formValues.areaCode,
        blockExtension: formValues.blockExtension,
        callerExternalID: formValues.callerExternalID,
        dialingPlan: formValues.dialingPlan,
        emailForMailbox: formValues.emailForMailbox || '',
        enableMailbox: formValues.enableMailbox,
        fowardAllCalls: formValues.fowardAllCalls || '',
        listenToCalls: formValues.listenToCalls,
        pullCalls: formValues.pullCalls,
        recordCalls: formValues.recordCalls,
        SIPPassword: formValues.SIPPassword,
        destinyMailboxAllCallsOrOffline:
          formValues.destinyMailBoxAllCallsOrOffline,
        destinyMailboxBusy: formValues.destinyMailBoxBusy,
        extensionAllCallsOrOffline: formValues.extensionAllCallsOrOffline || '',
        extensionBusy: formValues.extensionBusy || '',
        extensionGroup: formValues.extensionGroup || '',
        externalNumberAllCallsOrOffline:
          formValues.externalNumberAllCallsOrOffline,
        externalNumberBusy: formValues.externalNumberBusy,
        fowardBusyNotAvailable: formValues.fowardBusyNotAvailable || '',
        fowardOfflineWithoutService:
          formValues.fowardOfflineWithoutService || '',
        advancedFowarding1: formValues.advancedFowarding1 || '',
        advancedFowarding2: formValues.advancedFowarding2 || '',
        advancedFowarding3: formValues.advancedFowarding3 || '',
        advancedFowarding4: formValues.advancedFowarding4 || '',
        advancedFowarding5: formValues.advancedFowarding5 || '',
        advancedFowarding1Value: formValues.advancedFowarding1Value || '',
        advancedFowarding2Value: formValues.advancedFowarding2Value || '',
        advancedFowarding3Value: formValues.advancedFowarding3Value || '',
        advancedFowarding4Value: formValues.advancedFowarding4Value || '',
        advancedFowarding5Value: formValues.advancedFowarding5Value || '',
      };

      await editTelephony(telephonySlug ?? '', updatedValues);

      navigate(settingsServiceCenterTelephonyPagePath);
    } catch (err) {
      // TODO: Add proper error message
      enqueueErrorSnackBar({
        message: (err as Error).message,
      });
    }
  };

  const handleDelete = async () => {
    if (!activeTelephony?.id) return;

    try {
      await deleteTelephony(activeTelephony.id);
      navigate(settingsServiceCenterTelephonyPagePath);
    } catch (err) {
      enqueueErrorSnackBar({
        message: (err as Error).message,
      });
    }
  };

  return (
    <>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <FormProvider {...formConfig}>
        <SubMenuTopBarContainer links={[]} title="Settings">
          <SettingsPageContainer>
            <SettingsHeaderContainer>
              <Breadcrumb
                links={[
                  {
                    children: 'Telephony',
                    href: settingsServiceCenterTelephonyPagePath,
                  },
                  { children: 'Edit' },
                ]}
              />
              <SaveAndCancelButtons
                isSaveDisabled={!canSave}
                isCancelDisabled={isSubmitting}
                onCancel={() =>
                  navigate(settingsServiceCenterTelephonyPagePath)
                }
                onSave={formConfig.handleSubmit(onSave)}
              />
            </SettingsHeaderContainer>
            <SettingsServiceCenterTelephonyAboutForm
              activeTelephony={activeTelephony}
            />
            <Section>
              <H2Title
                title={t`Danger zone`}
                description={t`Delete this telephony integration`}
              />
              <Button
                accent="danger"
                onClick={() => openModal(DELETE_TELEPHONY_MODAL_ID)}
                variant="secondary"
                size="small"
                title={t`Delete telephony`}
              />
            </Section>
          </SettingsPageContainer>
        </SubMenuTopBarContainer>
      </FormProvider>
      <ConfirmationModal
        confirmationPlaceholder={t`yes`}
        confirmationValue={t`yes`}
        modalId={DELETE_TELEPHONY_MODAL_ID}
        title={t`Delete telephony integration`}
        subtitle={t`Please type "yes" to confirm you want to delete this telephony integration.`}
        onConfirmClick={handleDelete}
        confirmButtonText={t`Delete`}
      />
    </>
  );
};
