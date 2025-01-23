import styled from '@emotion/styled';
import { useState } from 'react';
import { useSetRecoilState } from 'recoil';
import {
  H1Title,
  H2Title,
  IconPlus,
  Section
} from 'twenty-ui';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { SettingsHeaderContainer } from '@/settings/components/SettingsHeaderContainer';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPath } from '@/types/SettingsPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Button } from '@/ui/input/button/components/Button';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Table } from '@/ui/layout/table/components/Table';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink';
import { ShowMemberTabs } from '@/workspace-member/ShowMemberTabs';
import { useTranslation } from 'react-i18next';
import { useGetWorkspaceInvitationsQuery } from '~/generated/graphql';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { workspaceInvitationsState } from '../../modules/workspace-invitation/states/workspaceInvitationsStates';


const StyledButtonContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  margin-left: ${({ theme }) => theme.spacing(3)};
`;

const StyledTable = styled(Table)`
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledTableHeaderRow = styled(Table)`
  margin-bottom: ${({ theme }) => theme.spacing(1.5)};
`;

const StyledIconWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const StyledTextContainerWithEllipsis = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

export const SettingsWorkspaceMembers = () => {
  const { t } = useTranslation();
  const { enqueueSnackBar } = useSnackBar();
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [workspaceMemberToDelete, setWorkspaceMemberToDelete] = useState<
    string | undefined
  >();

  const { deleteOneRecord: deleteOneWorkspaceMember } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const handleRemoveWorkspaceMember = async (workspaceMemberId: string) => {
    await deleteOneWorkspaceMember?.(workspaceMemberId);
    setIsConfirmationModalOpen(false);
  };
  const setWorkspaceInvitations = useSetRecoilState(workspaceInvitationsState);

  useGetWorkspaceInvitationsQuery({
    onError: (error: Error) => {
      enqueueSnackBar(error.message, {
        variant: SnackBarVariant.Error,
      });
    },
    onCompleted: (data) => {
      setWorkspaceInvitations(data?.findWorkspaceInvitations ?? []);
    },
  });

  return (
    <SubMenuTopBarContainer
      title=""
      links={[
        {
          children: 'Workspace',
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: 'Members' },
      ]}
    >
      <SettingsPageContainer>

      <SettingsHeaderContainer>
            <StyledH1Title title={t('members')} />
            <UndecoratedLink to={getSettingsPath(SettingsPath.NewMember)} >
              <Button
                Icon={IconPlus}
                title={t('addMembers')}
                accent="blue"
                size="small"
              />
            </UndecoratedLink>
        </SettingsHeaderContainer>
        <Section>
          <H2Title title="" description={t('membersDescription')} />
          <ShowMemberTabs />
        </Section>
      </SettingsPageContainer>
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        setIsOpen={setIsConfirmationModalOpen}
        title={t('Account Deletion')}
        subtitle={"This action cannot be undone. This will permanently delete this user and remove them from all their assignments."}
        onConfirmClick={() =>
          workspaceMemberToDelete &&
          handleRemoveWorkspaceMember(workspaceMemberToDelete)
        }
        deleteButtonText={t`Delete account`}
      />
    </SubMenuTopBarContainer>
  );
};
