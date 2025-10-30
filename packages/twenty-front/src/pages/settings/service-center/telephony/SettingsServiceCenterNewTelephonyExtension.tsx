/* @kvoip-woulz proprietary */
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  SettingsServiceCenterTelephonyAboutForm,
  SettingsServiceCenterTelephonyFormSchema,
} from '@/settings/service-center/telephony/components/forms/SettingsServiceCenterTelephonyForm';
import { useCreateTelephony } from '@/settings/service-center/telephony/hooks/useCreateTelephony';
import { CreateTelephonyInput } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import {
  checkPassword,
  generatePassword,
} from '@/settings/service-center/telephony/utils/password';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Breadcrumb } from '@/ui/navigation/bread-crumb/components/Breadcrumb';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
// eslint-disable-next-line import/no-duplicates
import { Button } from 'twenty-ui/input';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { IconPlus } from '@tabler/icons-react';

type SettingsNewTelephonySchemaValues = z.infer<
  typeof SettingsServiceCenterTelephonyFormSchema
>;

export const SettingsServiceCenterNewTelephonyExtension = () => {
  const navigate = useNavigate();
  const { t } = useLingui();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { createTelephony, data } = useCreateTelephony();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const formConfig = useForm<SettingsNewTelephonySchemaValues>({
    mode: 'onTouched',
    resolver: zodResolver(SettingsServiceCenterTelephonyFormSchema),
    defaultValues: {
      memberId: '',
      extensionNumber: '',
      areaCode: '',
      blockExtension: false,
      dialingPlan: '',
      enableMailbox: false,
      emailForMailbox: '',
      extensionGroup: '',
      fowardAllCalls: '',
      fowardBusyNotAvailable: '',
      fowardOfflineWithoutService: '',
      listenToCalls: false,
      pullCalls: '',
      recordCalls: false,
      SIPPassword: generatePassword(),
      callerExternalID: '',
      extensionAllCallsOrOffline: '',
      extensionName: '',
      type: '1',
      externalNumberAllCallsOrOffline: '',
      externalNumberBusy: '',
      destinyMailBoxAllCallsOrOffline: '',
      destinyMailBoxBusy: '',
    },
  });

  const { isValid, isSubmitting } = formConfig.formState;
  const canSave = isValid && !isSubmitting;

  const settingsServiceCenterTelephonyPagePath = getSettingsPath(
    SettingsPath.ServiceCenterTelephony,
  );

  const onSave = async (formValue: SettingsNewTelephonySchemaValues) => {
    try {
      const telephonyData: CreateTelephonyInput = {
        memberId: formValue.memberId,
        numberExtension: formValue.extensionNumber,
        areaCode: formValue.areaCode,
        blockExtension: formValue.blockExtension,
        dialingPlan: formValue.dialingPlan,
        enableMailbox: formValue.enableMailbox,
        emailForMailbox: formValue.emailForMailbox || '',
        // extensionGroup: formValue.extensionGroup || '',
        extensionGroup: '', // Valor padrão - campo removido do formulário
        fowardAllCalls: formValue.fowardAllCalls || '',
        fowardBusyNotAvailable: formValue.fowardBusyNotAvailable || '',
        fowardOfflineWithoutService:
          formValue.fowardOfflineWithoutService || '',
        listenToCalls: formValue.listenToCalls,
        pullCalls: formValue.pullCalls,
        recordCalls: formValue.recordCalls,
        SIPPassword: formValue.SIPPassword,
        callerExternalID: formValue.callerExternalID,
        extensionAllCallsOrOffline: formValue.extensionAllCallsOrOffline || '',
        extensionName: formValue.extensionName,
        type: formValue.type,
        externalNumberAllCallsOrOffline:
          formValue.externalNumberAllCallsOrOffline || '',
        externalNumberBusy: formValue.externalNumberBusy || '',
        extensionBusy: formValue.extensionBusy || '',
        destinyMailboxAllCallsOrOffline:
          formValue.destinyMailBoxAllCallsOrOffline || '',
        destinyMailboxBusy: formValue.destinyMailBoxBusy || '',
        advancedFowarding1: formValue.advancedFowarding1 || '',
        advancedFowarding2: formValue.advancedFowarding2 || '',
        advancedFowarding3: formValue.advancedFowarding3 || '',
        advancedFowarding4: formValue.advancedFowarding4 || '',
        advancedFowarding5: formValue.advancedFowarding5 || '',
        advancedFowarding1Value: formValue.advancedFowarding1Value || '',
        advancedFowarding2Value: formValue.advancedFowarding2Value || '',
        advancedFowarding3Value: formValue.advancedFowarding3Value || '',
        advancedFowarding4Value: formValue.advancedFowarding4Value || '',
        advancedFowarding5Value: formValue.advancedFowarding5Value || '',
      };

      if (!checkPassword(telephonyData.SIPPassword))
        throw new Error(
          'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character',
        );

      await createTelephony(telephonyData);
      
      if (data) {
        navigate(settingsServiceCenterTelephonyPagePath);
      }
    } catch (err) {
      // TODO: Add proper error message
      enqueueErrorSnackBar({
        message: (err as Error).message,
      });
    }
  };

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <FormProvider {...formConfig}>

      <SubMenuTopBarContainer
        title={t`Telephony`}
        actionButton={
          <Button
            Icon={IconPlus}
            title={t`Add Telephony`}
            accent="blue"
            size="small"
            onClick={formConfig.handleSubmit(onSave)}
            disabled={!canSave}
          />
        }
        links={[
          {
            children: t`Extensions`,
            href: settingsServiceCenterTelephonyPagePath,
          },
          { children: t`New` },
        ]}
      >
        <SettingsPageContainer>
          <SettingsServiceCenterTelephonyAboutForm />
        </SettingsPageContainer>
      </SubMenuTopBarContainer> 
    </FormProvider>
  );
};
