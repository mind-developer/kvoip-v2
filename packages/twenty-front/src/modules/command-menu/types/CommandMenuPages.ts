import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

export enum CommandMenuPages {
  Root = 'root',
  ViewRecord = 'view-record',
  ViewEmailThread = 'view-email-thread',
  ViewCalendarEvent = 'view-calendar-event',
  EditRichText = 'edit-rich-text',
  Copilot = 'copilot',
  WorkflowStepSelectTriggerType = 'workflow-step-select-trigger-type',
  WorkflowStepSelectAction = 'workflow-step-select-action',
  WorkflowStepView = 'workflow-step-view',
  WorkflowStepEdit = 'workflow-step-edit',
  WorkflowRunStepView = 'workflow-run-step-view',
  SearchRecords = 'search-records',
  ChatbotFlow = 'chatbot-flow',
  ChatbotFlowStepEdit = 'chatbot-flow-step-edit',
  Traceable = CoreObjectNameSingular.Traceable,
  Ticket = 'ticket',
}
