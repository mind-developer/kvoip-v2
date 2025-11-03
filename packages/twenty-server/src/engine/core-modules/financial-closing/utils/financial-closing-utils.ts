import { msg } from '@lingui/core/macro';
import { Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';
import fetch from 'node-fetch';
import { BillingModelEnum } from 'src/engine/core-modules/financial-closing/constants/billing-model.constants';
import { TypeDiscountEnum } from 'src/engine/core-modules/financial-closing/constants/type-discount.constants';
import { FinancialClosing } from 'src/engine/core-modules/financial-closing/financial-closing.entity';
import { CurrencyMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/currency.composite-type';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { CompanyFinancialClosingExecutionWorkspaceEntity } from 'src/modules/company-financial-closing-execution/standard-objects/company-financial-closing-execution.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { FinancialClosingExecutionStatusEnum } from 'src/modules/financial-closing-execution/constants/financial-closing-execution-status.constants';
import { In, Repository } from 'typeorm';

const logger = new Logger('FinancialClosingUtils');

export async function getCompaniesForFinancialClosing(
  workspaceId: string,
  twentyORMGlobalManager: TwentyORMGlobalManager,
  financialClosing: FinancialClosing,
): Promise<CompanyWorkspaceEntity[]> {
  const companiesRepository =
    await twentyORMGlobalManager.getRepositoryForWorkspace<CompanyWorkspaceEntity>(
      workspaceId,
      'company',
      {
        shouldBypassPermissionChecks: true,
      },
    );

  const companies = await companiesRepository.find({
    where: {
      billingModel: In(financialClosing.billingModelIds),
    },
  });

  return companies || [];
}

export async function getAmountToBeChargedToCompanies(
  workspaceId: string,
  twentyORMGlobalManager: TwentyORMGlobalManager,
  companies: CompanyWorkspaceEntity[],
  financialClosing?: FinancialClosing,
  companyExecutionRepository?: Repository<CompanyFinancialClosingExecutionWorkspaceEntity>,
  companyExecutions?: Map<string, CompanyFinancialClosingExecutionWorkspaceEntity>
): Promise<any[]> {
  const results = [];

  for (const company of companies) {

    let companyConsuption = 0;

    switch (company.billingModel) {
        
        case BillingModelEnum.PREPAID:
            
            const errorMsgPrepaid = validateCompanyBillingModel(company, ['valueFixedMonthly', 'valueMinimumMonthly']);

            if (errorMsgPrepaid) {              
              if (companyExecutionRepository && companyExecutions) {
                const companyExecution = companyExecutions.get(company.id);
                if (companyExecution) {
                  await addCompanyFinancialClosingExecutionErrorLog(
                    companyExecution,
                    companyExecutionRepository,
                    errorMsgPrepaid,
                    company
                  );
                }
              }
              continue;
            }

            try {
                companyConsuption = await getPrepaidAmountTobeCharged(workspaceId, twentyORMGlobalManager, company, financialClosing);
            } catch (error) {
                if (companyExecutionRepository && companyExecutions) {
                  const companyExecution = companyExecutions.get(company.id);
                  if (companyExecution) {
                    await addCompanyFinancialClosingExecutionErrorLog(
                      companyExecution,
                      companyExecutionRepository,
                      `Erro para calcular o consumo para a empresa` + ' ' + company?.id + ': ' + error.message,
                      company
                    );
                  }
                }
            }
            break;

        case BillingModelEnum.POSTPAID:

            const errorMsgPostpaid = validateCompanyBillingModel(company, ['cdrId']);
            if (errorMsgPostpaid) {
              logger.log(errorMsgPostpaid);
              
              // Se temos os repositórios, usar a função centralizada para log de erro
              if (companyExecutionRepository && companyExecutions) {
                const companyExecution = companyExecutions.get(company.id);
                if (companyExecution) {
                  await addCompanyFinancialClosingExecutionErrorLog(
                    companyExecution,
                    companyExecutionRepository,
                    errorMsgPostpaid,
                    company
                  );
                }
              }
              continue;
            }

            try {
                companyConsuption = await getPostpaidAmountTobeCharged(workspaceId, twentyORMGlobalManager, company, financialClosing);
            } catch (error) {
              if (companyExecutionRepository && companyExecutions) {
                const companyExecution = companyExecutions.get(company.id);
                if (companyExecution) {
                  await addCompanyFinancialClosingExecutionErrorLog(
                    companyExecution,
                    companyExecutionRepository,
                    `Erro para calcular o consumo para a empresa` + ' ' + company?.id + ': ' + error.message,
                    company
                  );
                }
              }
            }
            break;

        case BillingModelEnum.PREPAID_UNLIMITED:
          
            const errorMsgPrepaidUnlimited = validateCompanyBillingModel(company, ['valueFixedMonthly']);
            if (errorMsgPrepaidUnlimited) {
              logger.log(errorMsgPrepaidUnlimited);
              
              // Se temos os repositórios, usar a função centralizada para log de erro
              if (companyExecutionRepository && companyExecutions) {
                const companyExecution = companyExecutions.get(company.id);
                if (companyExecution) {
                  await addCompanyFinancialClosingExecutionErrorLog(
                    companyExecution,
                    companyExecutionRepository,
                    errorMsgPrepaidUnlimited,
                    company
                  );
                }
              }
              continue;
            }

            try {
                companyConsuption = await getPrepaidUnlimitedAmountTobeCharged(workspaceId, twentyORMGlobalManager, company, financialClosing);
            } catch (error) {
              if (companyExecutionRepository && companyExecutions) {
                const companyExecution = companyExecutions.get(company.id);
                if (companyExecution) {
                  await addCompanyFinancialClosingExecutionErrorLog(
                    companyExecution,
                    companyExecutionRepository,
                    `Erro para calcular o consumo para a empresa` + ' ' + company?.id + ': ' + error.message,
                    company
                  );
                }
              }
            }
            break;

        case BillingModelEnum.POSTPAID_UNLIMITED:
            
            const errorMsgPostpaidUnlimited = validateCompanyBillingModel(company, ['valueFixedMonthly']);
            if (errorMsgPostpaidUnlimited) {
              logger.log(errorMsgPostpaidUnlimited);
              
              // Se temos os repositórios, usar a função centralizada para log de erro
              if (companyExecutionRepository && companyExecutions) {
                const companyExecution = companyExecutions.get(company.id);
                if (companyExecution) {
                  await addCompanyFinancialClosingExecutionErrorLog(
                    companyExecution,
                    companyExecutionRepository,
                    errorMsgPostpaidUnlimited,
                    company
                  );
                }
              }
              continue;
            }

            try {
                companyConsuption = await getPostpaidUnlimitedAmountTobeCharged(workspaceId, twentyORMGlobalManager, company, financialClosing);
            } catch (error) {
              if (companyExecutionRepository && companyExecutions) {
                const companyExecution = companyExecutions.get(company.id);
                if (companyExecution) {
                  await addCompanyFinancialClosingExecutionErrorLog(
                    companyExecution,
                    companyExecutionRepository,
                    `Erro para calcular o consumo para a empresa` + ' ' + company?.id + ': ' + error.message,
                    company
                  );
                }
              }
            }
            break;

        default:   
          if (companyExecutionRepository && companyExecutions) {
            const companyExecution = companyExecutions.get(company.id);
            if (companyExecution) {
              await addCompanyFinancialClosingExecutionErrorLog(
                companyExecution,
                companyExecutionRepository,
                `Modelo de cobrança desconhecido para a empresa` + ' ' + company.name + ' - ' + company.id,
                company
              );
            }
          }
          break;
    }

    // caso valor seja 0 ou menor
    if (!companyConsuption) {
      if (companyExecutionRepository && companyExecutions) {
        const companyExecution = companyExecutions.get(company.id);
        if (companyExecution) {
          await addCompanyFinancialClosingExecutionErrorLog(
            companyExecution,
            companyExecutionRepository,
            `O valor a ser cobrado é 0 para a empresa` + ' ' + company.name + ' - ' + company.id,
            company
          );
        }
      }
      continue;
    }

    results.push({
      data: company,
      amountToBeCharged: companyConsuption,
      billingModel: company.billingModel,
    });
  }  

  return results;
}

export async function getPrepaidAmountTobeCharged(
    workspaceId: string,
    twentyORMGlobalManager: TwentyORMGlobalManager,
    company: CompanyWorkspaceEntity,
    financialClosing?: FinancialClosing
) : Promise<number> {

    const valueMinimumMonthly = await getValueInCurrencyData(company.valueMinimumMonthly);
    const valueFixedMonthly = await getValueInCurrencyData(company.valueFixedMonthly);

    let value = valueMinimumMonthly + valueFixedMonthly;

    const valueWithDescount = await getDiscountForCompany(workspaceId, twentyORMGlobalManager, company, value);
    
    return valueWithDescount; 
}

export async function getPostpaidAmountTobeCharged(
    workspaceId: string,
    twentyORMGlobalManager: TwentyORMGlobalManager,
    company: CompanyWorkspaceEntity,
    financialClosing?: FinancialClosing
) : Promise<number> {

    const dateRange = getPreviousMonthDateRange();

    const cdrConsuption = await getAmountToBeChargedByCdrId(company.cdrId ?? '', dateRange.startDate, dateRange.endDate);
    const cdrConsuptionValue = cdrConsuption?.venda ? parseFloat(cdrConsuption.venda) : 0;

    const valueMinimumMonthly = await getValueInCurrencyData(company.valueMinimumMonthly);
    const valueFixedMonthly = await getValueInCurrencyData(company.valueFixedMonthly);

    let value = 0;

    if (cdrConsuptionValue < valueMinimumMonthly) {
        value = valueMinimumMonthly + valueFixedMonthly; 
    } else {
        value = cdrConsuptionValue + valueFixedMonthly;
    }

    const valueWithDescount = await getDiscountForCompany(workspaceId, twentyORMGlobalManager, company, value);

    return valueWithDescount; 
}

export async function getPrepaidUnlimitedAmountTobeCharged(
    workspaceId: string,
    twentyORMGlobalManager: TwentyORMGlobalManager,
    company: CompanyWorkspaceEntity,
    financialClosing?: FinancialClosing
) : Promise<number> {

    const valueFixedMonthly = await getValueInCurrencyData(company.valueFixedMonthly);
    const valueWithDescount = await getDiscountForCompany(workspaceId, twentyORMGlobalManager, company, valueFixedMonthly);
    
    return valueWithDescount; 
}

export async function getPostpaidUnlimitedAmountTobeCharged(
    workspaceId: string,
    twentyORMGlobalManager: TwentyORMGlobalManager,
    company: CompanyWorkspaceEntity,
    financialClosing?: FinancialClosing
) : Promise<number> {

    const valueFixedMonthly = await getValueInCurrencyData(company.valueFixedMonthly);
    const valueWithDescount = await getDiscountForCompany(workspaceId, twentyORMGlobalManager, company, valueFixedMonthly);
    
    return valueWithDescount; 
}


// ===========================
// Função SOAP
// ===========================
async function getAmountToBeChargedByCdrId(id: string | number, startDate?: string, endDate?: string): Promise<any> {
//   const url = 'http://localhost:4000/soap'; // Proxy URL
    const url = "https://log.kvoip.com.br/webservice/index.php";
    // TODO: rever a data de inicio e fim
    // TODO: rever o usuario e senha
    const xml = `
        <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="urn:SoapSiptek">
        <soapenv:Header/>
        <soapenv:Body>
            <ns:buscarConsumoCliente>
            <auth>
                <usuario>kvoip</usuario>
                <senha>kvoip</senha>
            </auth>
            <id_cliente>${id}</id_cliente>
            <data_inicio>2025-07-01 00:00:00</data_inicio>
            <data_final>2025-07-31 23:59:59</data_final>
            </ns:buscarConsumoCliente>
        </soapenv:Body>
        </soapenv:Envelope>
    `;

    try {
        const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml;charset=UTF-8',
            'SOAPAction': 'buscarConsumoCliente',
        },
        body: xml,
        });

        const text = await response.text();
        const parser = new XMLParser({ ignoreAttributes: false });
        const json = parser.parse(text);

        return formatSoapResponse(json);
    } catch (error) {
        // console.error('Erro na requisição SOAP:', error);
        logger.error('Erro na requisição SOAP:', error);
        // throw error;
    }
}

