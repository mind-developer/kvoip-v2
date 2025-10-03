import { WhatsappIntegration } from '@/chat/call-center/types/WhatsappIntegration';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FormSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormSelectFieldInput';
import { useNewInboxForm } from '@/settings/service-center/inboxes/hooks/useNewInboxForm';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Controller, FormProvider } from 'react-hook-form';
import { H2Title, IconX, Label } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';

const StyledFormContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledLabel = styled(Label)`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsServiceCenterNewInboxForm = () => {
  const { t } = useLingui();
  const { form } = useNewInboxForm();

  const { records: whatsappIntegrations } = useFindManyRecords<
    WhatsappIntegration & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.WhatsappIntegration,
    recordGqlFields: {
      id: true,
      name: true,
      phoneId: true,
      businessAccountId: true,
      accessToken: true,
      appId: true,
      appKey: true,
      disabled: true,
      sla: true,
      apiType: true,
      inbox: true,
    },
  });

  const whatsappIntegrationOptions: SelectOption[] = whatsappIntegrations.map(
    (w) => {
      const hasInbox = w.inbox && w.inbox.length > 0;
      return {
        label: hasInbox
          ? t`${w.name} (Already in use by another inbox)`
          : w.name,
        value: w.id,
        disabled: hasInbox,
        Icon: hasInbox ? IconX : undefined,
      };
    },
  );

  return (
    <FormProvider {...form}>
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
            <Controller
              name="icon"
              control={form.control}
              render={({ field }) => (
                <IconPicker
                  selectedIconKey={field.value}
                  onChange={(i) => field.onChange(i.iconKey)}
                />
              )}
            />
          </div>
          <Controller
            name="name"
            control={form.control}
            render={({ field }) => (
              <TextInput
                value={field.value}
                onChange={field.onChange}
                label={t`Name`}
              />
            )}
          />
          <Controller
            name="whatsappIntegrationId"
            control={form.control}
            render={({ field }) => (
              <FormSelectFieldInput
                defaultValue=""
                onChange={(v) => {
                  const selectedOption = whatsappIntegrationOptions.find(
                    (option) => option.value === v,
                  );
                  if (selectedOption?.disabled) return;
                  field.onChange(v || null);
                }}
                label={t`WhatsApp Integration`}
                options={whatsappIntegrationOptions}
              />
            )}
          />
        </StyledFormContainer>
      </Section>
    </FormProvider>
  );
};
