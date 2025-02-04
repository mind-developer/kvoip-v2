import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuDefaultSelectionEffect } from '@/command-menu/components/CommandMenuDefaultSelectionEffect';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { COMMAND_MENU_SEARCH_BAR_HEIGHT } from '@/command-menu/constants/CommandMenuSearchBarHeight';
import { COMMAND_MENU_SEARCH_BAR_PADDING } from '@/command-menu/constants/CommandMenuSearchBarPadding';
import { useCommandMenuOnItemClick } from '@/command-menu/hooks/useCommandMenuOnItemClick';
import { useMatchingCommandMenuCommands } from '@/command-menu/hooks/useMatchingCommandMenuCommands';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { Command } from '@/command-menu/types/Command';
import { SelectableItem } from '@/ui/layout/selectable-list/components/SelectableItem';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

export type CommandGroupConfig = {
  heading: string;
  items?: Command[];
};

export const CommandMenu = () => {
  const { onItemClick } = useCommandMenuOnItemClick();

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
      heading: 'Copilot',
      items: copilotCommands,
    },
    {
      heading: 'Record Selection',
      items: matchingStandardActionRecordSelectionCommands,
    },
    {
      heading: 'Workflow Record Selection',
      items: matchingWorkflowRunRecordSelectionCommands,
    },
    {
      heading: 'View',
      items: matchingStandardActionGlobalCommands,
    },
    {
      heading: 'Workflows',
      items: matchingWorkflowRunGlobalCommands,
    },
    {
      heading: 'Navigate',
      items: matchingNavigateCommand,
    },
    {
      heading: 'People',
      items: peopleCommands,
    },
    {
      heading: 'Companies',
      items: companyCommands,
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
    <>
      <CommandMenuDefaultSelectionEffect
        selectableItemIds={selectableItemIds}
      />

      <StyledList>
        <ScrollWrapper
          contextProviderName="commandMenu"
          componentInstanceId={`scroll-wrapper-command-menu`}
        >
          <StyledInnerList isMobile={isMobile}>
            <SelectableList
              selectableListId="command-menu-list"
              selectableItemIdArray={selectableItemIds}
              hotkeyScope={AppHotkeyScope.CommandMenu}
              onEnter={(itemId) => {
                const command = selectableItems.find(
                  (item) => item.id === itemId,
                );

                if (isDefined(command)) {
                  const { to, onCommandClick, shouldCloseCommandMenuOnClick } =
                    command;

                  onItemClick({
                    shouldCloseCommandMenuOnClick,
                    onClick: onCommandClick,
                    to,
                  });
                }
              }}
            >
              {isNoResults && !isLoading && (
                <StyledEmpty>No results found</StyledEmpty>
              )}
              {commandGroups.map(({ heading, items }) =>
                items?.length ? (
                  <CommandGroup heading={heading} key={heading}>
                    {items.map((item) => {
                      return (
                        <SelectableItem itemId={item.id} key={item.id}>
                          <CommandMenuItem
                            key={item.id}
                            id={item.id}
                            Icon={item.Icon}
                            label={item.label}
                            to={item.to}
                            onClick={item.onCommandClick}
                            firstHotKey={item.firstHotKey}
                            secondHotKey={item.secondHotKey}
                            shouldCloseCommandMenuOnClick={
                              item.shouldCloseCommandMenuOnClick
                            }
                          />
                        </SelectableItem>
                      );
                    })}
                  </CommandGroup>
                ) : null,
              )}
            </SelectableList>
          </StyledInnerList>
        </ScrollWrapper>
      </StyledList>
    </>
  );
};
