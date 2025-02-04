import {
  IconBuildingSkyscraper,
  IconCheckbox,
  IconSettings,
  IconTargetArrow,
  IconUser,
} from 'twenty-ui';

import { Command, CommandType } from '../types/Command';

export const COMMAND_MENU_NAVIGATE_COMMANDS: { [key: string]: Command } = {
  people: {
    id: 'go-to-people',
    to: '/objects/people',
    label: 'Go to People',
    type: CommandType.Navigate,
    hotKeys: ['G', 'P'],
    Icon: IconUser,
    shouldCloseCommandMenuOnClick: true,
  },
  companies: {
    id: 'go-to-companies',
    to: '/objects/companies',
    label: 'Go to Companies',
    type: CommandType.Navigate,
    hotKeys: ['G', 'C'],
    Icon: IconBuildingSkyscraper,
    shouldCloseCommandMenuOnClick: true,
  },
  opportunities: {
    id: 'go-to-activities',
    to: '/objects/opportunities',
    label: 'Go to Opportunities',
    type: CommandType.Navigate,
    hotKeys: ['G', 'O'],
    Icon: IconTargetArrow,
    shouldCloseCommandMenuOnClick: true,
  },
  settings: {
    id: 'go-to-settings',
    to: '/settings/profile',
    label: 'Go to Settings',
    type: CommandType.Navigate,
    hotKeys: ['G', 'S'],
    Icon: IconSettings,
    shouldCloseCommandMenuOnClick: true,
  },
  tasks: {
    id: 'go-to-tasks',
    to: '/objects/tasks',
    label: 'Go to Tasks',
    type: CommandType.Navigate,
    hotKeys: ['G', 'T'],
    Icon: IconCheckbox,
    shouldCloseCommandMenuOnClick: true,
  },
};
