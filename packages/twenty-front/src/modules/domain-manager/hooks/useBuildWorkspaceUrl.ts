import { isDefined } from 'twenty-shared';

export const useBuildWorkspaceUrl = () => {
  const buildWorkspaceUrl = (
    subdomain?: string,
    pathname?: string,
    searchParams?: Record<string, string | boolean>,
  ) => {
    const url = new URL(window.location.href);

    if (isDefined(subdomain) && subdomain.length !== 0) {
      url.hostname = `${subdomain}.${domainConfiguration.frontDomain}`;
    }

    if (isDefined(pathname)) {
      url.pathname = pathname;
    }

    if (isDefined(searchParams)) {
      Object.entries(searchParams).forEach(([key, value]) =>
        url.searchParams.set(key, value.toString()),
      );
    }
    return url.toString();
  };

  return {
    buildWorkspaceUrl,
  };
};
