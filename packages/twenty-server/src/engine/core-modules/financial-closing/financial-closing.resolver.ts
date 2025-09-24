import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { CreateFinancialClosingInput } from './dtos/create-financial-closing.input';
import { UpdateFinancialClosingInput } from './dtos/update-financial-closing.input';
import { FinancialClosing } from './financial-closing.entity';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { FinancialClosingService } from 'src/engine/core-modules/financial-closing/financial-closing.service';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => FinancialClosing)
export class FinancialClosingResolver {
  constructor(private readonly financialClosingService: FinancialClosingService) {}

  @Mutation(() => FinancialClosing)
  async createFinancialClosing(
    @Args('createInput') createInput: CreateFinancialClosingInput,
  ): Promise<FinancialClosing> {
    return await this.financialClosingService.create(createInput);
  }

  @Query(() => [FinancialClosing])
  async financialClosingsByWorkspace(
    @Args('workspaceId') workspaceId: string,
  ): Promise<FinancialClosing[]> {
    return await this.financialClosingService.findAll(workspaceId);
  }

  @Query(() => FinancialClosing)
  async financialClosingById(
    @Args('id') id: string,
  ): Promise<FinancialClosing | null> {
    return await this.financialClosingService.findById(id);
  }

  @Mutation(() => FinancialClosing)
  async updateFinancialClosing(
    @Args('updateInput') updateInput: UpdateFinancialClosingInput,
  ): Promise<FinancialClosing> {
    return await this.financialClosingService.update(updateInput);
  }

  @Mutation(() => Boolean)
  async deleteFinancialClosing(@Args('financialClosingId') financialClosingId: string): Promise<boolean> {
    return await this.financialClosingService.delete(financialClosingId);
  }
}
