/* @kvoip-woulz proprietary */
import { BadRequestException, Injectable } from '@nestjs/common';
import { Not } from 'typeorm';

import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type TelephonyWorkspaceEntity } from 'src/modules/telephony/standard-objects/telephony.workspace-entity';
import { type CreateTelephonyHandler } from 'src/modules/telephony/types/Create';
import { type DeleteTelephonyHandler } from 'src/modules/telephony/types/Delete';
import { type GetAllTelephonyHandler } from 'src/modules/telephony/types/GetAll';
import { type FindOneTelephonyHandler } from 'src/modules/telephony/types/GetOne/FindOne.type';
import { type GetTelephonyByMemberHandler } from 'src/modules/telephony/types/GetOne/GetByMember.type';
import { type GetTelephonyByNumberHandler } from 'src/modules/telephony/types/GetOne/GetByNumber.type';
import { type UpdateTelephonyHandler } from 'src/modules/telephony/types/Update';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class TelephonyService {
  constructor(
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

  getTelephonyByMember: GetTelephonyByMemberHandler = async ({ memberId, workspaceId }) => {
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
      where: { memberId },
    });
  };

  getTelephonyByNumber: GetTelephonyByNumberHandler = async ({ numberExtension, workspaceId }) => {
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
      where: { numberExtension },
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

  /**
   * Verifica se um membro já possui um ramal na tabela telephony
   * @param memberId - ID do membro a ser verificado
   * @param workspaceId - ID do workspace
   * @param excludeId - ID do registro a ser excluído da verificação (opcional, para updates)
   * @returns Promise<boolean> - true se o membro já possui um ramal, false caso contrário
   */
  checkMemberHasTelephony: (memberId: string, workspaceId: string, excludeId?: string) => Promise<boolean> = async (
    memberId,
    workspaceId,
    excludeId,
  ) => {
    const telephonyRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<TelephonyWorkspaceEntity>(
        workspaceId,
        'telephony',
        { shouldBypassPermissionChecks: true },
      );

    if (!telephonyRepository) {
      throw new Error('Telephony repository not found');
    }

    let existingTelephony;
    
    if (excludeId) {
      // Se excludeId for fornecido, exclui esse registro da verificação usando Not()
      existingTelephony = await telephonyRepository.findOne({
        where: { 
          memberId,
          id: Not(excludeId),
        },
      });
    } else {
      // Busca normal sem exclusão
      existingTelephony = await telephonyRepository.findOne({
        where: { memberId },
      });
    }

    return !!existingTelephony;
  };
}
