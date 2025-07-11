import { Module } from '@nestjs/common';

import { CalendarModule } from 'src/modules/calendar/calendar.module';
import { ChargeModule } from 'src/modules/charges/charge.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { FavoriteFolderModule } from 'src/modules/favorite-folder/favorite-folder.module';
import { FavoriteModule } from 'src/modules/favorite/favorite.module';
import { MessagingModule } from 'src/modules/messaging/messaging.module';
import { SoapClientModule } from 'src/modules/soap-client/soap-client.module';
import { TraceableModule } from 'src/modules/traceable/traceable.module';
import { ViewModule } from 'src/modules/view/view.module';
import { WorkflowModule } from 'src/modules/workflow/workflow.module';

@Module({
  imports: [
    MessagingModule,
    CalendarModule,
    ConnectedAccountModule,
    ViewModule,
    WorkflowModule,
    FavoriteFolderModule,
    FavoriteModule,
    TraceableModule,
    SoapClientModule,
    ChargeModule,
  ],
  providers: [],
  exports: [],
})
export class ModulesModule {}