function formatSoapResponse(soapJson: any) {
  try {
    const retorno =
      soapJson['SOAP-ENV:Envelope']['SOAP-ENV:Body']['ns1:buscarConsumoClienteResponse']['return'];

    let item = retorno.list_consumo?.item;
    if (Array.isArray(item)) item = item[0];

    const total_registros = retorno.total_registros?.['#text'] ?? 0;
    const cliente_id = item?.cliente_id?.['#text'] ?? '';
    const total_chamadas = item?.total_chamadas?.['#text'] ?? '';
    const datahora = item?.datahora?.['#text'] ?? '';
    const venda = item?.venda?.['#text'] ?? '';
    const custo = item?.custo?.['#text'] ?? '';
    const duracaoRaw = item?.duracao?.['#text'] ?? '';
    // const duracaoFormatada = duracaoRaw ? formatDuration(parseFloat(duracaoRaw)) : '';

    const camposPrincipais = {
      total_registros: Number(total_registros),
      total_chamadas,
      cliente_id,
      datahora,
      venda,
      custo,
      // duracao: duracaoFormatada,
    };

    const outrosCampos = { ...retorno };
    delete outrosCampos.total_registros;
    delete outrosCampos.list_consumo;

    return {
      ...camposPrincipais,
      OutrosCampos: outrosCampos,
    };
  } catch (error) {
    console.error('Erro ao formatar resposta SOAP:', error);
    return null;
  }
}

