/* @kvoip-woulz proprietary */
import styled from '@emotion/styled';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsServiceCenterExternalExtension } from '@/settings/service-center/telephony/types/SettingsServiceCenterExternalExtension';
import { Telephony } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { useLingui } from '@lingui/react/macro';
import { AppTooltip, Avatar, TooltipDelay } from 'twenty-ui/display';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(0)};
  padding: ${({ theme }) => theme.spacing(3)};
  &:last-child {
    border-bottom: none;
  }feat
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  overflow: auto;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledTextContent = styled.div`
  display: flex;
  align-items: center;
  overflow: auto;
  min-width: 0;
  flex: 1;
`;

const StyledExtensionText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledLinkedMemberContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-left: ${({ theme }) => theme.spacing(2)};
  min-width: 0;
  flex: 0 0 200px; /* Largura fixa para evitar desalinhamento */
`;

const StyledLinkedMemberText = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px; /* Limita o tamanho do texto */
`;

const StyledNotLinkedText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

type ServiceCenterExternalExtensionTableRowProps = {
  extension: SettingsServiceCenterExternalExtension;
  linkedTelephony?: Telephony;
  accessory?: React.ReactNode;
};

export const ServiceCenterExternalExtensionTableRow = ({
  extension,
  linkedTelephony,
  accessory,
}: ServiceCenterExternalExtensionTableRowProps) => {
  const { t } = useLingui();

  // Buscar dados do membro vinculado
  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const linkedMember = linkedTelephony 
    ? workspaceMembers.find(member => member.id === linkedTelephony.memberId)
    : null;

  return (
    <StyledContainer>
      <StyledContent>
        <StyledTextContent>
          <StyledExtensionText> {t`Name`}: </StyledExtensionText>
          <OverflowingTextWithTooltip
            text={extension.nome}
          />
        </StyledTextContent>

        <StyledTextContent>
          <StyledExtensionText> {t`Extension`}: </StyledExtensionText>
          <OverflowingTextWithTooltip
            text={extension.numero}
          />
        </StyledTextContent>

        <StyledLinkedMemberContainer>
          {linkedMember ? (
            <>
              <Avatar
                avatarUrl={linkedMember.avatarUrl}
                placeholderColorSeed={linkedMember.id}
                placeholder={linkedMember.name.firstName ?? ''}
                type="rounded"
                size="sm"
              />
              <div id={`linked-member-${linkedMember.id}`}>
                <StyledLinkedMemberText>
                  {linkedMember.name.firstName} {linkedMember.name.lastName}
                </StyledLinkedMemberText>
              </div>
              <AppTooltip
                anchorSelect={`#linked-member-${linkedMember.id}`}
                content={`${linkedMember.name.firstName} ${linkedMember.name.lastName}`}
                noArrow
                place="top"
                positionStrategy="fixed"
                delay={TooltipDelay.shortDelay}
              />
            </>
          ) : (
            <StyledNotLinkedText>
              {t`Not linked`}
            </StyledNotLinkedText>
          )}
        </StyledLinkedMemberContainer>

      </StyledContent>
      {accessory}
    </StyledContainer>
  );
};
