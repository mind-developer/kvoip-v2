import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { FinancialClosingExecutionWorkspaceEntity } from 'src/modules/financial-closing-execution/standard-objects/financial-closing-execution.workspace-entity';
import { CompanyFinancialClosingExecutionWorkspaceEntity } from 'src/modules/company-financial-closing-execution/standard-objects/company-financial-closing-execution.workspace-entity';

const logger = new Logger('FinancialClosingExecutionUtils');

export async function addFinancialClosingExecutionLog(
  execution: FinancialClosingExecutionWorkspaceEntity | CompanyFinancialClosingExecutionWorkspaceEntity,
  repo: Repository<FinancialClosingExecutionWorkspaceEntity | CompanyFinancialClosingExecutionWorkspaceEntity>,
  level: 'error' | 'warn' | 'info',
  message: string,
): Promise<void> {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  execution.logs = execution.logs ?? [];
  execution.logs.push(entry);

  switch (level) {
    case 'error':
      logger.error(message);
      break;
    case 'warn':
      logger.warn(message);
      break;
    default:
      logger.log(message);
  }

  if (execution.id) {
    await repo.update(execution.id, { logs: execution.logs });
  } else {
    const saved = await repo.save(execution);
    execution.id = saved.id;
  }
}
