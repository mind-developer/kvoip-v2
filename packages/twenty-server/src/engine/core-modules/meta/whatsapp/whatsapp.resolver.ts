import { Args, Query, Resolver } from '@nestjs/graphql';
import { GetWhatsappTemplatesInput } from 'src/engine/core-modules/meta/whatsapp/dtos/get-whatsapp-templates-input.dto';
import { WhatsappTemplatesResponse } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappTemplate';
import { WhatsAppService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';

@Resolver()
export class WhatsappResolver {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Query(() => WhatsappTemplatesResponse)
  async getWhatsappTemplates(
    @Args('input') input: GetWhatsappTemplatesInput,
    @AuthWorkspace() workspace: Workspace,
  ) {
    return this.whatsappService.getWhatsappTemplates(
      input.integrationId,
      workspace.id,
    );
  }
}
