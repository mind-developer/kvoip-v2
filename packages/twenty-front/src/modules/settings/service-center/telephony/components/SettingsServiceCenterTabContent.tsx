import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsServiceCenterItemTableRow } from '@/settings/service-center/telephony/components/SettingsServiceCenterItemTableRow';
import { SettingsServiceCenterTelephonySkeletonLoader } from '@/settings/service-center/telephony/components/loaders/SettingsServiceCenterTelephonySkeletonLoader';
import { Telephony } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import {
    AnimatedPlaceholder,
    AnimatedPlaceholderEmptyContainer,
    AnimatedPlaceholderEmptySubTitle,
    AnimatedPlaceholderEmptyTextContainer,
    AnimatedPlaceholderEmptyTitle,
    Section,
} from 'twenty-ui/layout';

type ServiceCenterTabContentProps = {
  telephonys: Telephony[];
  searchTerm: string;
  refetch: () => void;
  disableActions?: boolean;
  onExtensionSelect?: (telephony: Telephony) => void;
  loading?: boolean;
  markSelectedItem?: boolean;
};

const StyledSection = styled(Section)`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const ServiceCenterTabContent = ({
  telephonys,
  searchTerm,
  disableActions = false,
  onExtensionSelect,
  loading = false,
  markSelectedItem = false,
}: ServiceCenterTabContentProps) => {
  const navigate = useNavigate();
  const { getIcon } = useIcons();
  const theme = useTheme();
  const EditTelephonyIcon = getIcon('IconEdit');
  const { t } = useLingui();
  const [selectedItem, setSelectedItem] = useState<Telephony | null>(null);

  // Buscar dados dos membros do workspace
  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const handleEditTelephony = (telephonyId: string) => {
    const path = getSettingsPath(SettingsPath.EditTelephony).replace(
      ':telephonySlug',
      telephonyId,
    );

    navigate(path);
  };

  // Filtrar telefonia baseado no termo de busca
  const filteredTelephonys = telephonys.filter((telephony) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();

    // Buscar nos campos da telefonia
    const telephonyMatch =
      telephony.extensionName?.toLowerCase().includes(searchLower) ||
      telephony.numberExtension?.toLowerCase().includes(searchLower) ||
      telephony.type?.toLowerCase().includes(searchLower);

    // Se já encontrou na telefonia, retorna true
    if (telephonyMatch) return true;

    // Buscar no nome do usuário vinculado
    const linkedMember = workspaceMembers.find(
      (member) => member.id === telephony.memberId,
    );
    if (linkedMember) {
      const memberName =
        `${linkedMember.name.firstName} ${linkedMember.name.lastName}`.toLowerCase();
      return memberName.includes(searchLower);
    }

    return false;
  });

  if (loading) {
    return <SettingsServiceCenterTelephonySkeletonLoader />;
  }

  return (
    <>
      {filteredTelephonys?.length > 0 ? (
        <StyledSection>
          {filteredTelephonys?.map((telephony) => (
            <SettingsServiceCenterItemTableRow
              key={telephony.id}
              telephony={telephony}
              isSelected={selectedItem?.id === telephony.id}
              accessory={
                !disableActions ? (
                  <IconButton
                    onClick={() => handleEditTelephony(telephony.id)}
                    Icon={() => (
                      <EditTelephonyIcon
                        size={theme.icon.size.md}
                        color={theme.font.color.tertiary}
                      />
                    )}
                  />
                ) : undefined
              }
              onClick={
                disableActions && onExtensionSelect
                  ? () => {
                      setSelectedItem(telephony);
                      onExtensionSelect(telephony);
                    }
                  : undefined
              }
            />
          ))}
        </StyledSection>
      ) : (
        <Section>
          <div style={{ marginTop: theme.spacing(10) }}>
            <AnimatedPlaceholderEmptyContainer>
              <AnimatedPlaceholder type="noRecord" />
              <AnimatedPlaceholderEmptyTextContainer>
                <AnimatedPlaceholderEmptyTitle>
                  {searchTerm
                    ? t`No operators found for "${searchTerm}"`
                    : t`No members with extensions found`}
                </AnimatedPlaceholderEmptyTitle>
                <AnimatedPlaceholderEmptySubTitle>
                  {searchTerm
                    ? t`Try a different search term`
                    : t`Create an extension for a member to get started`}
                </AnimatedPlaceholderEmptySubTitle>
              </AnimatedPlaceholderEmptyTextContainer>
            </AnimatedPlaceholderEmptyContainer>
          </div>
        </Section>
      )}
    </>
  );
};
