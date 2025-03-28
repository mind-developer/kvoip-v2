import { EntityManager } from 'typeorm';

import { ObjectMetadataStandardIdToIdMap } from 'src/engine/metadata-modules/object-metadata/interfaces/object-metadata-standard-id-to-id-map';

import { createWorkspaceViews } from 'src/engine/workspace-manager/standard-objects-prefill-data/create-workspace-views';
import { seedCompaniesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/companies-all.view';
import { linkLogsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/linklogs-all-views';
import { notesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/notes-all.view';
import { opportunitiesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/opportunities-all.view';
import { opportunitiesByStageView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/opportunity-by-stage.view';
import { peopleAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/people-all.view';
import { tasksAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/tasks-all.view';
import { tasksAssignedToMeView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/tasks-assigned-to-me';
import { tasksByStatusView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/tasks-by-status.view';
import { tracaebleAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/traceable-all-views';
import { workflowRunsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/workflow-runs-all.view';
import { workflowVersionsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/workflow-versions-all.view';
import { workflowsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/workflows-all.view';

import { chargesAllView } from './views/charges-all-views';
import { integrationsAllView } from './views/integrations-all-views';

export const seedViewWithDemoData = async (
  entityManager: EntityManager,
  schemaName: string,
  objectMetadataStandardIdToIdMap: ObjectMetadataStandardIdToIdMap,
) => {
  const viewDefinitions = [
    tracaebleAllView(objectMetadataStandardIdToIdMap),
    linkLogsAllView(objectMetadataStandardIdToIdMap),
    seedCompaniesAllView(objectMetadataStandardIdToIdMap),
    peopleAllView(objectMetadataStandardIdToIdMap),
    chargesAllView(objectMetadataStandardIdToIdMap),
    integrationsAllView(objectMetadataStandardIdToIdMap),
    opportunitiesAllView(objectMetadataStandardIdToIdMap),
    opportunitiesByStageView(objectMetadataStandardIdToIdMap),
    notesAllView(objectMetadataStandardIdToIdMap),
    tasksAllView(objectMetadataStandardIdToIdMap),
    tasksAssignedToMeView(objectMetadataStandardIdToIdMap),
    tasksByStatusView(objectMetadataStandardIdToIdMap),
    workflowsAllView(objectMetadataStandardIdToIdMap),
    workflowVersionsAllView(objectMetadataStandardIdToIdMap),
    workflowRunsAllView(objectMetadataStandardIdToIdMap),
  ];

  return createWorkspaceViews(entityManager, schemaName, viewDefinitions);
};
