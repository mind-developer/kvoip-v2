import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { type Agent } from '@/settings/service-center/agents/types/Agent';
import { type Sector } from '@/settings/service-center/sectors/types/Sector';
import { SettingsPath } from '@/types/SettingsPath';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useNavigate } from 'react-router-dom';
import { Avatar, H2Title, IconPlus, IconSearch } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import {
  AnimatedPlaceholder,
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
  Section,
} from 'twenty-ui/layout';
import { UndecoratedLink } from 'twenty-ui/navigation';
import { type WorkspaceMember } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

type WorkspaceMemberWithAgent = WorkspaceMember & {
  agent: Agent | null;
  agentId: string | null;
};

const StyledSettingsCard = styled(SettingsCard)`
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledTextInput = styled(TextInput)`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  width: 100%;
`;

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const AgentsSkeletonLoader = () => {
  const theme = useTheme();
  const skeletonItems = Array.from({ length: 3 }).map((_, index) => ({
    id: `skeleton-agent-${index}`,
  }));

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledSkeletonContainer>
        {skeletonItems.map(({ id }) => (
          <Skeleton
            key={id}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.xl}
            width="100%"
          />
        ))}
      </StyledSkeletonContainer>
    </SkeletonTheme>
  );
};

export const SettingsServiceCenterAgents = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const navigate = useNavigate();

  const { records: workspaceMembers, loading: workspaceMembersLoading } =
    useFindManyRecords<WorkspaceMemberWithAgent & { __typename: string }>({
      objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
      recordGqlFields: {
        id: true,
        name: true,
        agent: true,
        agentId: true,
        avatarUrl: true,
      },
    });

  const { records: sectors, loading: sectorsLoading } = useFindManyRecords<
    Sector & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Sector,
  });

  const isLoading = workspaceMembersLoading || sectorsLoading;
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (isLoading) {
      timeoutId = setTimeout(() => {
        setShowSkeleton(true);
      }, 500);
    } else {
      setShowSkeleton(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isLoading]);

  const workspaceMembersWithAgent = workspaceMembers.filter(
    (workspaceMember) => workspaceMember.agent !== null,
  );

  const [filteredAgents, setFilteredAgents] = useState<
    WorkspaceMemberWithAgent[]
  >(workspaceMembersWithAgent);

  function filterAgents(name: string): WorkspaceMemberWithAgent[] {
    const searchFiltered = workspaceMembersWithAgent.filter((member) => {
      const nameConcat = member.name.firstName + ' ' + member.name.lastName;
      return nameConcat.toLowerCase().includes(name.toLowerCase());
    });
    return searchFiltered;
  }
  const [searchByWorkspaceMemberName, setSearchByWorkspaceMemberName] =
    useState('');

  function getAgentStatus(agent: Agent | null): string {
    if (!agent) return '';
    const sector = sectors.find((sector) => sector.id === agent?.sectorId);
    return sector?.name || t`No sector assigned`;
  }

  return (
    <SubMenuTopBarContainer
      title={t`Agents`}
      actionButton={
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.ServiceCenterNewAgent)}
        >
          <Button
            Icon={IconPlus}
            title={t`Add agent`}
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
        { children: t`Agents` },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title
            title={t`Manage agents`}
            description={t`Agents can be assigned to sectors`}
          />
          <StyledTextInput
            placeholder={t`Search for an agent...`}
            value={searchByWorkspaceMemberName}
            LeftIcon={IconSearch}
            onChange={(s) => {
              setFilteredAgents(filterAgents(s));
              setSearchByWorkspaceMemberName(s);
            }}
          />
          {showSkeleton ? (
            <AgentsSkeletonLoader />
          ) : (
            filteredAgents.map((member) => {
              return (
                <StyledSettingsCard
                  key={member.id}
                  Status={getAgentStatus(member.agent)}
                  Icon={
                    <Avatar
                      placeholder={member.name.firstName}
                      avatarUrl={member.avatarUrl ?? undefined}
                      type="rounded"
                    />
                  }
                  title={member.name.firstName + ' ' + member.name.lastName}
                  onClick={() => {
                    navigate(
                      getSettingsPath(SettingsPath.ServiceCenterEditAgent, {
                        agentSlug: member.agentId,
                      }),
                    );
                  }}
                />
              );
            })
          )}
          {!showSkeleton && filteredAgents.length === 0 && (
            <Section>
              <div style={{ marginTop: theme.spacing(10) }}>
                <AnimatedPlaceholderEmptyContainer>
                  <AnimatedPlaceholder type="noRecord" />
                  <AnimatedPlaceholderEmptyTextContainer>
                    <AnimatedPlaceholderEmptyTitle>
                      {t`No agents created yet`}
                    </AnimatedPlaceholderEmptyTitle>
                    <AnimatedPlaceholderEmptySubTitle>
                      {t`Create an agent to get started`}
                    </AnimatedPlaceholderEmptySubTitle>
                  </AnimatedPlaceholderEmptyTextContainer>
                </AnimatedPlaceholderEmptyContainer>
              </div>
            </Section>
          )}
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