function formatDuration(minutosFloat: number) {
  if (!minutosFloat || isNaN(minutosFloat)) return '';

  const totalSeconds = Math.floor(minutosFloat * 60);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secunds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  return `${pad(hours)} Horas, ${pad(minutes)} Minutos, ${pad(secunds)} Segundos`;
}

function getPreviousMonthDateRange(): { startDate: string; endDate: string } {
    const now = new Date();

    // Mês anterior
    const firstDayPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0); // dia 0 do mês atual = último dia do anterior

    // Formatar no padrão "YYYY-MM-DD HH:mm:ss"
    const formatDate = (date: Date, endOfDay = false) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const time = endOfDay ? '23:59:59' : '00:00:00';
        return `${year}-${month}-${day} ${time}`;
    };

    return {
        startDate: formatDate(firstDayPrevMonth, false),
        endDate: formatDate(lastDayPrevMonth, true),
    };
}

export async function getDiscountForCompany(
  workspaceId: string,
  twentyORMGlobalManager: TwentyORMGlobalManager,
  company: CompanyWorkspaceEntity,
  value: number,
): Promise<number> {

  if (!value || !company.typeDiscount || !company.discount || company.quantitiesRemainingFinancialClosingsDiscounts == 0 || company.discount <= 0) {
    return value;
  }

  let valueDiscount = 0;

  if (company.typeDiscount == TypeDiscountEnum.PERCENT) {
    valueDiscount = value * (company.discount / 100);
  } else if (company.typeDiscount == TypeDiscountEnum.VALUE) {
    valueDiscount = company.discount;
  }

  const valueWithDiscount = value - valueDiscount;
  
  if (
    company.quantitiesRemainingFinancialClosingsDiscounts !== null &&
    company.quantitiesRemainingFinancialClosingsDiscounts > 0
  ) {
    const newQuantity = company.quantitiesRemainingFinancialClosingsDiscounts - 1;


    const companiesRepository =
      await twentyORMGlobalManager.getRepositoryForWorkspace<CompanyWorkspaceEntity>(
        workspaceId,
        'company',
        { shouldBypassPermissionChecks: true }
      );

    await companiesRepository.update(company.id, {
      quantitiesRemainingFinancialClosingsDiscounts: newQuantity,
    });

    company.quantitiesRemainingFinancialClosingsDiscounts = newQuantity;
  }

  // logger.log(`Valor com desconto para empresa ${company.name} - ${company.id}: ${valueWithDiscount}, total: ${value}, desconto: ${valueDiscount}, tipo: ${company.typeDiscount}, quantidade restante: ${company.quantitiesRemainingFinancialClosingsDiscounts}`);
  return valueWithDiscount < 0 ? 0 : valueWithDiscount;
}

