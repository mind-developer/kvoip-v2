import { type EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { KVOIP_ADMIN_ALL_VIEWS } from 'src/engine/core-modules/kvoip-admin/standard-objects/views/get-all-kvoip-admin-views';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ViewDefinition } from 'src/engine/workspace-manager/standard-objects-prefill-data/types/view-definition.interface';
import { chargesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/charges-all-views';
import { chatbotsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/chatbot-all-views';
import { companiesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/companies-all.view';
import { customAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/custom-all.view';
import { dashboardsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/dashboards-all.view';
import { integrationsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/integrations-all-views';
import { invoiceAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/invoice-all-views';
import { notesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/notes-all.view';
import { opportunitiesAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/opportunities-all.view';
import { opportunitiesByStageView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/opportunity-by-stage.view';
import { peopleAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/people-all.view';
import { productsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/products-all-views';
import { supportAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/support-all-views';
import { tasksAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/tasks-all.view';
import { tasksAssignedToMeView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/tasks-assigned-to-me';
import { tasksByStatusView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/tasks-by-status.view';
import { tracaebleAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/traceable-all-views';
import { workflowRunsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/workflow-runs-all.view';
import { workflowVersionsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/workflow-versions-all.view';
import { workflowsAllView } from 'src/engine/workspace-manager/standard-objects-prefill-data/views/workflows-all.view';

export const prefillViews = async (
  entityManager: EntityManager,
  schemaName: string,
  objectMetadataItems: ObjectMetadataEntity[],
  featureFlags?: Record<string, boolean>,
  prefillAdminViews = false,
) => {
  const customObjectMetadataItems = objectMetadataItems.filter(
    (item) => item.isCustom,
  );

  const customViews = customObjectMetadataItems.map((item) =>
    customAllView(item),
  );

  const views = [
    companiesAllView(objectMetadataItems),
    peopleAllView(objectMetadataItems),
    opportunitiesAllView(objectMetadataItems),
    opportunitiesByStageView(objectMetadataItems),
    notesAllView(objectMetadataItems),
    tasksAllView(objectMetadataItems),
    tasksAssignedToMeView(objectMetadataItems),
    tasksByStatusView(objectMetadataItems),
    workflowsAllView(objectMetadataItems),
    workflowVersionsAllView(objectMetadataItems),
    workflowRunsAllView(objectMetadataItems),
    chargesAllView(objectMetadataItems),
    integrationsAllView(objectMetadataItems),
    chatbotsAllView(objectMetadataItems),
    supportAllView(objectMetadataItems),
    tracaebleAllView(objectMetadataItems),
    productsAllView(objectMetadataItems),
    invoiceAllView(objectMetadataItems),
    // Kvoip admin views
    ...(prefillAdminViews
      ? KVOIP_ADMIN_ALL_VIEWS.map((view) => view(objectMetadataItems))
      : []),
    ...customViews,
  ];

  if (featureFlags?.[FeatureFlagKey.IS_PAGE_LAYOUT_ENABLED]) {
    views.push(dashboardsAllView(objectMetadataItems));
  }

  return createWorkspaceViews(entityManager, schemaName, views);
};

const createWorkspaceViews = async (
  entityManager: EntityManager,
  schemaName: string,
  viewDefinitions: ViewDefinition[],
) => {
  const viewDefinitionsWithId = viewDefinitions.map((viewDefinition) => ({
    ...viewDefinition,
    id: v4(),
  }));

  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.view`, [
      'id',
      'name',
      'objectMetadataId',
      'type',
      'key',
      'position',
      'icon',
      'openRecordIn',
      'kanbanFieldMetadataId',
      'kanbanAggregateOperation',
      'kanbanAggregateOperationFieldMetadataId',
    ])
    .values(
      viewDefinitionsWithId.map(
        ({
          id,
          name,
          objectMetadataId,
          type,
          key,
          position,
          icon,
          openRecordIn,
          kanbanFieldMetadataId,
          kanbanAggregateOperation,
          kanbanAggregateOperationFieldMetadataId,
        }) => ({
          id,
          name: name as string,
          objectMetadataId,
          type,
          key,
          position,
          icon,
          openRecordIn,
          kanbanFieldMetadataId,
          kanbanAggregateOperation,
          kanbanAggregateOperationFieldMetadataId,
        }),
      ),
    )
    .returning('*')
    .execute();

  for (const viewDefinition of viewDefinitionsWithId) {
    if (viewDefinition.fields && viewDefinition.fields.length > 0) {
      await entityManager
        .createQueryBuilder()
        .insert()
        .into(`${schemaName}.viewField`, [
          'fieldMetadataId',
          'position',
          'isVisible',
          'size',
          'viewId',
          'aggregateOperation',
        ])
        .values(
          viewDefinition.fields.map((field) => ({
            fieldMetadataId: field.fieldMetadataId,
            position: field.position,
            isVisible: field.isVisible,
            size: field.size,
            viewId: viewDefinition.id,
            aggregateOperation: field.aggregateOperation,
          })),
        )
        .execute();
    }

    if (viewDefinition.filters && viewDefinition.filters.length > 0) {
      await entityManager
        .createQueryBuilder()
        .insert()
        .into(`${schemaName}.viewFilter`, [
          'fieldMetadataId',
          'displayValue',
          'operand',
          'value',
          'viewId',
        ])
        .values(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          viewDefinition.filters.map((filter: any) => ({
            fieldMetadataId: filter.fieldMetadataId,
            displayValue: filter.displayValue,
            operand: filter.operand,
            value: filter.value,
            viewId: viewDefinition.id,
          })),
        )
        .execute();
    }

    if (
      'groups' in viewDefinition &&
      viewDefinition.groups &&
      viewDefinition.groups.length > 0
    ) {
      await entityManager
        .createQueryBuilder()
        .insert()
        .into(`${schemaName}.viewGroup`, [
          'fieldMetadataId',
          'isVisible',
          'fieldValue',
          'position',
          'viewId',
        ])
        .values(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          viewDefinition.groups.map((group: any) => ({
            fieldMetadataId: group.fieldMetadataId,
            isVisible: group.isVisible,
            fieldValue: group.fieldValue,
            position: group.position,
            viewId: viewDefinition.id,
          })),
        )
        .execute();
    }
  }

  return viewDefinitionsWithId;
};
