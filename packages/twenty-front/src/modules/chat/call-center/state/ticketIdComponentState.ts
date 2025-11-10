import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const ticketIdComponentState = createComponentState<string | undefined>({
  key: 'command-menu/ticket-id',
  defaultValue: undefined,
  componentInstanceContext: CommandMenuPageComponentInstanceContext,
});