export async function getValueInCurrencyData(obj: CurrencyMetadata | null | undefined): Promise<number> {

  if (!obj) return 0;

  let amountMicros = obj.amountMicros;

  if (typeof amountMicros === 'string') amountMicros = parseFloat(amountMicros);

  const valueInCurrency = amountMicros / 1000000;

  return valueInCurrency || 0;
}

/**
 * Função centralizada para adicionar logs de erro em empresas com problemas
 * durante o processo de fechamento financeiro
 */
export async function addCompanyFinancialClosingExecutionErrorLog(
  companyExecution: CompanyFinancialClosingExecutionWorkspaceEntity,
  companyExecutionRepository: Repository<CompanyFinancialClosingExecutionWorkspaceEntity>,
  errorMessage: string,
  company?: CompanyWorkspaceEntity,
  morePropsToUpdate?: any
): Promise<void> {
  await addCompanyFinancialClosingExecutionLog(
    companyExecution,
    companyExecutionRepository,
    errorMessage,
    'error',
    FinancialClosingExecutionStatusEnum.ERROR,
    company,
    morePropsToUpdate
  );
}

/**
 * Função centralizada para adicionar logs em empresas durante o processo de fechamento financeiro
 */
export async function addCompanyFinancialClosingExecutionLog(
  companyExecution: CompanyFinancialClosingExecutionWorkspaceEntity,
  companyExecutionRepository: Repository<CompanyFinancialClosingExecutionWorkspaceEntity>,
  message: string,
  level: 'info' | 'error' | 'warn' = 'info',
  status?: FinancialClosingExecutionStatusEnum,
  company?: CompanyWorkspaceEntity,
  morePropsToUpdate?: any
): Promise<void> {
  const logEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
  };

  // Inicializa logs se não existir
  companyExecution.logs = companyExecution.logs ?? [];
  companyExecution.logs.push(logEntry);

  // Log no console baseado no nível
  const logMessage = `${level.toUpperCase()} no fechamento financeiro ${company ? ` para empresa ${company.name} (${company.id})` : ''}: ${message}`;
  
  switch (level) {
    case 'error':
      logger.error(logMessage);
      break;
    case 'warn':
      logger.warn(logMessage);
      break;
    default:
      logger.log(logMessage);
  }

  // Prepara dados para atualização
  const updateData: any = { 
    logs: companyExecution.logs,
    ...morePropsToUpdate
  };
  if (status) {
    updateData.status = status;
    companyExecution.status = status;
  }

  // Salva ou atualiza a execução com o novo log
  if (companyExecution.id) {
    await companyExecutionRepository.update(companyExecution.id, updateData);
  } else {
    Object.assign(companyExecution, updateData);
    const saved = await companyExecutionRepository.save(companyExecution);
    companyExecution.id = saved.id;
  }
}

