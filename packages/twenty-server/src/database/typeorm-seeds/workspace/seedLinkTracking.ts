import { EntityManager } from 'typeorm';

import { DEV_SEED_WORKSPACE_MEMBER_IDS } from 'src/database/typeorm-seeds/workspace/workspace-members';

const tableName = 'link_tracking';

export const DEV_SEED_LINK_TRACKING_IDS = {
  TRACK_1: '30303030-1234-5678-9101-112131415161',
  TRACK_2: '30303030-2234-5678-9101-112131415162',
};

export const seedLinkTracking = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'workspaceMemberId',
      'linkName',
      'websiteUrl',
      'generatedUrl',
      'campaignName',
      'campaignSource',
      'meansOfCommunication',
      'keyword',
      'createdAt',
    ])
    .orIgnore()
    .values([
      {
        id: DEV_SEED_LINK_TRACKING_IDS.TRACK_1,
        workspaceMemberId: DEV_SEED_WORKSPACE_MEMBER_IDS.TIM,
        linkName: 'Example Page 1',
        websiteUrl: 'https://example.com/page1',
        generatedUrl: 'https://short.ly/ex1',
        campaignName: 'Launch Campaign',
        campaignSource: 'Google Ads',
        meansOfCommunication: 'Email',
        keyword: 'marketing',
        createdAt: new Date(),
      },
      {
        id: DEV_SEED_LINK_TRACKING_IDS.TRACK_2,
        workspaceMemberId: DEV_SEED_WORKSPACE_MEMBER_IDS.JONY,
        linkName: 'Example Page 2',
        websiteUrl: 'https://example.com/page2',
        generatedUrl: 'https://short.ly/ex2',
        campaignName: 'Spring Sale',
        campaignSource: 'Facebook Ads',
        meansOfCommunication: 'Social Media',
        keyword: 'discount',
        createdAt: new Date(),
      },
    ])
    .execute();
};
