import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { useSettingsIntegrationCategories } from '@/settings/integrations/hooks/useSettingsIntegrationCategories';
import { SettingsIntegrationWhatsappDatabaseConnectionForm } from '@/settings/integrations/meta/whatsapp/components/SettingsIntegrationWhatsappDatabaseConnectionForm';
import { AppPath } from '@/types/AppPath';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useRecoilValue } from 'recoil';
import { H2Title } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';

import axios from 'axios';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type Sector } from '@/settings/service-center/sectors/types/Sector';
import { useLingui } from '@lingui/react/macro';
import { v4 } from 'uuid';
import { z } from 'zod';
import {
  REACT_APP_META_WEBHOOK_URL,
  REACT_APP_SERVER_BASE_URL,
} from '~/config';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

export const settingsIntegrationWhatsappConnectionFormSchema = z
  .object({
    name: z.string().min(4, 'Name must be at least 4 characters'),
    phoneId: z.string().optional(),
    businessAccountId: z.string().optional(),
    accessToken: z.string().optional(),
    appId: z.string().optional(),
    appKey: z.string().optional(),
    apiType: z.string().min(1, 'Select an API type'),
    sectorId: z.string().min(1, 'Select a sector'),
  })
  .refine((data) => {
    // For MetaAPI, require all MetaAPI-specific fields
    if (data.apiType === 'MetaAPI') {
      return (
        data.phoneId &&
        data.businessAccountId &&
        data.accessToken &&
        data.appId &&
        data.appKey
      );
    }
    return true;
  });

export type SettingsIntegrationWhatsappConnectionFormValues = z.infer<
  typeof settingsIntegrationWhatsappConnectionFormSchema
>;

