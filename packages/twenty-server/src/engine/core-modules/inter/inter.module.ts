import { Module } from '@nestjs/common';
import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';
import { interConnectionAutoResolverOpts } from 'src/engine/core-modules/inter/inter.auto-resolver-opts';
import { InterConnection } from 'src/engine/core-modules/inter/inter.entity';
import { InterResolver } from 'src/engine/core-modules/inter/inter.resolver';
import { InterService } from 'src/engine/core-modules/inter/services/inter.service';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([InterConnection], 'core'),
        TypeORMModule,
        FileModule,
      ],
      resolvers: interConnectionAutoResolverOpts,
    }),
  ],
  exports: [InterService],
  providers: [InterService, InterResolver],
})
export class InterModule {}
