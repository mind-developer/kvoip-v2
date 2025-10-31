/* eslint-disable react/jsx-props-no-spreading */
import { type WhatsappIntegration } from '@/chat/call-center/types/WhatsappIntegration';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import {
  ServiceLevelForm,
  SettingsServiceCenterSLAFormSchema,
} from '@/settings/service-center/service-level/components/ServiceLevelForm';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { t } from '@lingui/core/macro';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { z } from 'zod';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const DELETE_SLA_MODAL_ID = 'delete-sla-modal';

const editSlaFormSchema = SettingsServiceCenterSLAFormSchema.extend({
  sla: z.number().int(),
});

type SettingsEditSlaSchemaValues = z.infer<typeof editSlaFormSchema>;

export const SettingsServiceCenterEditServiceLevel = () => {
  // const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueErrorSnackBar, enqueueInfoSnackBar } = useSnackBar();
  const { openModal } = useModal();

  const slaPagePath = getSettingsPath(SettingsPath.ServiceCenterServiceLevel);

  const whatsappIntegrations = useFindManyRecords<
    WhatsappIntegration & { __typename: string }
  >({
    objectNameSingular: 'whatsappIntegration',
  }).records;

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.WhatsappIntegration,
  });
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

  const handleDelete = async () => {
    if (!activeSla?.id) return;

    try {
      await deleteOneRecord(activeSla.id);

      enqueueInfoSnackBar({
        message: t`Service level deleted successfully`,
      });
      navigate(slaPagePath);
    } catch (err) {
      enqueueErrorSnackBar({
        message: (err as Error).message,
      });
    }
  };

  return (
    <>
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
            <Section>
              <H2Title
                title={t`Danger zone`}
                description={t`Delete this service level`}
              />
              <Button
                accent="danger"
                onClick={() => openModal(DELETE_SLA_MODAL_ID)}
                variant="secondary"
                size="small"
                title={t`Delete service level`}
              />
            </Section>
          </SettingsPageContainer>
        </FormProvider>
      </SubMenuTopBarContainer>
      <ConfirmationModal
        confirmationPlaceholder={t`yes`}
        confirmationValue={t`yes`}
        modalId={DELETE_SLA_MODAL_ID}
        title={t`Delete service level`}
        subtitle={t`Please type "yes" to confirm you want to delete this service level.`}
        onConfirmClick={handleDelete}
        confirmButtonText={t`Delete`}
      />
    </>
  );
};
