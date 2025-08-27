/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { billingState } from '@/client-config/states/billingState';
import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { SettingsBillingSwitchSubscriptionModal } from '@/settings/billing/components/SettingsBillingSwitchSubscriptonModal';
import { SWITCH_PLAN_MODAL_ID } from '@/settings/billing/constants/ChangeSubscriptionModalId';
import { useHandleUpdateSubscription } from '@/settings/billing/hooks/useHandleUpdateSubscription';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useCurrentBillingChargeFileLink } from '@/workspace/hooks/useCurrentBillingChargeFileLink';
import { useSubscriptioProvider } from '@/workspace/hooks/useSubscriptionProvider';
import { useSubscriptionStatus } from '@/workspace/hooks/useSubscriptionStatus';
import { isDefined } from 'twenty-shared/utils';
import {
  H2Title,
  IconCircleX,
  IconCreditCard,
  IconDownload,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import {
  BillingPaymentProviders,
  SubscriptionInterval,
  SubscriptionStatus,
  useBillingPortalSessionQuery,
  useSwitchSubscriptionToYearlyIntervalMutation,
} from '~/generated/graphql';

import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const SWITCH_BILLING_INTERVAL_MODAL_ID = 'switch-billing-interval-modal';
const SWITCH_SUBSCRIPTION_CONFIRMATION_MODAL_ID =
  'switch-subscription-confirmation-modal';

export const SettingsBilling = () => {
  const { t } = useLingui();

  const { redirect } = useRedirect();

  const { enqueueSnackBar } = useSnackBar();

  const billing = useRecoilValue(billingState);

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const subscriptions = currentWorkspace?.billingSubscriptions;

  const hasSubscriptions = (subscriptions?.length ?? 0) > 0;

  const subscriptionStatus = useSubscriptionStatus();

  const hasNotCanceledCurrentSubscription =
    isDefined(subscriptionStatus) &&
    subscriptionStatus !== SubscriptionStatus.Canceled;

  const currentBillingChargeFileLink = useCurrentBillingChargeFileLink();

  const subscriptionPaymentProvider = useSubscriptioProvider();
  const isOneTimePaidSubscription =
    subscriptionPaymentProvider === BillingPaymentProviders.Inter;

  const setCurrentWorkspace = useSetRecoilState(currentWorkspaceState);

  const [switchToYearlyInterval] =
    useSwitchSubscriptionToYearlyIntervalMutation();
  const { data, loading } = useBillingPortalSessionQuery({
    variables: {
      returnUrlPath: '/settings/billing',
    },
    skip: !hasSubscriptions,
  });

  const billingPortalButtonDisabled =
    subscriptionPaymentProvider === BillingPaymentProviders.Stripe &&
    (loading || !isDefined(data) || !isDefined(data.billingPortalSession.url));

  const openBillingPortal = () => {
    if (isDefined(data) && isDefined(data.billingPortalSession.url)) {
      redirect(data.billingPortalSession.url);
    }
  };

  const { handleUpdateSubscription, loading: loadingUpdateSubscription } =
    useHandleUpdateSubscription();

  const handleDonwloadBankSlip = () => {
    if (subscriptionStatus === SubscriptionStatus.Expired)
      handleUpdateSubscription();
    else if (isDefined(currentBillingChargeFileLink))
      redirect(currentBillingChargeFileLink, '_blank');
  };

  const { openModal } = useModal();

  const switchInterval = async () => {
    try {
      await switchToYearlyInterval();
      if (isDefined(currentWorkspace?.currentBillingSubscription)) {
        const newCurrentWorkspace = {
          ...currentWorkspace,
          currentBillingSubscription: {
            ...currentWorkspace?.currentBillingSubscription,
            interval: SubscriptionInterval.Year,
          },
        };
        setCurrentWorkspace(newCurrentWorkspace);
      }
      enqueueSnackBar(t`Subscription has been switched to yearly.`, {
        variant: SnackBarVariant.Success,
      });
    } catch (error: any) {
      enqueueSnackBar(t`Error while switching subscription to yearly.`, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title={t`Billing`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Billing</Trans> },
      ]}
    >
      <SettingsPageContainer>
        {/* {hasNotCanceledCurrentSubscription && (
        {hasNotCanceledCurrentSubscription && (
          <SettingsBillingSubscriptionInfo />
        )}
        {hasNotCanceledCurrentSubscription && (
          <SettingsBillingMonthlyCreditsSection />
        )} */}
        <Section>
          <H2Title
            title={t`Manage billing information`}
            description={t`Edit payment method, see your invoices and more`}
          />
          <Button
            Icon={isOneTimePaidSubscription ? IconDownload : IconCreditCard}
            title={
              isOneTimePaidSubscription
                ? t`Donwload bank slip`
                : t`View billing details`
            }
            variant="secondary"
            onClick={
              isOneTimePaidSubscription
                ? handleDonwloadBankSlip
                : openBillingPortal
            }
            disabled={billingPortalButtonDisabled || loadingUpdateSubscription}
          />
        </Section>
        <Section>
          <H2Title
            title={t`Change subscription plan`}
            description={t`Allows you to change your current subscription plan`}
          />
          <Button
            Icon={IconCreditCard}
            title={t`Change plan`}
            variant="secondary"
            onClick={() => openModal(SWITCH_SUBSCRIPTION_CONFIRMATION_MODAL_ID)}
          />
        </Section>
        {![
          currentWorkspace?.currentBillingSubscription?.interval ===
            SubscriptionInterval.Month,
          !!billing?.isBillingSwitchPlanIntervalEnabled,
        ].includes(false) &&
          hasNotCanceledCurrentSubscription && (
            <Section>
              <H2Title
                title={t`Cancel your subscription`}
                description={t`Your workspace will be disabled`}
              />
              <Button
                Icon={IconCircleX}
                title={t`Cancel Plan`}
                variant="secondary"
                accent="danger"
                onClick={openBillingPortal}
                disabled={billingPortalButtonDisabled}
              />
            </Section>
          )}
      </SettingsPageContainer>
      <ConfirmationModal
        modalId={SWITCH_BILLING_INTERVAL_MODAL_ID}
        title={t`Switch billing to yearly`}
        subtitle={t`Are you sure that you want to change your billing interval? You will be charged immediately for the full year.`}
        onConfirmClick={switchInterval}
        confirmButtonText={t`Change to yearly`}
        confirmButtonAccent={'blue'}
      />
      <ConfirmationModal
        modalId={SWITCH_SUBSCRIPTION_CONFIRMATION_MODAL_ID}
        title={t`Change subscription plan`}
        subtitle={t`Are you sure you want to change your subscripion plan? Your invoice amount will change at the end of the curent period.`}
        onConfirmClick={() => openModal(SWITCH_PLAN_MODAL_ID)}
        confirmButtonText={t`Change`}
        confirmButtonAccent={'blue'}
      />
      <SettingsBillingSwitchSubscriptionModal />
    </SubMenuTopBarContainer>
  );
};
