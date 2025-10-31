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
    sectorId: z.string().optional(),
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
        `http://localhost:3000/Whats-App-rest/whatsapp/status/${sessionName}`,
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
        message: 'Integração criada com sucesso!',
      });
      navigate(SettingsPath.IntegrationWhatsappDatabase);
    }
  }, [baileysSessionValid, navigate]);

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
  // Função para buscar QR code com retry
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
          `Tentativa ${attempt}/${maxRetries} de buscar QR code para: ${sessionName}`,
        );
        const response = await fetch(
          `http://localhost:3000/Whats-App-rest/whatsapp/qr/${sessionName}`,
          {
            headers: {
              Authorization: `Bearer ${tokenPair?.accessOrWorkspaceAgnosticToken?.token}`,
            },
          },
        );

        console.log(`Tentativa ${attempt} - Status:`, response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('QR code encontrado:', data);
          if (data.qr) {
            setQrCodeValue(data.qr);
            setIsLoadingQrCode(false);
            return;
          } else {
            console.log('QR code não encontrado nos dados:', data);
          }
        } else {
          const errorText = await response.text();
          console.log(
            `Tentativa ${attempt} - Erro:`,
            response.status,
            errorText,
          );
          //
          // Se for 404, continuar tentando
          if (response.status === 404) {
            if (attempt < maxRetries) {
              console.log(
                `Aguardando ${delay}ms antes da próxima tentativa...`,
              );
              await new Promise((resolve) => setTimeout(resolve, delay));
              continue;
            }
          }
          // Para outros erros, parar
          throw new Error(
            `Erro HTTP ${response.status}: ${response.statusText}`,
          );
        }
      } catch (error) {
        console.error(`Erro na tentativa ${attempt}:`, error);
        if (attempt === maxRetries) {
          setQrCodeError(
            `Erro ao buscar QR code: ${
              typeof error === 'object' && error !== null && 'message' in error
                ? (error as { message?: string }).message
                : String(error)
            }`,
          );
          setIsLoadingQrCode(false);
          return;
        }
        // Aguardar antes da próxima tentativa
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    setQrCodeError('QR code não disponível após várias tentativas');
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
            `http://localhost:3000/Whats-App-rest/whatsapp/session/${formValues.name}`,
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
        // Verificar se o token existe
        if (!tokenPair?.accessOrWorkspaceAgnosticToken.token) {
          setQrCodeError('Token de autenticação não encontrado');
          return;
        }
        // Buscar o valor do QR code
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
      title="New Whatsapp Inbox"
      links={[
        {
          children: 'Workspace',
          href: getSettingsPath(SettingsPath.Workspace),
        },
        {
          children: 'Integrations',
          href: settingsIntegrationsPagePath,
        },
        {
          children: integration.text,
          href: `${settingsIntegrationsPagePath}/whatsapp`,
        },
        { children: 'New Whatsapp Inbox' },
      ]}
      actionButton={
        showQrCode ? (
          <SaveAndCancelButtons
            isSaveDisabled={false}
            onCancel={() => navigate(SettingsPath.IntegrationWhatsappDatabase)}
            onSave={() => navigate(SettingsPath.IntegrationWhatsappDatabase)}
            // saveButtonText="Voltar à Lista"
            // cancelButtonText="Cancelar"
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
              description="Start supporting your customers via WhatsApp"
            />
            {showQrCode ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <h3>QR Code para Baileys - {integrationName}</h3>
                <p>
                  Escaneie o QR code abaixo com seu WhatsApp para conectar a
                  integração:
                </p>
                <div style={{ margin: '20px 0' }}>
                  {qrCodeValue ? (
                    <div>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrCodeValue)}`}
                        alt="QR Code Baileys"
                        style={{
                          border: '1px solid #ccc',
                          borderRadius: '8px',
                        }}
                        onError={(e) => {
                          console.error('Erro ao carregar QR code:', e);
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
                        <p>QR Code não pôde ser gerado</p>
                        <p>Valor do QR: {qrCodeValue}</p>
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
                      <p>🔄 Buscando QR code...</p>
                      <p style={{ fontSize: '14px', color: '#666' }}>
                        Isso pode levar alguns segundos. Aguarde...
                      </p>
                    </div>
                  ) : (
                    <p>QR code não disponível</p>
                  )}
                </div>
                <p style={{ fontSize: '14px', color: '#666' }}>
                  Após escanear o QR code, sua integração estará ativa e pronta
                  para uso.
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
