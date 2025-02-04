import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { useKeyboardShortcutMenu } from '@/keyboard-shortcut-menu/hooks/useKeyboardShortcutMenu';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilValue } from 'recoil';
import { Key } from 'ts-key-enum';

export const useCommandMenuHotKeys = () => {
  const { closeCommandMenu, toggleCommandMenu, resetCommandMenuContext } =
    useCommandMenu();

  const commandMenuSearch = useRecoilValue(commandMenuSearchState);

  const { closeKeyboardShortcutMenu } = useKeyboardShortcutMenu();

  const commandMenuPage = useRecoilValue(commandMenuPageState);

  useScopedHotkeys(
    'ctrl+k,meta+k',
    () => {
      closeKeyboardShortcutMenu();
      toggleCommandMenu();
    },
    AppHotkeyScope.CommandMenu,
    [closeKeyboardShortcutMenu, toggleCommandMenu],
  );

  useScopedHotkeys(
    ['/'],
    () => {
      openRecordsSearchPage();
    },
    AppHotkeyScope.KeyboardShortcutMenu,
    [openRecordsSearchPage],
    {
      ignoreModifiers: true,
    },
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      goBackFromCommandMenu();
    },
    AppHotkeyScope.CommandMenuOpen,
    [goBackFromCommandMenu],
  );

  useScopedHotkeys(
    [Key.Backspace, Key.Delete],
    () => {
      if (isNonEmptyString(commandMenuSearch)) {
        return;
      }

      if (
        commandMenuPage === CommandMenuPages.Root &&
        !isNonEmptyString(commandMenuSearch)
      ) {
        resetCommandMenuContext();
      }
      if (commandMenuPage !== CommandMenuPages.Root) {
        goBackFromCommandMenu();
      }
    },
    AppHotkeyScope.CommandMenuOpen,
    [
      commandMenuPage,
      commandMenuSearch,
      contextStoreTargetedRecordsRuleComponent,
      goBackFromCommandMenu,
      setGlobalCommandMenuContext,
    ],
    {
      preventDefault: false,
    },
  );
};
