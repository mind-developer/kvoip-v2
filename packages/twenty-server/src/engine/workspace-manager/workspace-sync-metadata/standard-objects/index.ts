import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { ApiKeyWorkspaceEntity } from 'src/modules/api-key/standard-objects/api-key.workspace-entity';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { BlocklistWorkspaceEntity } from 'src/modules/blocklist/standard-objects/blocklist.workspace-entity';
import { CalendarChannelEventAssociationWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel-event-association.workspace-entity';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { CalendarEventWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event.workspace-entity';
import { ChargeWorkspaceEntity } from 'src/modules/charges/standard-objects/charge.workspace-entity';
import { ChatbotWorkspaceEntity } from 'src/modules/chatbot/standard-objects/chatbot.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { FavoriteFolderWorkspaceEntity } from 'src/modules/favorite-folder/standard-objects/favorite-folder.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { FocusNFeWorkspaceEntity } from 'src/modules/focus-nfe/standard-objects/focus-nfe.workspace-entity';
import { IntegrationWorkspaceEntity } from 'src/modules/integrations/standard-objects/integration.workspace-entity';
import { LinkLogsWorkspaceEntity } from 'src/modules/linklogs/standard-objects/linklog.workspace-entity';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { MessageThreadWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-thread.workspace-entity';
import { MessageWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message.workspace-entity';
import { NotaFiscalWorkspaceEntity } from 'src/modules/nota-fiscal/standard-objects/nota-fiscal.workspace.entity';
import { NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';
import { OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { ProductWorkspaceEntity } from 'src/modules/product/standard-objects/product.workspace-entity';
import { SupportWorkspaceEntity } from 'src/modules/support/support.workspace-entity';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { TraceableWorkspaceEntity } from 'src/modules/traceable/standard-objects/traceable.workspace-entity';
import { ViewFieldWorkspaceEntity } from 'src/modules/view/standard-objects/view-field.workspace-entity';
import { ViewFilterGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter-group.workspace-entity';
import { ViewFilterWorkspaceEntity } from 'src/modules/view/standard-objects/view-filter.workspace-entity';
import { ViewGroupWorkspaceEntity } from 'src/modules/view/standard-objects/view-group.workspace-entity';
import { ViewSortWorkspaceEntity } from 'src/modules/view/standard-objects/view-sort.workspace-entity';
import { ViewWorkspaceEntity } from 'src/modules/view/standard-objects/view.workspace-entity';
import { WebhookWorkspaceEntity } from 'src/modules/webhook/standard-objects/webhook.workspace-entity';
import { WhatsappWorkspaceEntity } from 'src/modules/whatsapp-integration/standard-objects/whatsapp-integration.workspace-entity';
import { WorkflowAutomatedTriggerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';
import { OwnerWorkspaceEntity } from 'src/modules/workspaces/standard-objects/owner.workspace-entity';
import { TenantWorkspaceEntity } from 'src/modules/workspaces/standard-objects/tenant.workspace-entity';
import { TelephonyWorkspaceEntity } from 'src/modules/telephony/standard-objects/telephony.workspace-entity';

// Base standard objects that are available in all workspaces
const baseStandardObjectMetadataDefinitions = [
  ApiKeyWorkspaceEntity,
  AttachmentWorkspaceEntity,
  BlocklistWorkspaceEntity,
  CalendarEventWorkspaceEntity,
  CalendarChannelWorkspaceEntity,
  CalendarChannelEventAssociationWorkspaceEntity,
  CalendarEventParticipantWorkspaceEntity,
  CompanyWorkspaceEntity,
  ConnectedAccountWorkspaceEntity,
  FavoriteWorkspaceEntity,
  FavoriteFolderWorkspaceEntity,
  TimelineActivityWorkspaceEntity,
  ViewFieldWorkspaceEntity,
  ViewGroupWorkspaceEntity,
  ViewFilterWorkspaceEntity,
  ViewFilterGroupWorkspaceEntity,
  ViewSortWorkspaceEntity,
  ViewWorkspaceEntity,
  WebhookWorkspaceEntity,
  WorkflowWorkspaceEntity,
  WorkflowVersionWorkspaceEntity,
  WorkflowRunWorkspaceEntity,
  ChatbotWorkspaceEntity,
  WorkflowAutomatedTriggerWorkspaceEntity,
  WorkspaceMemberWorkspaceEntity,
  MessageThreadWorkspaceEntity,
  MessageWorkspaceEntity,
  MessageChannelWorkspaceEntity,
  MessageParticipantWorkspaceEntity,
  MessageFolderWorkspaceEntity,
  MessageChannelMessageAssociationWorkspaceEntity,
  NoteWorkspaceEntity,
  NoteTargetWorkspaceEntity,
  OpportunityWorkspaceEntity,
  PersonWorkspaceEntity,
  TaskWorkspaceEntity,
  TaskTargetWorkspaceEntity,
  ChargeWorkspaceEntity,
  ProductWorkspaceEntity,
  TraceableWorkspaceEntity,
  LinkLogsWorkspaceEntity,
  IntegrationWorkspaceEntity,
  WhatsappWorkspaceEntity,
  SupportWorkspaceEntity,
  FocusNFeWorkspaceEntity,
  NotaFiscalWorkspaceEntity,
  TelephonyWorkspaceEntity,
];

// Admin-specific objects that are only available in the kvoip admin workspace
const adminSpecificObjectMetadataDefinitions: (typeof BaseWorkspaceEntity)[] = [
  TenantWorkspaceEntity,
  OwnerWorkspaceEntity,
];

/**
 * Returns the standard object metadata definitions based on the workspace context
 * This allows for workspace-specific objects to be included conditionally
 */
export function getStandardObjectMetadataDefinitions(
  context: WorkspaceSyncContext,
): (typeof BaseWorkspaceEntity)[] {
  const standardObjects = [...baseStandardObjectMetadataDefinitions];

  // Add admin-specific objects only for the admin workspace
  if (context.featureFlags.IS_KVOIP_ADMIN) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    standardObjects.push(...(adminSpecificObjectMetadataDefinitions as any));
  }

  return standardObjects;
}

// TODO: Maybe we should automate this with the DiscoverService of Nest.JS
// Keep the old export for backward compatibility, but mark as deprecated
export const standardObjectMetadataDefinitions =
  baseStandardObjectMetadataDefinitions;
