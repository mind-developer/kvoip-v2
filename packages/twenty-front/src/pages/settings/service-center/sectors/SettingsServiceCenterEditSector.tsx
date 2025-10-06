/* eslint-disable react/jsx-props-no-spreading */
import { zodResolver } from '@hookform/resolvers/zod';
import pick from 'lodash.pick';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  SettingsSectorFormSchema,
  SettingsServiceCenterSectorAboutForm,
} from '@/settings/service-center/sectors/components/SettingsServiceCenterSectorAboutForm';
import { Sector } from '@/settings/service-center/sectors/types/Sector';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { t } from '@lingui/core/macro';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const DELETE_SECTOR_MODAL_ID = 'delete-sector-modal';

const editSectorFormSchema = z
  .object({})
  .merge(SettingsSectorFormSchema)
  .extend({
    id: z.string(),
  });

type SettingsEditSectorSchemaValues = z.infer<typeof editSectorFormSchema>;

export const SettingsServiceCenterEditSector = () => {
  // const { t } = useTranslation();
  const navigate = useNavigate();
  const { enqueueErrorSnackBar, enqueueInfoSnackBar } = useSnackBar();
  const { openModal } = useModal();

  const { records: sectors } = useFindManyRecords<
    Sector & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Sector,
  });
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Sector,
  });
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Sector,
  });

  const { sectorSlug } = useParams<{ sectorSlug?: string }>();

  const activeSector = sectors.find((sector) => sector.id === sectorSlug);

  const settingsSectorsPagePath = getSettingsPath(
    SettingsPath.ServiceCenterSectors,
  );

  const formConfig = useForm<SettingsEditSectorSchemaValues>({
    mode: 'onTouched',
    resolver: zodResolver(editSectorFormSchema),
  });

  const { isValid, isSubmitting } = formConfig.formState;
  const canSave = isValid && !isSubmitting;

  const onSave = async (formValues: SettingsEditSectorSchemaValues) => {
    const dirtyFieldsKeys = Object.keys(
      formConfig.formState.dirtyFields,
    ) as (keyof SettingsEditSectorSchemaValues)[];
    try {
      // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
      if (activeSector?.id) {
        const updatedValues = {
          ...pick(formValues, dirtyFieldsKeys),
          id: formValues.id,
          icon: formValues.icon || activeSector.icon,
          name: formValues.name || activeSector.name,
        };

        await updateOneRecord({
          idToUpdate: updatedValues.id,
          updateOneRecordInput: updatedValues,
        });

        navigate(settingsSectorsPagePath);
      }
    } catch (err) {
      // TODO: Add proper error message
      enqueueErrorSnackBar({
        message: (err as Error).message,
      });
    }
  };

  const handleDelete = async () => {
    if (!activeSector?.id) return;

    try {
      await deleteOneRecord(activeSector.id);

      enqueueInfoSnackBar({
        message: t`Sector deleted successfully`,
      });
      navigate(settingsSectorsPagePath);
    } catch (err) {
      enqueueErrorSnackBar({
        message: (err as Error).message,
      });
    }
  };

  return (
    <>
      <SubMenuTopBarContainer
        title={'Sectors'}
        actionButton={
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            isCancelDisabled={isSubmitting}
            onCancel={() => navigate(settingsSectorsPagePath)}
            onSave={formConfig.handleSubmit(onSave)}
          />
        }
        links={[
          {
            href: getSettingsPath(SettingsPath.ServiceCenter),
            children: 'Service Center',
          },
          {
            href: getSettingsPath(SettingsPath.ServiceCenterSectors),
            children: 'Sectors',
          },
          {
            children: 'Edit',
          },
        ]}
      >
        <FormProvider {...formConfig}>
          <SettingsPageContainer>
            <Section>
              <H2Title
                title={t`About`}
                description={t`Define this sector's properties.`}
              />
              <SettingsServiceCenterSectorAboutForm
                activeSector={activeSector}
              />
            </Section>
            <Section>
              <H2Title
                title={t`Danger zone`}
                description={t`Delete this sector`}
              />
              <Button
                accent="danger"
                onClick={() => openModal(DELETE_SECTOR_MODAL_ID)}
                variant="secondary"
                size="small"
                title={t`Delete sector`}
              />
            </Section>
          </SettingsPageContainer>
        </FormProvider>
      </SubMenuTopBarContainer>
      <ConfirmationModal
        modalId={DELETE_SECTOR_MODAL_ID}
        title={t`Delete sector`}
        subtitle={t`Delete this sector?`}
        onConfirmClick={handleDelete}
        confirmButtonText={t`Delete`}
      />
    </>
  );
};
