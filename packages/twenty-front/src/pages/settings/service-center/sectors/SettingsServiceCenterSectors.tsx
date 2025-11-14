import { SettingsPath } from '@/types/SettingsPath';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { type Sector } from '@/settings/service-center/sectors/types/Sector';
import { TextInput } from '@/ui/input/components/TextInput';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useMemo, useState } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { useNavigate } from 'react-router-dom';
import { H2Title, IconPlus, IconSearch, useIcons } from 'twenty-ui/display';
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
import { truncateList } from '~/pages/settings/service-center/utils/truncateList';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

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

const SectorsSkeletonLoader = () => {
  const theme = useTheme();
  const skeletonItems = Array.from({ length: 3 }).map((_, index) => ({
    id: `skeleton-sector-${index}`,
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

export const SettingsServiceCenterSectors = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const navigate = useNavigate();

  const {
    records: sectors,
    loading: sectorsLoading,
  } = useFindManyRecords<Sector & { __typename: string }>({
    objectNameSingular: CoreObjectNameSingular.Sector,
    recordGqlFields: { id: true, icon: true, name: true, agents: true },
  });

  const {
    records: workspaceMembersWithAgent,
    loading: workspaceMembersLoading,
  } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    recordGqlFields: { agent: true, name: true, avatarUrl: true },
    filter: {
      agentId: {
        is: 'NOT_NULL',
      },
    },
  });

  const isLoading = sectorsLoading || workspaceMembersLoading;
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

  const [searchBySectorName, setSearchBySectorName] = useState('');

  const filteredSectors = useMemo(() => {
    return sectors.filter((sector) =>
      sector.name.toLowerCase().includes(searchBySectorName.toLowerCase()),
    );
  }, [sectors, searchBySectorName]);

  function getSectorStatus(sectorId: string): string {
    const agentIdsForSector = workspaceMembersWithAgent
      .filter((member) => member.agent?.sectorId === sectorId)
      .map((member) => member.name.firstName + ' ' + member.name.lastName);
    console.log('agentIdsForSector', agentIdsForSector);
    const truncated = truncateList(agentIdsForSector, 5, 'No agents assigned');
    return truncated;
  }

  return (
    <SubMenuTopBarContainer
      title={`Sectors`}
      actionButton={
        <UndecoratedLink
          to={getSettingsPath(SettingsPath.ServiceCenterNewSector)}
        >
          <Button
            Icon={IconPlus}
            title={t`Add sector`}
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
        { children: t`Sectors` },
      ]}
    >
      <SettingsPageContainer>
        <div>
          <H2Title
            title={t`Manage sectors`}
            description={t`Group agents into sectors for easier management`}
          />
          <StyledTextInput
            onChange={(s) => {
              setSearchBySectorName(s);
            }}
            value={searchBySectorName}
            placeholder="Search for a sector..."
            LeftIcon={IconSearch}
          />
          <Section>
            {showSkeleton ? (
              <SectorsSkeletonLoader />
            ) : (
              filteredSectors.map((sector) => {
                const Icon = getIcon(sector.icon, 'IconDots');
                return (
                  <StyledSettingsCard
                    key={sector.id}
                    Icon={<Icon size={16} />}
                    title={sector.name}
                    Status={'• ' + getSectorStatus(sector.id)}
                    onClick={() => {
                      navigate(
                        getSettingsPath(SettingsPath.ServiceCenterEditSector, {
                          sectorSlug: sector.id,
                        }),
                      );
                    }}
                  />
                );
              })
            )}
            {!showSkeleton && filteredSectors.length === 0 && (
              <div style={{ marginTop: theme.spacing(10) }}>
                <AnimatedPlaceholderEmptyContainer>
                  <AnimatedPlaceholder type="noRecord" />
                  <AnimatedPlaceholderEmptyTextContainer>
                    <AnimatedPlaceholderEmptyTitle>
                      {t`No sectors created yet`}
                    </AnimatedPlaceholderEmptyTitle>
                    <AnimatedPlaceholderEmptySubTitle>
                      {t`Create a sector to get started`}
                    </AnimatedPlaceholderEmptySubTitle>
                  </AnimatedPlaceholderEmptyTextContainer>
                </AnimatedPlaceholderEmptyContainer>
              </div>
            )}
          </Section>
        </div>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
