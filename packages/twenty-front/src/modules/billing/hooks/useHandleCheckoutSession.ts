import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import {
  OnboardingPlanStep,
  onboardingPlanStepState,
} from '@/onboarding/states/onboardingPlanStepState';
import { AppPath } from '@/types/AppPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import {
  type BillingPlanKey,
  type SubscriptionInterval,
  useCheckoutSessionMutation,
} from '~/generated-metadata/graphql';
import {
  BillingPaymentProviders,
  type InterCreateChargeDto,
} from '~/generated/graphql';
import { getAppPath } from '~/utils/navigation/getAppPath';

export type HandleCheckoutSessionFn = (
  interChargeData?: InterCreateChargeDto,
) => Promise<void>;

export const useHandleCheckoutSession = ({
  recurringInterval,
  plan,
  requirePaymentMethod,
  paymentProvider,
  successUrlPath,
}: {
  recurringInterval: SubscriptionInterval;
  plan: BillingPlanKey;
  requirePaymentMethod: boolean;
  paymentProvider?: BillingPaymentProviders;
  successUrlPath: string;
}) => {
  const { redirect } = useRedirect();

  const { enqueueErrorSnackBar } = useSnackBar();

  const [checkoutSession] = useCheckoutSessionMutation();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [onboardingPlanStep, setOnboardingPlanStep] = useRecoilState(
    onboardingPlanStepState,
  );

  const handleCheckoutSession: HandleCheckoutSessionFn = async (
    interChargeData,
  ) => {
    setIsSubmitting(true);

    if (
      paymentProvider === BillingPaymentProviders.Inter &&
      onboardingPlanStep === OnboardingPlanStep.Init
    ) {
      setOnboardingPlanStep(OnboardingPlanStep.InterChargeData);
      setIsSubmitting(false);
      return;
    }

    const { data } = await checkoutSession({
      variables: {
        recurringInterval,
        successUrlPath: getAppPath(AppPath.PlanRequiredSuccess),
        plan,
        requirePaymentMethod,
        paymentProvider,
        interChargeData,
      },
    });
    setIsSubmitting(false);
    if (!data?.checkoutSession.url) {
      enqueueErrorSnackBar({
        message: t`Checkout session error. Please retry or contact Twenty team`,
      });
      return;
    }
    redirect(data.checkoutSession.url);
  };
  return { isSubmitting, handleCheckoutSession };
};
