import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { COMMAND_MENU_NAVIGATE_COMMANDS } from '@/command-menu/constants/CommandMenuNavigateCommands';
import {
  Command,
  CommandScope,
  CommandType,
} from '@/command-menu/types/Command';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { i18n } from '@lingui/core';

export const useCommandMenuCommands = () => {
  const actionMenuEntries = useRecoilComponentValueV2(
    actionMenuEntriesComponentSelector,
  );

  const navigateCommands = Object.values(COMMAND_MENU_NAVIGATE_COMMANDS);

  const actionRecordSelectionCommands: Command[] = actionMenuEntries
    ?.filter(
      (actionMenuEntry) =>
        actionMenuEntry.type === ActionMenuEntryType.Standard &&
        actionMenuEntry.scope === ActionMenuEntryScope.RecordSelection,
    )
    ?.map((actionMenuEntry) => ({
      id: actionMenuEntry.key,
      label: i18n._(actionMenuEntry.label),
      Icon: actionMenuEntry.Icon,
      onCommandClick: actionMenuEntry.onClick,
      type: CommandType.StandardAction,
      scope: CommandScope.RecordSelection,
      hotKeys: actionMenuEntry.hotKeys,
    }));

  const actionObjectCommands: Command[] = actionMenuEntries
    ?.filter(
      (actionMenuEntry) =>
        actionMenuEntry.type === ActionMenuEntryType.Standard &&
        actionMenuEntry.scope === ActionMenuEntryScope.Object,
    )
    ?.map((actionMenuEntry) => ({
      id: actionMenuEntry.key,
      label: i18n._(actionMenuEntry.label),
      Icon: actionMenuEntry.Icon,
      onCommandClick: actionMenuEntry.onClick,
      type: CommandType.StandardAction,
      scope: CommandScope.Object,
      hotKeys: actionMenuEntry.hotKeys,
    }));

  const actionGlobalCommands: Command[] = actionMenuEntries
    ?.filter(
      (actionMenuEntry) =>
        actionMenuEntry.type === ActionMenuEntryType.Standard &&
        actionMenuEntry.scope === ActionMenuEntryScope.Global,
    )
    ?.map((actionMenuEntry) => ({
      id: actionMenuEntry.key,
      label: i18n._(actionMenuEntry.label),
      Icon: actionMenuEntry.Icon,
      onCommandClick: actionMenuEntry.onClick,
      type: CommandType.StandardAction,
      scope: CommandScope.Global,
      hotKeys: actionMenuEntry.hotKeys,
    }));

  const workflowRunRecordSelectionCommands: Command[] = actionMenuEntries
    ?.filter(
      (actionMenuEntry) =>
        actionMenuEntry.type === ActionMenuEntryType.WorkflowRun &&
        actionMenuEntry.scope === ActionMenuEntryScope.RecordSelection,
    )
    ?.map((actionMenuEntry) => ({
      id: actionMenuEntry.key,
      label: i18n._(actionMenuEntry.label),
      Icon: actionMenuEntry.Icon,
      onCommandClick: actionMenuEntry.onClick,
      type: CommandType.WorkflowRun,
      scope: CommandScope.RecordSelection,
      hotKeys: actionMenuEntry.hotKeys,
    }));

  const workflowRunGlobalCommands: Command[] = actionMenuEntries
    ?.filter(
      (actionMenuEntry) =>
        actionMenuEntry.type === ActionMenuEntryType.WorkflowRun &&
        actionMenuEntry.scope === ActionMenuEntryScope.Global,
    )
    ?.map((actionMenuEntry) => ({
      id: actionMenuEntry.key,
      label: i18n._(actionMenuEntry.label),
      Icon: actionMenuEntry.Icon,
      onCommandClick: actionMenuEntry.onClick,
      type: CommandType.WorkflowRun,
      scope: CommandScope.Global,
      hotKeys: actionMenuEntry.hotKeys,
    }));

  const { loading: isNotesLoading, records: notes } = useFindManyRecords<Note>({
    skip: !isCommandMenuOpened,
    objectNameSingular: CoreObjectNameSingular.Note,
    filter: deferredCommandMenuSearch
      ? makeOrFilterVariables([
          { title: { ilike: `%${deferredCommandMenuSearch}%` } },
          { body: { ilike: `%${deferredCommandMenuSearch}%` } },
        ])
      : undefined,
    limit: 3,
  });

  const { loading: isTasksLoading, records: tasks } = useFindManyRecords<Task>({
    skip: !isCommandMenuOpened,
    objectNameSingular: CoreObjectNameSingular.Task,
    filter: deferredCommandMenuSearch
      ? makeOrFilterVariables([
          { title: { ilike: `%${deferredCommandMenuSearch}%` } },
          { body: { ilike: `%${deferredCommandMenuSearch}%` } },
        ])
      : undefined,
    limit: 3,
  });

  // const { records: charges } = useFindManyRecords({
  //   skip: !isCommandMenuOpened,
  //   objectNameSingular: CoreObjectNameSingular.Charge,
  //   filter: commandMenuSearch
  //     ? {
  //         product: { ilike: `%${commandMenuSearch}%` },
  //       }
  //     : undefined,
  //   limit: 3,
  // });

  // const { records: integrations } = useFindManyRecords({
  //   skip: !isCommandMenuOpened,
  //   objectNameSingular: CoreObjectNameSingular.Integration,
  //   filter: commandMenuSearch
  //     ? {
  //         name: { ilike: `%${commandMenuSearch}%` },
  //       }
  //     : undefined,
  //   limit: 3,
  // });

  const people = matchesSearchFilterObjectRecords.people?.map(
    (people) => people.record,
  );
  const companies = matchesSearchFilterObjectRecords.companies?.map(
    (companies) => companies.record,
  );
  const opportunities = matchesSearchFilterObjectRecords.opportunities?.map(
    (opportunities) => opportunities.record,
  );

  const charges = matchesSearchFilterObjectRecords.charges?.map(
    (charges) => charges.record,
  );

  const integrations = matchesSearchFilterObjectRecords.integrations?.map(
    (integrations) => integrations.record,
  );

  const peopleCommands = useMemo(
    () =>
      people?.map(({ id, name: { firstName, lastName }, avatarUrl }) => ({
        id,
        label: `${firstName} ${lastName}`,
        to: `object/person/${id}`,
        shouldCloseCommandMenuOnClick: true,
        Icon: () => (
          <Avatar
            type="rounded"
            avatarUrl={avatarUrl}
            placeholderColorSeed={id}
            placeholder={`${firstName} ${lastName}`}
          />
        ),
      })),
    [people],
  );

  const chargeCommands = useMemo(
    () =>
      charges.map(({ id, product }) => ({
        id,
        label: product,
        to: `object/charge/${id}`,
        shouldCloseCommandMenuOnClick: true,
        Icon: () => (
          <Avatar
            type="rounded"
            placeholderColorSeed={id}
            placeholder={product ?? ''}
            avatarUrl={null}
          />
        ),
      })),
    [charges],
  );

  const integrationCommands = useMemo(
    () =>
      integrations.map(({ id, name }) => ({
        id,
        label: name,
        to: `object/integration/${id}`,
        shouldCloseCommandMenuOnClick: true,
        Icon: () => (
          <Avatar
            type="rounded"
            placeholderColorSeed={id}
            placeholder={name ?? ''}
            avatarUrl={null}
          />
        ),
      })),
    [integrations],
  );

  const companyCommands = useMemo(
    () =>
      companies?.map((company) => ({
        id: company.id,
        label: company.name ?? '',
        to: `object/company/${company.id}`,
        shouldCloseCommandMenuOnClick: true,
        Icon: () => (
          <Avatar
            placeholderColorSeed={company.id}
            placeholder={company.name}
            avatarUrl={getLogoUrlFromDomainName(
              getCompanyDomainName(company as Company),
            )}
          />
        ),
      })),
    [companies],
  );

  const opportunityCommands = useMemo(
    () =>
      opportunities?.map(({ id, name }) => ({
        id,
        label: name ?? '',
        to: `object/opportunity/${id}`,
        shouldCloseCommandMenuOnClick: true,
        Icon: () => (
          <Avatar
            type="rounded"
            avatarUrl={null}
            placeholderColorSeed={id}
            placeholder={name ?? ''}
          />
        ),
      })),
    [opportunities],
  );

  const noteCommands = useMemo(
    () =>
      notes?.map((note) => ({
        id: note.id,
        label: note.title ?? '',
        to: '',
        onCommandClick: () => openActivityRightDrawer(note.id),
        shouldCloseCommandMenuOnClick: true,
        Icon: IconNotes,
      })),
    [notes, openActivityRightDrawer],
  );

  const tasksCommands = useMemo(
    () =>
      tasks?.map((task) => ({
        id: task.id,
        label: task.title ?? '',
        to: '',
        onCommandClick: () => openActivityRightDrawer(task.id),
        shouldCloseCommandMenuOnClick: true,
        Icon: IconCheckbox,
      })),
    [tasks, openActivityRightDrawer],
  );

  const customObjectRecordsMap = useMemo(() => {
    return Object.fromEntries(
      Object.entries(matchesSearchFilterObjectRecords).filter(
        ([namePlural, records]) =>
          ![
            CoreObjectNamePlural.Person,
            CoreObjectNamePlural.Opportunity,
            CoreObjectNamePlural.Company,
            CoreObjectNamePlural.Charge,
            CoreObjectNamePlural.Integration,
          ].includes(namePlural as CoreObjectNamePlural) && !isEmpty(records),
      ),
    );
  }, [matchesSearchFilterObjectRecords]);

  const customObjectCommands = useMemo(() => {
    const customObjectCommandsArray: Command[] = [];
    Object.values(customObjectRecordsMap).forEach((objectRecords) => {
      customObjectCommandsArray.push(
        ...objectRecords.map((objectRecord) => ({
          id: objectRecord.record.id,
          label: objectRecord.recordIdentifier.name,
          to: `object/${objectRecord.objectMetadataItem.nameSingular}/${objectRecord.record.id}`,
          shouldCloseCommandMenuOnClick: true,
          Icon: () => (
            <Avatar
              type="rounded"
              avatarUrl={objectRecord.record.avatarUrl}
              placeholderColorSeed={objectRecord.record.id}
              placeholder={objectRecord.recordIdentifier.name ?? ''}
            />
          ),
        })),
      );
    });

    return customObjectCommandsArray;
  }, [customObjectRecordsMap]);

  const isLoading = loading || isNotesLoading || isTasksLoading;

  return {
    navigateCommands,
    actionRecordSelectionCommands,
    actionGlobalCommands,
    actionObjectCommands,
    workflowRunRecordSelectionCommands,
    workflowRunGlobalCommands,
    peopleCommands,
    companyCommands,
    opportunityCommands,
    noteCommands,
    chargeCommands,
    integrationCommands,
    tasksCommands,
    customObjectCommands,
    isLoading,
  };
};
