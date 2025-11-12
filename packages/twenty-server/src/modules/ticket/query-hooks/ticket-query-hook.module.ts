/* @kvoip-woulz proprietary:begin */
import { Module } from '@nestjs/common';
import { TicketCreateOnePreQueryHook } from 'src/modules/ticket/query-hooks/ticket-create-one.pre-query.hook';

import { TicketUpdateOnePreQueryHook } from 'src/modules/ticket/query-hooks/ticket-update-one.pre-query.hook';

@Module({
  providers: [TicketUpdateOnePreQueryHook, TicketCreateOnePreQueryHook],
})
export class TicketQueryHookModule {}
/* @kvoip-woulz proprietary:end */