function getFieldLabel(fieldName: string): string {
  const fieldMetadata = metadataArgsStorage
    .filterFields(CompanyWorkspaceEntity)
    .find(field => field.name === fieldName);
  
  const label = fieldMetadata?.label;
  const result = typeof label === 'string' && label.trim() !== '' ? label : fieldName;
  return result;
}

function validateCompanyBillingModel(company: CompanyWorkspaceEntity, requiredFields: (keyof CompanyWorkspaceEntity)[]): string | null {
  for (const field of requiredFields) {
    const fieldValue = company[field];
    logger.log(`validateCompanyBillingModel - field: ${field}, fieldValue: ${JSON.stringify(fieldValue)}`);
    const fieldLabel = getFieldLabel(field as string);
    logger.log(`validateCompanyBillingModel - fieldLabel: ${fieldLabel}`);
    // Se o campo é um objeto com estrutura de moeda (amountMicros/currencyCode)
    if (typeof fieldValue === 'object' && fieldValue !== null && 'amountMicros' in fieldValue) {
      const currencyField = fieldValue as { amountMicros: string | number | null; currencyCode: string };
      
      // Verifica o valor
      if (!currencyField.amountMicros || currencyField.amountMicros === '0') {
        return `Não foi possível calcular o consumo para a empresa ${company.name} - ${company.id} pois não possui ${fieldLabel} configurado`;
      }
    } else if (!fieldValue) {
      // Para campos que não são de moeda, verifica se é nulo/undefined
      logger.log(`validateCompanyBillingModel - fieldValue is null`);
      return `Não foi possível calcular o consumo para a empresa ${company.name} - ${company.id} pois não possui ${fieldLabel} configurado`;
    }
  }
  return null;
}