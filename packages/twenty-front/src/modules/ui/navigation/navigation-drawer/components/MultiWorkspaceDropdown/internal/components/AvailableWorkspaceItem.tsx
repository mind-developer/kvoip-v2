import { getAvailableWorkspacePathAndSearchParams } from '@/auth/utils/availableWorkspacesUtils';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { Avatar } from 'twenty-ui/display';
import { MenuItemSelectAvatar, UndecoratedLink } from 'twenty-ui/navigation';
import { type AvailableWorkspace } from '~/generated/graphql';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';

export const AvailableWorkspaceItem = ({
  availableWorkspace,
  isSelected,
}: {
  availableWorkspace: AvailableWorkspace;
  isSelected: boolean;
}) => {
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();

  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();

  const { pathname, searchParams } =
    getAvailableWorkspacePathAndSearchParams(availableWorkspace);

  const handleChange = async () => {
    await redirectToWorkspaceDomain(
      getWorkspaceUrl(availableWorkspace.workspaceUrls),
      pathname,
      searchParams,
    );
  };

  return (
    <UndecoratedLink
      key={availableWorkspace.id}
      to={buildWorkspaceUrl(
        getWorkspaceUrl(availableWorkspace.workspaceUrls),
        pathname,
        searchParams,
      )}
      onClick={(event) => {
        event.preventDefault();
        handleChange();
      }}
    >
      <MenuItemSelectAvatar
        text={availableWorkspace.displayName ?? '(No name)'}
        avatar={
          <Avatar
            placeholder={availableWorkspace.displayName || ''}
            avatarUrl={availableWorkspace.logo ?? DEFAULT_WORKSPACE_LOGO}
          />
        }
        selected={isSelected}
      />
    </UndecoratedLink>
  );
};
