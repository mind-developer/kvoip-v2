import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FormMultiSelectFieldInput } from '@/object-record/record-field/ui/form-types/components/FormMultiSelectFieldInput';
import { Agent } from '@/settings/service-center/agents/types/Agent';
import { Select } from '@/ui/input/components/Select';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import styled from '@emotion/styled';
import { IconBadge, IconUsers } from '@tabler/icons-react';
import { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { H2Title, useIcons } from 'twenty-ui/display';
import { Toggle } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';

import { z } from 'zod';
import { Inbox, Sector } from '~/generated/graphql';

const agentMetadataFormSchema = z.object({
  isAdmin: z.boolean(),
  isActive: z.boolean(),
  sectorId: z.string(),
});

export type SettingsServiceCenterAgentFormSchemaValues = z.infer<
  typeof agentMetadataFormSchema
>;

type SettingsServiceCenterAgentAboutFormProps = {
  disabled?: boolean;
  disableNameEdit?: boolean;
  activeAgent?: Agent;
};

const StyledSection = styled(Section)`
  display: flex;
  gap: 4px;
`;

export const SettingsServiceCenterAgentAboutForm = ({
  disabled,
  activeAgent,
}: SettingsServiceCenterAgentAboutFormProps) => {
  const { control, reset } =
    useFormContext<SettingsServiceCenterAgentFormSchemaValues>();
  // const { t } = useTranslation();
  const { getIcon } = useIcons();

  const { records: agents } = useFindManyRecords<Agent>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });
  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });
  const { records: sectors } = useFindManyRecords<Sector>({
    objectNameSingular: CoreObjectNameSingular.Sector,
  });
  const { records: inboxes } = useFindManyRecords<Inbox>({
    objectNameSingular: CoreObjectNameSingular.Inbox,
  });

  const whatsappIntegrations = useFindManyRecords({
    objectNameSingular: 'whatsappIntegration',
  }).records;

  const Icon = getIcon('IconIdBadge2');

  const membersWithAgent =
    agents.length > 0 ? agents.map((agent) => agent.workspaceMember?.id) : [];
  const assignableAgents = workspaceMembers.filter(
    (workspaceMember) => !membersWithAgent.includes(workspaceMember.id),
  );
  const membersOptions = workspaceMembers?.map((member) => ({
    Icon: IconUsers,
    label: member.name.firstName + ' ' + member.name.lastName,
    value: member.id,
  }));

  const sectorsOptions =
    sectors?.map((sector) => ({
      Icon: IconBadge,
      label: sector.name,
      value: sector.id,
    })) ?? [];

  const inboxesOptions =
    inboxes?.map((inbox) => {
      const isWhatsapp = inbox.whatsappIntegration;
      const IconName = isWhatsapp ? 'IconBrandWhatsapp' : 'IconBrandMessenger';

      return {
        Icon: getIcon(IconName),
        label: 'New integration',
        value: inbox.id,
      };
    }) ?? [];

  useEffect(() => {
    if (activeAgent) {
      reset({
        isAdmin: activeAgent.isAdmin ?? false,
        sectorId: activeAgent.sectors?.map((sector) => sector.id) ?? [],
      });
    }
  }, [activeAgent, reset]);

  const selectedSectors =
    activeAgent?.sectors?.map((sector) => sector.id) ?? [];
  const selectedInboxes = activeAgent?.inboxes?.map((inbox) => inbox.id) ?? [];

  return (
    <>
      <StyledSection>
        <Icon />
        <H2Title
          title={'Admin permissions'}
          adornment={
            <Controller
              control={control}
              name="isAdmin"
              render={({ field: { onChange, value } }) => (
                <Toggle value={value} onChange={onChange} />
              )}
            />
          }
          description={
            'This agent will be able to view all the chats in the service center'
          }
        />
      </StyledSection>
      <Section>
        <Controller
          control={control}
          name="memberId"
          render={({ field }) => (
            <Select
              disabled={disabled}
              dropdownId="member"
              label={'Member'}
              options={[
                {
                  label: 'Choose a member',
                  value: '',
                },
                ...membersOptions,
              ]}
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
              }}
            />
          )}
        />
      </Section>
      <Section>
        <Controller
          name="sectorIds"
          control={control}
          render={({ field: { onChange } }) => {
            return (
              <FormMultiSelectFieldInput
                label="Select Sectors"
                options={sectorsOptions}
                defaultValue={selectedSectors}
                onChange={onChange}
              />
            );
          }}
        />
      </Section>
      <Section>
        <Controller
          name="inboxesIds"
          control={control}
          render={({ field: { onChange } }) => (
            <FormMultiSelectFieldInput
              label="Select Inboxes"
              options={inboxesOptions}
              defaultValue={selectedInboxes}
              onChange={onChange}
            />
          )}
        />
      </Section>
    </>
  );
};
