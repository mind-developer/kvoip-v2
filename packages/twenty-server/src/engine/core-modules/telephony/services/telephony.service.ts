import { BadRequestException, Injectable } from '@nestjs/common';

import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { TelephonyWorkspaceEntity } from 'src/modules/telephony/standard-objects/telephony.workspace-entity';
import { CreateTelephonyHandler } from 'src/modules/telephony/types/Create';
import { DeleteTelephonyHandler } from 'src/modules/telephony/types/Delete';
import { GetAllTelephonyHandler } from 'src/modules/telephony/types/GetAll';
import { FindOneTelephonyHandler } from 'src/modules/telephony/types/GetOne/FindOne.type';
import { UpdateTelephonyHandler } from 'src/modules/telephony/types/Update';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class TelephonyService {
  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  findAll: GetAllTelephonyHandler = async (data) => {
    const telephonyRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<TelephonyWorkspaceEntity>(
        data.workspaceId,
        'telephony',
        { shouldBypassPermissionChecks: true },
      );

    if (!telephonyRepository) {
      throw new Error('Telephony repository not found');
    }

    const telephonys = await telephonyRepository.find({
      order: { createdAt: 'DESC' },
    });

    return telephonys;
  };

  createTelephony: CreateTelephonyHandler = async (data, workspaceId) => {
    const telephonyRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<TelephonyWorkspaceEntity>(
        workspaceId,
        'telephony',
        { shouldBypassPermissionChecks: true },
      );

    if (!telephonyRepository) {
      throw new Error('Telephony repository not found');
    }

    try {
      const createdTelephony = telephonyRepository.create({
        ...data,
      });

      return await telephonyRepository.save(createdTelephony);
    } catch (error) {
      throw new Error(
        'Error creating telephony. Maybe the member already has a number extension or the choosen extension is already in use.',
      );
    }
  };

  findOne: FindOneTelephonyHandler = async ({ id, workspaceId }) => {
    const telephonyRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<TelephonyWorkspaceEntity>(
        workspaceId,
        'telephony',
        { shouldBypassPermissionChecks: true },
      );

    if (!telephonyRepository) {
      throw new Error('Telephony repository not found');
    }

    return await telephonyRepository.findOne({
      where: { id },
    });
  };

  updateTelephony: UpdateTelephonyHandler = async ({
    id,
    workspaceId,
    data,
  }) => {
    const updateTelephonyData = {
      id,
      ...data,
    };

    const telephonyRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<TelephonyWorkspaceEntity>(
        workspaceId,
        'telephony',
        { shouldBypassPermissionChecks: true },
      );

    if (!telephonyRepository) {
      throw new Error('Telephony repository not found');
    }

    const telephony = await telephonyRepository.findOne({
      where: { id },
    });

    return await telephonyRepository.save({
      ...telephony,
      ...updateTelephonyData,
    });
  };

  delete: DeleteTelephonyHandler = async ({ id, workspaceId }) => {
    const telephonyRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<TelephonyWorkspaceEntity>(
        workspaceId,
        'telephony',
        { shouldBypassPermissionChecks: true },
      );

    if (!telephonyRepository) {
      throw new Error('Telephony repository not found');
    }

    const { affected } = await telephonyRepository.delete(id);

    if (!affected)
      throw new BadRequestException(undefined, {
        description: `Error deleting telephony with id ${id}`,
      });

    return affected ? true : false;
  };

  setExtensionNumberInWorkspaceMember = async (
    workspaceId: string,
    memberId: string,
    extensionNumber: string,
  ) => {
    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    if (!workspaceMemberRepository) {
      throw new Error('Workspace member repository not found');
    }

    const member = await workspaceMemberRepository.findOne({
      where: { id: memberId },
    });

    if (!member) {
      throw new BadRequestException(`Workspace member ${memberId} not found`);
    }

    member.extensionNumber = extensionNumber;

    return await workspaceMemberRepository.save(member);
  };

  removeAgentIdInWorkspaceMember = async (
    workspaceId: string,
    memberId: string,
  ) => {
    const workspaceMemberRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
        { shouldBypassPermissionChecks: true },
      );

    if (!workspaceMemberRepository) {
      throw new Error('Workspace member repository not found');
    }

    const member = await workspaceMemberRepository.findOne({
      where: { id: memberId },
    });

    if (!member) {
      throw new BadRequestException(`Workspace member ${memberId} not found`);
    }

    member.extensionNumber = '';

    return await workspaceMemberRepository.save(member);
  };
}
