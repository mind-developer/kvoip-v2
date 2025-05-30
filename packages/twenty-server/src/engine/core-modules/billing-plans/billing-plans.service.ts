import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { BillingPlans } from 'src/engine/core-modules/billing-plans/billing-plans.entity';
import { CreateBillingPlansInput } from 'src/engine/core-modules/billing-plans/dtos/create-billing-plans.input';
import { UpdateBillingPlansInput } from 'src/engine/core-modules/billing-plans/dtos/update-billing-plans.input';
import { OnboardingService } from 'src/engine/core-modules/onboarding/onboarding.service';
import { User } from 'src/engine/core-modules/user/user.entity';

@Injectable()
export class BillingPlansService {
  constructor(
    @InjectRepository(BillingPlans, 'core')
    private billingPlansRepository: Repository<BillingPlans>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly twentyConfigService: TwentyConfigService,
    // private readonly onboardingService: OnboardingService,
    @InjectRepository(User, 'core')
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createInput: CreateBillingPlansInput): Promise<BillingPlans> {
    const currentWorkspace = await this.workspaceRepository.findOne({
      where: { id: createInput.workspaceId },
    });

    if (!currentWorkspace) {
      throw new Error('Workspace not found');
    }

    const createdPlan = this.billingPlansRepository.create({
      ...createInput,
      workspace: currentWorkspace,
    });

    await this.billingPlansRepository.save(createdPlan);

    return createdPlan;
  }

  async savePlanId(
    planId: string,
    workspaceId: string,
    userId: string,
  ): Promise<BillingPlans> {
    const currentWorkspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!currentWorkspace) {
      throw new Error('Workspace not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    const billingPlan = this.billingPlansRepository.create({
      planId,
      workspace: currentWorkspace,
    });

    const savePlan = await this.billingPlansRepository.save(billingPlan);

    // await this.onboardingService.setOnboardingPlanPending({
    //   userId: user?.id || '',
    //   workspaceId,
    //   value: false,
    // });

    // await this.onboardingService.setOnboardingPlanPaymentPending({
    //   userId: user?.id || '',
    //   workspaceId,
    //   value: true,
    // });

    return savePlan;
  }

  async findAll(workspaceId: string): Promise<BillingPlans[]> {
    const result = await this.billingPlansRepository.find({
      where: { workspace: { id: workspaceId } },
      relations: ['workspace'],
    });

    return result;
  }

  async findById(id: string): Promise<BillingPlans | null> {
    return await this.billingPlansRepository.findOne({
      where: { id },
    });
  }

  async update(updateInput: UpdateBillingPlansInput): Promise<BillingPlans> {
    const billingPlans = await this.billingPlansRepository.findOne({
      where: { id: updateInput.id },
    });

    if (!billingPlans) {
      throw new Error('Integration not found');
    }

    const updatedPlan = this.billingPlansRepository.create({
      ...billingPlans,
      ...updateInput,
    });

    await this.billingPlansRepository.save(updatedPlan);

    return updatedPlan;
  }

  async remove(planId: string): Promise<boolean> {
    const billingPlans = await this.billingPlansRepository.findOne({
      where: { planId: planId.toString() },
    });

    if (!billingPlans) {
      throw new Error('Integration not found');
    }

    await this.billingPlansRepository.delete(billingPlans.id);

    return true;
  }
}
