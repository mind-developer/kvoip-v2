import {
  AutoResolverOpts,
  PagingStrategies,
  ReadResolverOpts,
} from '@ptc-org/nestjs-query-graphql';
import { InterConnection } from 'src/engine/core-modules/inter/integration/inter.entity';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

export const interConnectionAutoResolverOpts: AutoResolverOpts<
  any,
  any,
  unknown,
  unknown,
  ReadResolverOpts<any>,
  PagingStrategies
>[] = [
  {
    EntityClass: InterConnection,
    DTOClass: InterConnection,
    enableTotalCount: true,
    pagingStrategy: PagingStrategies.CURSOR,
    read: {
      many: { disabled: false },
      one: { disabled: false },
    },
    guards: [WorkspaceAuthGuard],
  },
];
