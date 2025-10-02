/* eslint-disable react/jsx-props-no-spreading */
import { useNavigate } from 'react-router-dom';

import { WhatsappIntegration } from '@/chat/call-center/types/WhatsappIntegration';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Inbox } from '@/settings/service-center/inboxes/types/InboxType';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { H2Title, IconX, Label } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { SelectOption } from '../../../../../twenty-ui/dist/input/types/SelectOption';

const StyledFormContainer = styled.div`
  display: flex;
  /* align-items: flex-end; */
  gap: ${({ theme }) => theme.spacing(1)};
`;
const StyledLabel = styled(Label)`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;
export const SettingsServiceCenterNewInbox = () => {
  const settingsServiceCenterInboxesPagePath = getSettingsPath(
    SettingsPath.ServiceCenterInboxes,
  );
  const navigate = useNavigate();
  const { enqueueInfoSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  const { records: existingInboxes } = useFindManyRecords<Inbox & { __typename: string }>({
    objectNameSingular: CoreObjectNameSingular.Inbox,
  });

  const { createOneRecord } = useCreateOneRecord<Inbox & { __typename: string }>({
    objectNameSingular: CoreObjectNameSingular.Inbox,
  });
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('IconInbox');
  const [selectedWhatsappIntegrationId, setSelectedWhatsappIntegrationId] =
    useState<string | null>(null);

  const { records: whatsappIntegrations } = useFindManyRecords<
    WhatsappIntegration & { __typename: string }
  >({ objectNameSingular: CoreObjectNameSingular.WhatsappIntegration });
  const whatsappIntegrationOptions = whatsappIntegrations.map(
    (w) =>
      ({
        label: !!w.inboxId
          ? t`${w.name} (Already in use by another inbox)`
          : w.name,
        value: w.id,
        disabled: true,
        Icon: IconX,
      }) as SelectOption,
  );

  const { updateOneRecord: assignToWhatsappIntegration } = useUpdateOneRecord<
    WhatsappIntegration & { __typename: string }
  >({ objectNameSingular: CoreObjectNameSingular.WhatsappIntegration });

  const onSave = async () => {
    if (
      existingInboxes.some(
        (inbox) => inbox.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      enqueueErrorSnackBar({
        message: t`An inbox with this name already exists`,
      });
      return;
    }
    const createdInbox = await createOneRecord({ name, icon: selectedIcon });
    if (createdInbox.id) {
      if (selectedWhatsappIntegrationId)
        assignToWhatsappIntegration({
          idToUpdate: selectedWhatsappIntegrationId,
          updateOneRecordInput: { inboxId: createdInbox.id },
        });
      navigate(getSettingsPath(SettingsPath.ServiceCenterInboxes));
      enqueueInfoSnackBar({
        message: t`Inbox ${createdInbox.name} created`,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title={'Create inbox'}
      actionButton={
        <SaveAndCancelButtons
          isSaveDisabled={name.length < 4}
          onCancel={() => navigate(settingsServiceCenterInboxesPagePath)}
          onSave={onSave}
        />
      }
      links={[
        {
          children: 'Inboxes',
          href: getSettingsPath(SettingsPath.ServiceCenterInboxes),
        },
        { children: 'New inbox' },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <Section>
            <H2Title
              title={t`About`}
              description={t`Define this inbox's properties. You can assign this inbox to multiple agents after you've created it. They will be able to view all of its incoming messages.`}
            />
          </Section>
          <StyledFormContainer>
            <div>
              <StyledLabel>{t`Icon`}</StyledLabel>
              <IconPicker
                selectedIconKey={selectedIcon}
                onChange={(i) => setSelectedIcon(i.iconKey)}
              />
            </div>
            <TextInput
              value={name}
              onChange={(s) => setName(s)}
              label={t`Name`}
            />
            <FormSelectFieldInput
              defaultValue=""
              onChange={(v) => {
                if (whatsappIntegrationOptions.find((v) => v.value)?.disabled)
                  return;
                setSelectedWhatsappIntegrationId(v);
              }}
              label={t`WhatsApp Integration`}
              options={whatsappIntegrationOptions}
            />
          </StyledFormContainer>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
