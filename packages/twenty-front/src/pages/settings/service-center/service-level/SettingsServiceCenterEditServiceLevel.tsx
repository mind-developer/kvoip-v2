/* eslint-disable react/jsx-props-no-spreading */
import { WhatsappIntegration } from '@/chat/call-center/types/WhatsappIntegration';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  ServiceLevelForm,
  SettingsServiceCenterSLAFormSchema,
} from '@/settings/service-center/service-level/components/ServiceLevelForm';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const editSlaFormSchema = SettingsServiceCenterSLAFormSchema.extend({
  sla: z.number().int(),
});

type SettingsEditSlaSchemaValues = z.infer<typeof editSlaFormSchema>;

export const SettingsServiceCenterEditServiceLevel = () => {
  // const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueErrorSnackBar } = useSnackBar();

  const slaPagePath = getSettingsPath(SettingsPath.ServiceCenterServiceLevel);

  const whatsappIntegrations = useFindManyRecords<
    WhatsappIntegration & { __typename: string }
  >({
    objectNameSingular: 'whatsappIntegration',
  }).records;
  // const { messengerIntegrations } = useGetAllMessengerIntegrations();

  // const { updateMessengerSla } = useUpdateMessengerServiceLevel();

  const { slaSlug } = useParams<{ slaSlug?: string }>();

  const activeSla = whatsappIntegrations?.find(
    (waIntegration) => waIntegration.id === slaSlug,
  );
  // ) ||
  // messengerIntegrations?.find(
  //   (fbIntegration) => fbIntegration.id === slaSlug,
  // );

  // const isWhatsapp = !!whatsappIntegrations?.find(
  //   (waIntegration) => waIntegration.id === slaSlug,
  // );

  const formConfig = useForm<SettingsEditSlaSchemaValues>({
    mode: 'onTouched',
    resolver: zodResolver(editSlaFormSchema),
    defaultValues: {
      sla: activeSla?.sla,
    },
  });

  const { isValid, isSubmitting } = formConfig.formState;
  const canSave = isValid && !isSubmitting;

  const onSave = async (formValues: SettingsEditSlaSchemaValues) => {
    try {
      if (!activeSla) {
        return;
      }

      // await updateSla(activeSla.id, formValues.sla);

      navigate(slaPagePath);
    } catch (err) {
      // TODO: Add proper error message
      enqueueErrorSnackBar({
        message: (err as Error).message,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title={''}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={!canSave}
          isCancelDisabled={isSubmitting}
          onCancel={() => navigate(slaPagePath)}
          onSave={formConfig.handleSubmit(onSave)}
        />
      }
      links={[
        {
          children: 'Edit',
          href: `${slaPagePath}`,
        },
        { children: `${slaSlug}` },
      ]}
    >
      <FormProvider {...formConfig}>
        <SettingsPageContainer>
          <ServiceLevelForm activeSla={activeSla} />
        </SettingsPageContainer>
      </FormProvider>
    </SubMenuTopBarContainer>
  );
};
