import { useCommandMenuCommands } from '@/command-menu/hooks/useCommandMenuCommands';
import { useMatchCommands } from '@/command-menu/hooks/useMatchCommands';

export const useMatchingCommandMenuCommands = ({
  commandMenuSearch,
}: {
  commandMenuSearch: string;
}) => {
  const { matchCommands } = useMatchCommands({ commandMenuSearch });

  const {
    navigateCommands,
    actionRecordSelectionCommands,
    actionObjectCommands,
    actionGlobalCommands,
    workflowRunRecordSelectionCommands,
    workflowRunGlobalCommands,
    peopleCommands,
    chargeCommands,
    integrationCommands,
    companyCommands,
    opportunityCommands,
    noteCommands,
    tasksCommands,
    customObjectCommands,
    isLoading,
  } = useCommandMenuCommands();

  const matchingNavigateCommands = matchCommands(navigateCommands);

  const matchingStandardActionRecordSelectionCommands = matchCommands(
    actionRecordSelectionCommands,
  );

  const matchingStandardActionObjectCommands =
    matchCommands(actionObjectCommands);

  const matchingStandardActionGlobalCommands =
    matchCommands(actionGlobalCommands);

  const matchingWorkflowRunRecordSelectionCommands = matchCommands(
    workflowRunRecordSelectionCommands,
  );

  const matchingWorkflowRunGlobalCommands = matchCommands(
    workflowRunGlobalCommands,
  );

  const noResults =
    !matchingStandardActionRecordSelectionCommands.length &&
    !matchingWorkflowRunRecordSelectionCommands.length &&
    !matchingStandardActionGlobalCommands.length &&
    !matchingWorkflowRunGlobalCommands.length &&
    !matchingNavigateCommand.length &&
    !peopleCommands?.length &&
    !companyCommands?.length &&
    !opportunityCommands?.length &&
    !noteCommands?.length &&
    !tasksCommands?.length &&
    !chargeCommands?.length &&
    !integrationCommands?.length &&
    !customObjectCommands?.length;

  return {
    noResults,
    matchingStandardActionRecordSelectionCommands,
    matchingStandardActionObjectCommands,
    matchingWorkflowRunRecordSelectionCommands,
    matchingStandardActionGlobalCommands,
    matchingWorkflowRunGlobalCommands,
    matchingNavigateCommand,
    peopleCommands,
    companyCommands,
    chargeCommands,
    integrationCommands,
    opportunityCommands,
    noteCommands,
    tasksCommands,
    customObjectCommands,
  };
};
