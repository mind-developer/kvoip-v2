import { Module } from '@nestjs/common';

import { CalendarModule } from 'src/modules/calendar/calendar.module';
import { ChargeModule } from 'src/modules/charges/charge.module';
import { ConnectedAccountModule } from 'src/modules/connected-account/connected-account.module';
import { FavoriteFolderModule } from 'src/modules/favorite-folder/favorite-folder.module';
import { FavoriteModule } from 'src/modules/favorite/favorite.module';
import { FinancialClosingExecutionModule } from 'src/modules/financial-closing-execution/financial-closing-execution.module';
import { FinancialRegisterModule } from 'src/modules/financial-register/financial-register.module';
import { MessagingModule } from 'src/modules/messaging/messaging.module';
import { SoapClientModule } from 'src/modules/soap-client/soap-client.module';
import { TraceableModule } from 'src/modules/traceable/traceable.module';
import { ViewModule } from 'src/modules/view/view.module';
import { WorkflowModule } from 'src/modules/workflow/workflow.module';
import { ClientChatMessageModule } from './client-chat-message/client-chat-message.module';

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
    FinancialClosingExecutionModule,
    ClientChatMessageModule,
    FinancialRegisterModule,
  ],
  providers: [],
  exports: [],
})
export class ModulesModule {}
