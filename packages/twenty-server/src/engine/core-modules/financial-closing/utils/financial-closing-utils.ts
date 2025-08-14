import fetch from 'node-fetch';
import { XMLParser } from 'fast-xml-parser';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { FinancialClosing } from 'src/engine/core-modules/financial-closing/financial-closing.entity';
import { In } from 'typeorm';
import { Logger } from '@nestjs/common';
import { BillingModelEnum } from 'src/engine/core-modules/financial-closing/constants/billing-model.constants';
import { CurrencyMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/currency.composite-type';
import { TypeDiscountEnum } from 'src/engine/core-modules/financial-closing/constants/type-discount.constants';

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
): Promise<any[]> {
  const results = [];

  for (const company of companies) {

    let companyConsuption = 0;

    switch (company.billingModel) {
        
        case BillingModelEnum.PREPAID:
            
            const errorMsgPrepaid = validateCompanyBillingModel(company, ['valueFixedMonthly', 'valueMinimumMonthly']);
            if (errorMsgPrepaid) {
              logger.log(errorMsgPrepaid);
              continue;
            }

            try {
                companyConsuption = await getPrepaidAmountTobeCharged(workspaceId, twentyORMGlobalManager, company, financialClosing);
            } catch (error) {
                logger.error(`Erro ao buscar consumo para empresa ${company?.id}:`, error);
            }

            break;

        case BillingModelEnum.POSTPAID:

            const errorMsgPostpaid = validateCompanyBillingModel(company, ['cdrId']);
            if (errorMsgPostpaid) {
              logger.log(errorMsgPostpaid);
              continue;
            }

            try {
                companyConsuption = await getPostpaidAmountTobeCharged(workspaceId, twentyORMGlobalManager, company, financialClosing);
            } catch (error) {
                logger.error(`Erro ao buscar consumo para empresa ${company?.id}:`, error);
            }

            break;

        case BillingModelEnum.PREPAID_UNLIMITED:
          
            const errorMsgPrepaidUnlimited = validateCompanyBillingModel(company, ['valueFixedMonthly']);
            if (errorMsgPrepaidUnlimited) {
              logger.log(errorMsgPrepaidUnlimited);
              continue;
            }

            try {
                companyConsuption = await getPrepaidUnlimitedAmountTobeCharged(workspaceId, twentyORMGlobalManager, company, financialClosing);
            } catch (error) {
                logger.error(`Erro ao buscar consumo para empresa ${company?.id}:`, error);
            }

            break;

        case BillingModelEnum.POSTPAID_UNLIMITED:
            
            const errorMsgPostpaidUnlimited = validateCompanyBillingModel(company, ['valueFixedMonthly']);
            if (errorMsgPostpaidUnlimited) {
              logger.log(errorMsgPostpaidUnlimited);
              continue;
            }

            try {
                companyConsuption = await getPostpaidUnlimitedAmountTobeCharged(workspaceId, twentyORMGlobalManager, company, financialClosing);
            } catch (error) {
                logger.error(`Erro ao buscar consumo para empresa ${company?.id}:`, error);
            }

            break;

        default:   
            logger.log(`Modelo de faturamento desconhecido para a empresa ${company.name} - ${company.id}`);
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

function validateCompanyBillingModel(company: CompanyWorkspaceEntity, requiredFields: (keyof CompanyWorkspaceEntity)[]): string | null {
  for (const field of requiredFields) {
    if (!company[field]) {
      return `Não foi possível calcular o consumo para a empresa ${company.name} - ${company.id} pois não possui ${field} configurado`;
    }
  }
  return null;
}