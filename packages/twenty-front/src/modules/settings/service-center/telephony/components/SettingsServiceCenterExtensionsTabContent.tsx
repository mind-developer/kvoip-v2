/* @kvoip-woulz proprietary */
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { ServiceCenterFieldActionDropdown } from '@/settings/service-center/sectors/components/ServiceCenterFieldActionDropdown';
import { ServiceCenterExternalExtensionTableRow } from '@/settings/service-center/telephony/components/ServiceCenterExternalExtensionTableRow';
import { SettingsServiceCenterExternalExtension } from '@/settings/service-center/telephony/types/SettingsServiceCenterExternalExtension';
import { Telephony } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconUser } from 'twenty-ui/display';
import { AnimatedPlaceholder, AnimatedPlaceholderEmptyContainer, AnimatedPlaceholderEmptySubTitle, AnimatedPlaceholderEmptyTextContainer, AnimatedPlaceholderEmptyTitle, Section } from 'twenty-ui/layout';

type SettingsServiceCenterExtensionsTabContentProps = {
  extensions: SettingsServiceCenterExternalExtension[];
  telephonys: Telephony[];
  searchTerm: string;
  refetch: () => void;
};

const StyledSection = styled(Section)`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const SettingsServiceCenterExtensionsTabContent = ({
  extensions,
  telephonys,
  searchTerm,
}: SettingsServiceCenterExtensionsTabContentProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useLingui();

  // Buscar dados dos membros do workspace
  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  // Criar mapeamento de extensões para membros vinculados
  const getLinkedMemberForExtension = (extensionNumber: string) => {
    return telephonys.find(telephony => telephony.numberExtension === extensionNumber);
  };

  // Filtrar extensões baseado no termo de busca
  const filteredExtensions = extensions.filter(extension => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Buscar nos campos da extensão
    const extensionMatch = (
      extension.nome?.toLowerCase().includes(searchLower) ||
      extension.numero?.toLowerCase().includes(searchLower)
    );
    
    // Se já encontrou na extensão, retorna true
    if (extensionMatch) return true;
    
    // Buscar no nome do usuário vinculado
    const linkedTelephony = getLinkedMemberForExtension(extension.numero!);
    if (linkedTelephony) {
      const linkedMember = workspaceMembers.find(member => member.id === linkedTelephony.memberId);
      if (linkedMember) {
        const memberName = `${linkedMember.name.firstName} ${linkedMember.name.lastName}`.toLowerCase();
        return memberName.includes(searchLower);
      }
    }
    
    return false;
  });

  return (
    <>
      { filteredExtensions && filteredExtensions?.length > 0 ? (

          <StyledSection>
            {filteredExtensions?.map((extension) => {
              const linkedTelephony = getLinkedMemberForExtension(extension.numero!);
              
              return (
                <ServiceCenterExternalExtensionTableRow
                  key={extension.ramal_id}
                  extension={extension}
                  linkedTelephony={linkedTelephony}
                  accessory={
                  <ServiceCenterFieldActionDropdown
                    key={extension.ramal_id}
                    scopeKey={extension.nome ?? extension.numero!}
                    // onDelete={async () => {
                      
                    // }}
                    extraMenuItems={[
                      {
                        text: t`Link member`,
                        icon: IconUser,
                        onClick: () => {
                          navigate(
                            getSettingsPath(SettingsPath.ServiceCenterLinkTelephonyExtension, {
                              extensionNumber: extension.numero!,
                            })
                          );
                        },
                      },
                    ]}
                  />
                }
                />
              );
            })}
          </StyledSection>

        ) : (
          // No extensions found
          <Section>
            <div style={{ marginTop: theme.spacing(10) }}>
              <AnimatedPlaceholderEmptyContainer>
                <AnimatedPlaceholder type="noRecord" />
                <AnimatedPlaceholderEmptyTextContainer>
                  <AnimatedPlaceholderEmptyTitle>
                    {searchTerm ? t`No extensions found for` + '"' + searchTerm + '"' : t`No extensions found`}
                  </AnimatedPlaceholderEmptyTitle>
                  <AnimatedPlaceholderEmptySubTitle>
                    {searchTerm ? t`Try a different search term` : t`Create an extension to get started`}
                  </AnimatedPlaceholderEmptySubTitle>
                </AnimatedPlaceholderEmptyTextContainer>
              </AnimatedPlaceholderEmptyContainer>
            </div>
          </Section>
          
        )}
    </>
  );
};