export const SettingsIntegrationWhatsappNewDatabaseConnection = () => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const navigateApp = useNavigateApp();
  const tokenPair = useRecoilValue(tokenPairState);
  const workspaceId = useRecoilValue(currentWorkspaceState)?.id;
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const settingsIntegrationsPagePath = getSettingsPath(
    SettingsPath.Integrations,
  );

  const [showQrCode, setShowQrCode] = useState(false);
  const [integrationName, setIntegrationName] = useState('');
  const [baileysSessionValid, setBaileysSessionValid] = useState(false);
  const [baileysValidationTries, setBaileysValidationTries] = useState(0);
  const [baileysValidationFailed, setBaileysValidationFailed] = useState(false);

  const [qrCodeValue, setQrCodeValue] = useState<string | null>(null);
  const [qrCodeError, setQrCodeError] = useState<string | null>(null);
  const [isLoadingQrCode, setIsLoadingQrCode] = useState(false);

  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: 'whatsappIntegration',
    recordGqlFields: { id: true },
  });
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: 'whatsappIntegration',
  });

  const { records: sectors } = useFindManyRecords<
    Sector & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Sector,
    recordGqlFields: { id: true, name: true },
  });

  const [integrationCategoryAll] = useSettingsIntegrationCategories();
  const integration = integrationCategoryAll.integrations.find(
    ({ from: { key } }) => key === 'whatsapp',
  );

  const validateBaileysSession = async (sessionName: string, id: string) => {
    axios
      .get(
        `${REACT_APP_SERVER_BASE_URL}/Whats-App-rest/whatsapp/status/${sessionName}`,
      )
      .then((r) => {
        if (r.data.connected === true) {
          setBaileysSessionValid(true);
          return;
        }
        if (baileysValidationTries < 10) {
          setTimeout(() => {
            validateBaileysSession(sessionName, id);
            setBaileysValidationTries(baileysValidationTries + 1);
          }, 5000);
          return;
        }
        setBaileysValidationFailed(true);
      })
      .catch(() => {
        if (baileysValidationTries < 10)
          setTimeout(() => {
            validateBaileysSession(sessionName, id);
            setBaileysValidationTries(baileysValidationTries + 1);
          }, 5000);
      });
  };

  useEffect(() => {
    if (baileysSessionValid) {
      enqueueSuccessSnackBar({
        message: t`Integration created successfully!`,
      });
      navigate(SettingsPath.IntegrationWhatsappDatabase);
    }
  }, [baileysSessionValid, navigate, t]);

  const isIntegrationAvailable = !!integration;

  useEffect(() => {
    if (!isIntegrationAvailable) {
      navigateApp(AppPath.NotFound);
    }
  }, [integration, navigateApp, isIntegrationAvailable]);

  if (!isIntegrationAvailable) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const formConfig = useForm<SettingsIntegrationWhatsappConnectionFormValues>({
    mode: 'onChange',
    resolver: zodResolver(settingsIntegrationWhatsappConnectionFormSchema),
    defaultValues: {
      apiType: 'MetaAPI',
      sectorId: sectors.length > 0 ? sectors[0].id : '',
    },
  });

  const canSave = formConfig.formState.isValid;
  const fetchQrCodeWithRetry = async (
    sessionName: string,
    maxRetries = 5,
    delay = 2000,
  ) => {
    setIsLoadingQrCode(true);
    setQrCodeError(null);

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(
          `Attempt ${attempt}/${maxRetries} to fetch QR code for: ${sessionName}`,
        );
        const response = await fetch(
          `${REACT_APP_SERVER_BASE_URL}/Whats-App-rest/whatsapp/qr/${sessionName}`,
          {
            headers: {
              Authorization: `Bearer ${tokenPair?.accessOrWorkspaceAgnosticToken?.token}`,
            },
          },
        );

        console.log(`Attempt ${attempt} - Status:`, response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('QR code found:', data);
          if (data.qr) {
            setQrCodeValue(data.qr);
            setIsLoadingQrCode(false);
            return;
          } else {
            console.log('QR code not found in data:', data);
          }
        } else {
          const errorText = await response.text();
          console.log(
            `Attempt ${attempt} - Error:`,
            response.status,
            errorText,
          );
          //
          // If 404, continue trying
          if (response.status === 404) {
            if (attempt < maxRetries) {
              console.log(`Waiting ${delay}ms before next attempt...`);
              await new Promise((resolve) => setTimeout(resolve, delay));
              continue;
            }
          }
          // For other errors, stop
          throw new Error(
            `HTTP Error ${response.status}: ${response.statusText}`,
          );
        }
      } catch (error) {
        console.error(`Error on attempt ${attempt}:`, error);
        if (attempt === maxRetries) {
          const errorMessage =
            typeof error === 'object' && error !== null && 'message' in error
              ? (error as { message?: string }).message
              : String(error);
          setQrCodeError(`${t`Error fetching QR code:`} ${errorMessage}`);
          setIsLoadingQrCode(false);
          return;
        }
        // Wait before next attempt
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    setQrCodeError(t`QR code not available after multiple attempts`);
    setIsLoadingQrCode(false);
  };

  const handleSave = async () => {
    const formValues = formConfig.getValues();

    try {
      const newIntegrationId = v4();
      const verifyToken = v4();
      await createOneRecord({
        id: newIntegrationId,
        name: formValues.name,
        phoneId: formValues.phoneId || '',
        businessAccountId: formValues.businessAccountId || '',
        accessToken: formValues.accessToken || '',
        appId: formValues.appId || '',
        appKey: formValues.appKey || '',
        apiType: formValues.apiType,
        paused: false,
        sla: 30,
        defaultSectorId: formValues.sectorId || '',
        verifyToken,
      });

      if (formValues.apiType === 'Baileys') {
        try {
          await axios.post(
            `${REACT_APP_SERVER_BASE_URL}/Whats-App-rest/whatsapp/session/${formValues.name}`,
            {
              webhook: `https://${REACT_APP_SERVER_BASE_URL}/whatsapp/webhook/${workspaceId}/${newIntegrationId}/`,
              workspaceID: workspaceId,
              canalID: newIntegrationId,
            },
          );
        } catch (error) {
          enqueueErrorSnackBar({
            message: t`Failed to create session`,
          });
          await deleteOneRecord(newIntegrationId);
        }
      }

      if (formValues.apiType === 'Baileys') {
        setIntegrationName(formValues.name);
        setShowQrCode(true);
        setQrCodeValue(null);
        setQrCodeError(null);
        // Check if token exists
        if (!tokenPair?.accessOrWorkspaceAgnosticToken.token) {
          setQrCodeError(t`Authentication token not found`);
          return;
        }
        // Fetch QR code value
        await fetchQrCodeWithRetry(formValues.name);
        validateBaileysSession(formValues.name, newIntegrationId);
      } else {
        try {
          await axios.post(
            `https://graph.facebook.com/v22.0/${formValues.appId}/subscriptions`,
            {
              access_token: `${formValues.appId}|${formValues.appKey}`,
              object: 'whatsapp_business_account',
              callback_url: `${REACT_APP_META_WEBHOOK_URL}/whatsapp/webhook/${workspaceId}/${newIntegrationId}/`,
              verify_token: verifyToken,
              fields: 'messages',
            },
            {
              headers: {
                contentType: 'application/json',
              },
            },
          );
        } catch (error) {
          enqueueErrorSnackBar({
            message: t`Failed to subscribe to business account`,
          });
          await deleteOneRecord(newIntegrationId);
        }
        navigate(SettingsPath.IntegrationWhatsappDatabase);
      }
    } catch (error) {
      enqueueErrorSnackBar({
        message: t`Failed to create integration`,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
      title={t`New Whatsapp Inbox`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: t`Integrations`,
          href: settingsIntegrationsPagePath,
        },
        {
          children: integration.text,
          href: `${settingsIntegrationsPagePath}/whatsapp`,
        },
        { children: t`New Whatsapp Inbox` },
      ]}
      actionButton={
        showQrCode ? (
          <SaveAndCancelButtons
            isSaveDisabled={false}
            onCancel={() => navigate(SettingsPath.IntegrationWhatsappDatabase)}
            onSave={() => navigate(SettingsPath.IntegrationWhatsappDatabase)}
          />
        ) : (
          <SaveAndCancelButtons
            isSaveDisabled={!canSave}
            onCancel={() => navigate(SettingsPath.IntegrationWhatsappDatabase)}
            onSave={handleSave}
          />
        )
      }
    >
      <SettingsPageContainer>
        <FormProvider
          // eslint-disable-next-line react/jsx-props-no-spreading
          {...formConfig}
        >
          <Section>
            <H2Title
              title=""
              description={t`Start supporting your customers via WhatsApp`}
            />
            {showQrCode ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <h3>
                  {t`QR Code for Baileys`} - {integrationName}
                </h3>
                <p>
                  {t`Scan the QR code below with your WhatsApp to connect the integration:`}
                </p>
                <div style={{ margin: '20px 0' }}>
                  {qrCodeValue ? (
                    <div>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrCodeValue)}`}
                        alt={t`QR Code Baileys`}
                        style={{
                          border: '1px solid #ccc',
                          borderRadius: '8px',
                        }}
                        onError={(e) => {
                          console.error('Error loading QR code:', e);
                          e.currentTarget.style.display = 'none';
                          if (e.currentTarget.nextElementSibling)
                            (
                              e.currentTarget
                                .nextElementSibling as HTMLImageElement
                            ).style.display = 'block';
                        }}
                      />
                      <div
                        style={{
                          display: 'none',
                          padding: '20px',
                          border: '1px solid #ccc',
                          borderRadius: '8px',
                          backgroundColor: '#f5f5f5',
                        }}
                      >
                        <p>{t`QR Code could not be generated`}</p>
                        <p>
                          {t`QR Value:`} {qrCodeValue}
                        </p>
                      </div>
                    </div>
                  ) : qrCodeError ? (
                    <div
                      style={{
                        padding: '20px',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        backgroundColor: '#f5f5f5',
                      }}
                    >
                      <p>{qrCodeError}</p>
                      <p>URL: /Whats-App-rest/whatsapp/qr/{integrationName}</p>
                    </div>
                  ) : isLoadingQrCode ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <p>{t`🔄 Fetching QR code...`}</p>
                      <p style={{ fontSize: '14px', color: '#666' }}>
                        {t`This may take a few seconds. Please wait...`}
                      </p>
                    </div>
                  ) : (
                    <p>{t`QR code not available`}</p>
                  )}
                </div>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  {t`After scanning the QR code, your integration will be active and ready to use.`}
                </p>
              </div>
            ) : (
              <SettingsIntegrationWhatsappDatabaseConnectionForm
                sectors={sectors}
              />
            )}
          </Section>
        </FormProvider>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
