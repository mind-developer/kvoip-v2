/* @kvoip-woulz proprietary */
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { FormFieldInputContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputContainer';
import { FormFieldInputRowContainer } from '@/object-record/record-field/ui/form-types/components/FormFieldInputRowContainer';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsServiceCenterLinkTelephonyExtensionSkeletonLoader } from '@/settings/service-center/telephony/components/loaders/SettingsServiceCenterLinkTelephonyExtensionSkeletonLoader';
import { useGetExternalExtension } from '@/settings/service-center/telephony/hooks/useGetExternalExtension';
import { useLinkMemberToExtension } from '@/settings/service-center/telephony/hooks/useLinkMemberToExtension';
import { SettingsPath } from '@/types/SettingsPath';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { InputLabel } from '@/ui/input/components/InputLabel';
import { Select } from '@/ui/input/components/Select';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { IconPhone } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { Card, CardContent } from 'twenty-ui/layout';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const SettingsServiceCenterLinkTelephonyExtensionFormSchema = z.object({
  memberId: z.string().min(1, 'Member is required'),
});

type SettingsServiceCenterLinkTelephonyExtensionFormValues = z.infer<
  typeof SettingsServiceCenterLinkTelephonyExtensionFormSchema
>;

const StyledCard = styled(Card)`
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledCardContent = styled(CardContent)`
  padding: ${({ theme }) => theme.spacing(4)};
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

const StyledInfoLabel = styled.span`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.secondary};
`;

const StyledInfoValue = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledFormSection = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(4)};
`;
  
export const SettingsServiceCenterLinkTelephonyExtension = () => {
  const navigate = useNavigate();
  const { extensionNumber } = useParams<{ extensionNumber: string }>();
  const { t } = useLingui();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const { linkMemberToExtension, loading, data } = useLinkMemberToExtension();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const theme = useTheme();

  const { data: extensionData, loading: extensionLoading } = useGetExternalExtension({
    workspaceId: currentWorkspace?.id || '',
    extNum: extensionNumber,
  });

  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const { records: telephonyRecords, loading: telephonyLoading } = useFindManyRecords<any>({
    objectNameSingular: CoreObjectNameSingular.Telephony,
    filter: {
      numberExtension: {
        eq: extensionNumber,
      },
    },
    skip: !extensionNumber,
  });

  const telephonyWorkspaceEntity = telephonyRecords?.[0];

  const formConfig = useForm<SettingsServiceCenterLinkTelephonyExtensionFormValues>({
    mode: 'onTouched',
    resolver: zodResolver(SettingsServiceCenterLinkTelephonyExtensionFormSchema),
    defaultValues: {
      memberId: '',
    },
  });

  const { isValid, isSubmitting } = formConfig.formState;
  const canSave = isValid && !isSubmitting;

  const settingsServiceCenterTelephonyPagePath = getSettingsPath(
    SettingsPath.ServiceCenterTelephony,
  );

  const memberOptions: SelectOption[] = workspaceMembers?.map((member) => ({
    label: `${member.name.firstName} ${member.name.lastName} (${member.userEmail})`,
    value: member.id,
  })) || [];

  // Definir valor inicial do formulário quando telephonyWorkspaceEntity for carregado
  useEffect(() => {
    if (telephonyWorkspaceEntity?.memberId && !telephonyLoading) {
      formConfig.setValue('memberId', telephonyWorkspaceEntity.memberId);
    }
  }, [telephonyWorkspaceEntity, telephonyLoading, formConfig]);


  const onSave = async (formValue: SettingsServiceCenterLinkTelephonyExtensionFormValues) => {
    if (!extensionNumber) {
      enqueueErrorSnackBar({
        message: t`Extension number not found`,
      });
      return;
    }

    try {
      const result = await linkMemberToExtension(extensionNumber, formValue.memberId);
      
      if (result?.data?.linkMemberToExtension) {
        enqueueSuccessSnackBar({
          message: t`Member linked to extension successfully`,
        });
        navigate(settingsServiceCenterTelephonyPagePath);
      }
    } catch (err) {
      enqueueErrorSnackBar({
        message: (err as Error).message,
      });
    }
  };

  return (
    <SubMenuTopBarContainer
        title={t`Link Extension`}
        actionButton={
          <SaveAndCancelButtons
              isSaveDisabled={!canSave}
              isCancelDisabled={isSubmitting}
              onCancel={() => navigate(settingsServiceCenterTelephonyPagePath)}
              onSave={formConfig.handleSubmit(onSave)}
          />
        }
        links={[
            {
            children: t`Telephony`,
            href: settingsServiceCenterTelephonyPagePath,
            },
            { children: t`Link Extension` },
        ]}
    >
      <FormProvider {...formConfig}>
        <SettingsPageContainer>
          {extensionLoading ? (
            <SettingsServiceCenterLinkTelephonyExtensionSkeletonLoader />
          ) : !extensionData ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ fontSize: '16px', color: 'red' }}>{t`Extension not found`}</p>
            </div>
          ) : (
            <>
                {/* Extension Information Card */}
                <StyledCard>
                    <StyledCardContent>
                        <StyledHeader>
                            <IconPhone size={theme.icon.size.md} />
                            <h3 style={{ margin: 0, fontSize: theme.font.size.lg }}>
                            {t`Extension Information`}
                            </h3>
                        </StyledHeader>

                        <StyledInfoRow>
                            <StyledInfoLabel>{t`Extension Number`}</StyledInfoLabel>
                            <StyledInfoValue>{extensionData?.numero || '-'}</StyledInfoValue>
                        </StyledInfoRow>

                        <StyledInfoRow>
                            <StyledInfoLabel>{t`Extension Name`}</StyledInfoLabel>
                            <StyledInfoValue>{extensionData?.nome || '-'}</StyledInfoValue>
                        </StyledInfoRow>

                        <StyledInfoRow>
                            <StyledInfoLabel>{t`Extension ID`}</StyledInfoLabel>
                            <StyledInfoValue>{extensionData?.ramal_id || '-'}</StyledInfoValue>
                        </StyledInfoRow>

                        <StyledInfoRow>
                            <StyledInfoLabel>{t`Area Code`}</StyledInfoLabel>
                            <StyledInfoValue>{extensionData?.codigo_area || '-'}</StyledInfoValue>
                        </StyledInfoRow>
                    </StyledCardContent>
                </StyledCard>

                <StyledFormSection>
                    <FormFieldInputContainer>
                        <InputLabel>{t`Select Member to Link`}</InputLabel>
                        <FormFieldInputRowContainer>
                            <Controller
                              name="memberId"
                              control={formConfig.control}
                              render={({ field }) => (
                                <Select
                                  dropdownId="member-picker-link-extension"
                                  options={[
                                    {
                                      label: t`Choose Member`,
                                      value: '',
                                    },
                                    ...memberOptions,
                                  ]}
                                  value={field.value}
                                  onChange={field.onChange}
                                  fullWidth
                                  withSearchInput
                                />
                              )}
                            />
                        </FormFieldInputRowContainer>
                    </FormFieldInputContainer>
                </StyledFormSection>
            </>
          )}
        </SettingsPageContainer>
      </FormProvider>
    </SubMenuTopBarContainer>
  );
};
