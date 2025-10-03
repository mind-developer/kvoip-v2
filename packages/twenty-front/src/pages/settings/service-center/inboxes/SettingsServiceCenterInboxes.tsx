import { SettingsPath } from '@/types/SettingsPath';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { Inbox } from '@/settings/service-center/inboxes/types/InboxType';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconArrowUpRight } from '@tabler/icons-react';
import { useState } from 'react';
import { Chip, ChipAccent } from 'twenty-ui/components';
import {
  H2Title,
  IconInbox,
  IconPlus,
  IconSearch,
  useIcons,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledChip = styled(Chip)`
  margin-bottom: ${({ theme }) => theme.spacing(4)} !important;
  border: 1px solid ${({ theme }) => theme.background.quaternary};
  padding: ${({ theme }) => theme.spacing(2, 4)};
`;

const StyledSettingsCard = styled(SettingsCard)`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;
const StyledTextInput = styled(TextInput)`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  width: 100%;
`;

export const SettingsServiceCenterInboxes = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const { records: inboxes } = useFindManyRecords<
    Inbox & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Inbox,
  });

  const [filteredInboxes, setFilteredInboxes] = useState<Inbox[]>(inboxes);

  function filterInboxes({ name }: { name: string }) {
    const searchFiltered = inboxes.filter((inbox) =>
      inbox.name.toLowerCase().includes(name.toLowerCase()),
    );
    const filtered = searchFiltered;
    return filtered;
  }
  const [searchByInboxName, setSearchByInboxName] = useState('');

  return (
    <SubMenuTopBarContainer
      title={`Inboxes`}
      actionButton={
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.ServiceCenterNewInbox)}
        >
          <Button
            Icon={IconPlus}
            title={t`Add inbox`}
            accent="blue"
            size="small"
          />
        </UndecoratedLink>
      }
      links={[
        {
          children: t`Service Center`,
          href: getSettingsPath(SettingsPath.ServiceCenter),
        },
        { children: t`Inboxes` },
      ]}
    >
      <SettingsPageContainer>
        <div>
          <H2Title
            title={t`Manage inboxes`}
            description={t`Inboxes channel messages from multiple chat integration providers at once, such as WhatsApp and Telegram. Assigned agents will be able to view and reply to these messages. You can set up chat integrations on the Integrations tab.`}
          />
          <UndecoratedLink to={getSettingsPath(SettingsPath.Integrations)}>
            <StyledChip
              // variant={ChipVariant.Rounded}
              accent={ChipAccent.TextPrimary}
              leftComponent={<IconArrowUpRight size={12} />}
              label={t`Integrations`}
            />
          </UndecoratedLink>
          <StyledTextInput
            onChange={(s) => {
              setFilteredInboxes(filterInboxes({ name: s }));
              setSearchByInboxName(s);
            }}
            value={searchByInboxName}
            placeholder="Search for an inbox..."
            LeftIcon={IconSearch}
          />
          {filteredInboxes.map((inbox) => {
            return (
              <StyledSettingsCard
                Icon={<IconInbox size={18} />}
                title={inbox.name}
              />
            );
          })}
        </div>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
