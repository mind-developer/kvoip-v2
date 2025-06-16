import { Body, Controller, Logger, Param, Post } from '@nestjs/common';

@Controller('focus-nfe')
export class FocusNfeController {
  private readonly logger = new Logger(FocusNfeController.name);

  constructor() {}

  @Post('/webhook/:workspaceId/:integrationId/:type')
  async handleWebhook(
    @Param('workspaceId') workspaceId: string,
    @Param('integrationId') integrationId: string,
    @Param('type') type: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Body() body: any,
  ) {
    this.logger.log(
      `[${type}] ${integrationId} - Received incoming Focus NFe data`,
    );

    // TODO: implement logic to change the status of the charge according to the status of the invoice issue
    console.log('body: ', body);
  }
}
