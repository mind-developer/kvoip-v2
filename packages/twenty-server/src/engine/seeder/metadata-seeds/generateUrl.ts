export const generateUrlLink = (
  websiteUrl: string,
  campaignName: string,
  campaignSource: string,
  utmMedium: string = 'cpc',
): string => {
  try {
    const url = new URL(websiteUrl);
    url.searchParams.append('utm_source', campaignSource);
    url.searchParams.append('utm_medium', utmMedium);
    url.searchParams.append('utm_campaign', campaignName);

    console.log('retornando a url', url.toString());

    return url.toString();
  } catch (error) {
    throw new Error(`Invalid website URL: ${websiteUrl}`);
  }
};
