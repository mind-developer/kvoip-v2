// module/charge/charge.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FocusNFeService } from 'src/modules/charges/focusNFe/FocusNFeService';

import { ChargeEventListener } from './charge.listener';

import { InterApiService } from './inter/inter-api.service';

@Module({
  imports: [TypeOrmModule.forFeature([InterIntegration, Workspace], 'core')],
  providers: [ChargeEventListener, InterApiService, FocusNFeService],
  exports: [InterApiService],
})
export class ChargeModule {}
