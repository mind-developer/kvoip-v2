/* @kvoip-woulz proprietary */
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { Card, CardContent } from 'twenty-ui/layout';

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledCard = styled(Card)`
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledCardContent = styled(CardContent)`
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing(2)} 0;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  
  &:last-child {
    border-bottom: none;
  }
`;

const StyledFormSection = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsServiceCenterLinkTelephonyExtensionSkeletonLoader = () => {
  const theme = useTheme();

  return (
    <SkeletonTheme
      baseColor={theme.background.tertiary}
      highlightColor={theme.background.transparent.lighter}
      borderRadius={4}
    >
      <StyledSkeletonContainer>
        {/* Extension Information Card Skeleton */}
        <StyledCard>
          <StyledCardContent>
            <StyledHeader>
              <Skeleton
                width={24}
                height={24}
                borderRadius={4}
              />
              <Skeleton
                width={200}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
              />
            </StyledHeader>

            <StyledInfoRow>
              <Skeleton
                width={120}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
              />
              <Skeleton
                width={80}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
              />
            </StyledInfoRow>

            <StyledInfoRow>
              <Skeleton
                width={100}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
              />
              <Skeleton
                width={120}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
              />
            </StyledInfoRow>

            <StyledInfoRow>
              <Skeleton
                width={90}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
              />
              <Skeleton
                width={60}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
              />
            </StyledInfoRow>

            <StyledInfoRow>
              <Skeleton
                width={80}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
              />
              <Skeleton
                width={100}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
              />
            </StyledInfoRow>
          </StyledCardContent>
        </StyledCard>

        {/* Member Selection Form Skeleton */}
        <StyledFormSection>
          <Skeleton
            width={200}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.l}
            style={{ marginBottom: theme.spacing(2) }}
          />
          <Skeleton
            width={150}
            height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
            style={{ marginBottom: theme.spacing(3) }}
          />
          <Skeleton
            width="100%"
            height={40}
            borderRadius={4}
          />
        </StyledFormSection>
      </StyledSkeletonContainer>
    </SkeletonTheme>
  );
};
