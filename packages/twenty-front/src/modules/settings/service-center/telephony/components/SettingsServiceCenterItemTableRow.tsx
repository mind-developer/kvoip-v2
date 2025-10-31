import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Telephony } from '@/settings/service-center/telephony/types/SettingsServiceCenterTelephony';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { Avatar, OverflowingTextWithTooltip } from 'twenty-ui/display';

const StyledContainer = styled.div<{ clickable?: boolean, isSelected?: boolean }>`
  background: ${({ theme, isSelected }) => isSelected ? theme.background.tertiary : theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: row;
  margin-bottom: ${({ theme }) => theme.spacing(0)};
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  cursor: ${({ clickable }) => clickable ? 'pointer' : 'default'};
  transition: background-color 0.2s ease;
  align-items: center;

  &:hover {
    background: ${({ theme, clickable }) => clickable ? theme.background.tertiary : theme.background.secondary};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-left: ${({ theme }) => theme.spacing(3)};
  overflow: auto;
`;

const StyledEmailText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledExtensionText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledTextContent = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
`;

type SettingsServiceCenterItemTableRowProps = {
  telephony: Telephony;
  accessory?: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
};

export const SettingsServiceCenterItemTableRow = ({
  telephony,
  isSelected = false,
  accessory,
  onClick,
}: SettingsServiceCenterItemTableRowProps) => {
  const { t } = useLingui();

  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const member = workspaceMembers.find(
    (wsMember) => wsMember.id === telephony.memberId,
  );

  return (
    <StyledContainer 
      isSelected={isSelected}
      clickable={!!onClick}
      onClick={onClick}
    >
      <Avatar
        avatarUrl={member?.avatarUrl}
        placeholderColorSeed={telephony.id}
        placeholder={member?.name.firstName + ' ' + member?.name.lastName}
        type="rounded"
        size="lg"
      />
      <StyledContent>
        <OverflowingTextWithTooltip
          text={member?.name.firstName + ' ' + member?.name.lastName}
        />
        <StyledEmailText>{member?.userEmail}</StyledEmailText>
      </StyledContent>
        <StyledTextContent>
          <StyledExtensionText> {t`Extension`}: </StyledExtensionText>
          <OverflowingTextWithTooltip
            text={telephony.numberExtension}
          />
        </StyledTextContent>
        {accessory}
    </StyledContainer>
  );
};
