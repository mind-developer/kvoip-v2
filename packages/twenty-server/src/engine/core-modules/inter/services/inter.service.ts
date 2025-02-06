import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { InterConnection } from 'src/engine/core-modules/inter/inter.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InterService extends TypeOrmQueryService<InterConnection> {
  constructor(
    @InjectRepository(InterConnection, 'core')
    private readonly interConnectionRepository: Repository<InterConnection>,
  ) {
    super(interConnectionRepository);
  }
}
