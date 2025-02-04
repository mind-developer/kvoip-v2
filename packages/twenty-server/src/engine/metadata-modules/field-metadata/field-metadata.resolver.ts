import { UnauthorizedException, UseFilters, UseGuards } from '@nestjs/common';
import {
  Args,
  Context,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { FieldMetadataType } from 'twenty-shared';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { CreateOneFieldMetadataInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';
import { DeleteOneFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/delete-field.input';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { RelationDefinitionDTO } from 'src/engine/metadata-modules/field-metadata/dtos/relation-definition.dto';
import { UpdateOneFieldMetadataInput } from 'src/engine/metadata-modules/field-metadata/dtos/update-field.input';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { fieldMetadataGraphqlApiExceptionHandler } from 'src/engine/metadata-modules/field-metadata/utils/field-metadata-graphql-api-exception-handler.util';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => FieldMetadataDTO)
@UseFilters(PermissionsGraphqlApiExceptionFilter)
export class FieldMetadataResolver {
  constructor(private readonly fieldMetadataService: FieldMetadataService) {}

  @ResolveField(() => String, { nullable: true })
  async label(
    @Parent() fieldMetadata: FieldMetadataDTO,
    @Context() context: I18nContext,
  ): Promise<string> {
    return this.fieldMetadataService.resolveTranslatableString(
      fieldMetadata,
      'label',
      context.req.headers['x-locale'],
    );
  }

  @ResolveField(() => String, { nullable: true })
  async description(
    @Parent() fieldMetadata: FieldMetadataDTO,
    @Context() context: I18nContext,
  ): Promise<string> {
    return this.fieldMetadataService.resolveTranslatableString(
      fieldMetadata,
      'description',
      context.req.headers['x-locale'],
    );
  }

  @UseGuards(SettingsPermissionsGuard(SettingsPermissions.DATA_MODEL))
  @Mutation(() => FieldMetadataDTO)
  async createOneField(
    @Args('input') input: CreateOneFieldMetadataInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.fieldMetadataService.createOne({
        ...input.field,
        workspaceId,
      });
    } catch (error) {
      fieldMetadataGraphqlApiExceptionHandler(error);
    }
  }

  @UseGuards(SettingsPermissionsGuard(SettingsPermissions.DATA_MODEL))
  @Mutation(() => FieldMetadataDTO)
  async updateOneField(
    @Args('input') input: UpdateOneFieldMetadataInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    try {
      return await this.fieldMetadataService.updateOne(input.id, {
        ...input.update,
        workspaceId,
      });
    } catch (error) {
      fieldMetadataGraphqlApiExceptionHandler(error);
    }
  }

  @UseGuards(SettingsPermissionsGuard(SettingsPermissions.DATA_MODEL))
  @Mutation(() => FieldMetadataDTO)
  async deleteOneField(
    @Args('input') input: DeleteOneFieldInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    if (!workspaceId) {
      throw new UnauthorizedException();
    }

    const fieldMetadata =
      await this.fieldMetadataService.findOneWithinWorkspace(workspaceId, {
        where: {
          id: input.id.toString(),
        },
      });

    if (!fieldMetadata) {
      throw new ValidationError('Field does not exist');
    }

    if (!fieldMetadata.isCustom) {
      throw new ValidationError("Standard Fields can't be deleted");
    }

    if (fieldMetadata.isActive) {
      throw new ValidationError("Active fields can't be deleted");
    }

    if (fieldMetadata.type === FieldMetadataType.RELATION) {
      throw new ValidationError(
        "Relation fields can't be deleted, you need to delete the RelationMetadata instead",
      );
    }

    try {
      return await this.fieldMetadataService.deleteOneField(input, workspaceId);
    } catch (error) {
      fieldMetadataGraphqlApiExceptionHandler(error);
    }
  }

  @ResolveField(() => RelationDefinitionDTO, { nullable: true })
  async relationDefinition(
    @AuthWorkspace() workspace: Workspace,
    @Parent() fieldMetadata: FieldMetadataDTO,
    @Context() context: { loaders: IDataloaders },
  ): Promise<RelationDefinitionDTO | null | undefined> {
    if (fieldMetadata.type !== FieldMetadataType.RELATION) {
      return null;
    }

    try {
      const relationMetadataItem =
        await context.loaders.relationMetadataLoader.load({
          fieldMetadata,
          workspaceId: workspace.id,
        });

      return await this.fieldMetadataService.getRelationDefinitionFromRelationMetadata(
        fieldMetadata,
        relationMetadataItem,
      );
    } catch (error) {
      fieldMetadataGraphqlApiExceptionHandler(error);
    }
  }
}
