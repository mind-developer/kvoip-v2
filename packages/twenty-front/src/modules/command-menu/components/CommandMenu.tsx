import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { ResetContextToSelectionCommandButton } from '@/command-menu/components/ResetContextToSelectionCommandButton';
import { RESET_CONTEXT_TO_SELECTION } from '@/command-menu/constants/ResetContextToSelection';
import { useMatchingCommandMenuCommands } from '@/command-menu/hooks/useMatchingCommandMenuCommands';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { Command } from '@/command-menu/types/Command';
import { useContextStoreObjectMetadataItemOrThrow } from '@/context-store/hooks/useContextStoreObjectMetadataItemOrThrow';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

export type CommandGroupConfig = {
  heading: string;
  items?: Command[];
};

export const CommandMenu = () => {
  const { t } = useLingui();

  const commandMenuSearch = useRecoilValue(commandMenuSearchState);

  const {
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
  } = useMatchingCommandMenuCommands({
    commandMenuSearch,
  });

  const selectableItems = copilotCommands
    .concat(matchingStandardActionRecordSelectionCommands)
    .concat(matchingWorkflowRunRecordSelectionCommands)
    .concat(matchingStandardActionGlobalCommands)
    .concat(matchingWorkflowRunGlobalCommands)
    .concat(matchingNavigateCommand)
    .concat(peopleCommands)
    .concat(companyCommands)
    .concat(opportunityCommands)
    .concat(noteCommands)
    .concat(tasksCommands)
    .concat(customObjectCommands)
    .concat(chargeCommands)
    .concat(integrationCommands)
    .filter(isDefined);

  const selectableItemIds = selectableItems.map((item) => item.id);

  const commandGroups: CommandGroupConfig[] = [
    {
      heading: t`Record Selection`,
      items: matchingStandardActionRecordSelectionCommands.concat(
        matchingWorkflowRunRecordSelectionCommands,
      ),
    },
    {
      heading: currentObjectMetadataItem?.labelPlural ?? t`Object`,
      items: matchingStandardActionObjectCommands,
    },
    {
      heading: t`Global`,
      items: matchingStandardActionGlobalCommands
        .concat(matchingNavigateCommands)
        .concat(matchingWorkflowRunGlobalCommands),
    },
    {
      heading: t`Search ''${commandMenuSearch}'' with...`,
      items: fallbackCommands,
    },
    {
      heading: 'Opportunities',
      items: opportunityCommands,
    },
    {
      heading: 'Notes',
      items: noteCommands,
    },
    {
      heading: 'Tasks',
      items: tasksCommands,
    },
    {
      heading: 'Charge',
      items: chargeCommands,
    },
    {
      heading: 'Integration',
      items: integrationCommands,
    },
    {
      heading: 'Custom Objects',
      items: customObjectCommands,
    },
  ];

  return (
    <CommandMenuList
      commandGroups={commandGroups}
      selectableItemIds={selectableItemIds}
      noResults={noResults}
    >
      {isDefined(previousContextStoreCurrentObjectMetadataItemId) && (
        <CommandGroup heading={t`Context`}>
          <SelectableItem itemId={RESET_CONTEXT_TO_SELECTION}>
            <ResetContextToSelectionCommandButton />
          </SelectableItem>
        </CommandGroup>
      )}
    </CommandMenuList>
  );
};
