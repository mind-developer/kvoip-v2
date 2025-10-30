import { Injectable, Logger } from '@nestjs/common';

import { InterService } from 'src/engine/core-modules/inter/services/inter.service';

@Injectable()
export class DevOnlyService {
  private readonly logger = new Logger(DevOnlyService.name);

  constructor(private readonly interService: InterService) {}

  async billingPayBill({
    interChargeCode,
  }: {
    interChargeCode: string;
  }): Promise<{ success: boolean }> {
    const result = await this.interService.interSandboxPayBill({
      interChargeCode,
    });

    return result;
  }
}
