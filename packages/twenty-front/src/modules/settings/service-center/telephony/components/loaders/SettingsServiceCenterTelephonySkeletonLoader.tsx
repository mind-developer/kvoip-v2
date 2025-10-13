/* @kvoip-woulz proprietary */
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { Section } from 'twenty-ui/layout';

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledTabSkeleton = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledContentSkeleton = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsServiceCenterTelephonySkeletonLoader = () => {
  const theme = useTheme();

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledSkeletonContainer>

        {/* Content skeleton */}
        <Section>
          <StyledContentSkeleton>
            <Skeleton
              height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
              width="100%"
            />
            <Skeleton
              height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
              width="100%"
            />
            <Skeleton
              height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
              width="100%"
            />
            <Skeleton
              height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
              width="100%"
            />
            <Skeleton
              height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
              width="100%"
            />
          </StyledContentSkeleton>
        </Section>
      </StyledSkeletonContainer>
    </SkeletonTheme>
  );
};
