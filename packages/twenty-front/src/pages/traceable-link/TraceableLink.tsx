/* eslint-disable no-restricted-imports */
import { useWorkspaceFavorites } from '@/favorites/hooks/useWorkspaceFavorites';
import { NavigationDrawerSectionForObjectMetadataItems } from '@/object-metadata/components/NavigationDrawerSectionForObjectMetadataItems';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';

import { IconLink } from '@tabler/icons-react';

const StyledMainContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`;

export const TraceableLink = () => {
  const { workspaceFavoritesObjectMetadataItems } = useWorkspaceFavorites();

  return (
    <PageContainer>
      <PageHeader Icon={IconLink} title="Traceable Link" />
      <PageBody>
        <StyledMainContainer>
          <NavigationDrawerSectionForObjectMetadataItems
            sectionTitle={t`Workspace`}
            objectMetadataItems={workspaceFavoritesObjectMetadataItems}
            isRemote={false}
          />
        </StyledMainContainer>
      </PageBody>
    </PageContainer>
  );
};
