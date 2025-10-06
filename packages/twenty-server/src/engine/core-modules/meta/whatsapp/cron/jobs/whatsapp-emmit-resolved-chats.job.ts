import { Logger, Scope } from '@nestjs/common';

import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { WhatsAppDocument } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappDocument';
import { WhatsAppService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';

export type WhatsappEmmitResolvedchatsJobProps = {
  docId: string;
  waDoc: WhatsAppDocument;
};

@Processor({
  queueName: MessageQueue.chargeQueue,
  scope: Scope.REQUEST,
})
export class WhatsappEmmitResolvedchatsJob {
  private readonly logger = new Logger(WhatsappEmmitResolvedchatsJob.name);

  constructor(private readonly whatsAppService: WhatsAppService) {}

  @Process(WhatsappEmmitResolvedchatsJob.name)
  async handle(data: WhatsappEmmitResolvedchatsJobProps): Promise<void> {
    this.logger.warn(`Change chat visibility ${data.docId}`);

    await this.whatsAppService.handleResolvedChatsVisibility(data);
  }
}
