import { currentUserState } from '@/auth/states/currentUserState';
import { OnboardingSubscriptionStatusCard } from '@/onboarding/components/OnboarindPaymentStatusCard';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { OnboardingModalCircularIcon } from '@/onboarding/components/OnboardingModalCircularIcon';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { subscriptionStatusState } from '@/workspace/states/subscriptionStatusState';
import { useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Loader } from 'twenty-ui/feedback';

import {
  type GetCurrentUserQuery,
  SubscriptionStatus,
  useGetCurrentUserLazyQuery,
} from '~/generated-metadata/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';

const StyledLoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 250px;
`;

export const PaymentSuccess = () => {
  const navigate = useNavigateApp();
  const subscriptionStatus = useRecoilValue(subscriptionStatusState);

  const [getCurrentUser] = useGetCurrentUserLazyQuery();

  const setCurrentUser = useSetRecoilState(currentUserState);

  const [isLoading, setIsLoading] = useState(false);

  const { enqueueInfoSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const navigateWithSubscriptionCheck = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (isDefined(subscriptionStatus)) {
        navigate(AppPath.CreateWorkspace);
        setIsLoading(false);
        return;
      }

      const result = await getCurrentUser({ fetchPolicy: 'network-only' });
      const currentUser = result.data?.currentUser;
      const refreshedSubscriptionStatus =
        currentUser?.currentWorkspace?.currentBillingSubscription?.status;

      if (
        isDefined(refreshedSubscriptionStatus) &&
        isDefined(currentUser) &&
        refreshedSubscriptionStatus === SubscriptionStatus.Active
      ) {
        setCurrentUser(currentUser);
        navigate(AppPath.CreateWorkspace);
        setIsLoading(false);
        return;
      }

      throw new Error(
        "We're waiting for a confirmation from our payment provider.\n" +
          'Please try again in a few seconds, sorry.',
        { cause: 'PaymentSuccess' },
      );
    } catch (error) {
      setIsLoading(false);
      if (error instanceof Error) {
        if (error.cause === 'PaymentSuccess') {
          enqueueInfoSnackBar({
            message: error.message,
          });
        } else {
          enqueueErrorSnackBar({
            message: 'Unexpected error while checking subscription status.',
            options: {
              detailedMessage: error.message,
            },
          });
        }
      }
      throw error;
    }
  };

  const { loading } = useQuery<GetCurrentUserQuery>(GET_CURRENT_USER, {
    fetchPolicy: 'no-cache',
    pollInterval: 10000, // Poll every 10 seconds
    onCompleted: async (data) => {
      const refreshedSubscriptionStatus =
        data.currentUser.currentWorkspace?.currentBillingSubscription?.status;

      if (isDefined(refreshedSubscriptionStatus)) {
        await navigateWithSubscriptionCheck();
      }
    },
  });

  return (
    <Modal.Content isVerticalCentered isHorizontalCentered>
      {loading ? (
        <StyledLoaderContainer>
          <Loader />
        </StyledLoaderContainer>
      ) : (
        <OnboardingSubscriptionStatusCard
          navigateWithSubscriptionCheck={navigateWithSubscriptionCheck}
          isLoading={isLoading}
        />
      )}
    </Modal.Content>
  );
};
