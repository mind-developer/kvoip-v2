// import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
// import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
// import { FinancialClosing } from 'src/engine/core-modules/financial-closing/financial-closing.entity';
// import { In } from 'typeorm';

// export async function getCompaniesForFinancialClosing(
//     workspaceId: string,
//     twentyORMGlobalManager: TwentyORMGlobalManager,
//     financialClosing: FinancialClosing,
// ): Promise<CompanyWorkspaceEntity[]> {
//     const companiesRepository =
//     await twentyORMGlobalManager.getRepositoryForWorkspace<CompanyWorkspaceEntity>(
//       workspaceId,
//       'company',
//       {
//         shouldBypassPermissionChecks: true,
//       },
//     );

//     const companies = await companiesRepository.find({
//         where: {
//             billingModel: In(financialClosing.billingModelIds),
//         },
//         // relations: {
//         //   person: true,
//         //   company: true,
//         // },
//     });

//     return companies || [];
// }

import fetch from 'node-fetch';
import { XMLParser } from 'fast-xml-parser';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { FinancialClosing } from 'src/engine/core-modules/financial-closing/financial-closing.entity';
import { In } from 'typeorm';
import { Logger } from '@nestjs/common';
import { BillingModelEnum } from 'src/engine/core-modules/financial-closing/constants/billing-model.constants';

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
  companies: CompanyWorkspaceEntity[],
  financialClosing?: FinancialClosing,
): Promise<any[]> {
  const resultados = [];

  for (const company of companies) {

    switch (company.billingModel) {
        
        case BillingModelEnum.PREPAID:
            logger.log(`Calculando consumo para empresa ${company.name} - ${company.id} com modelo PREPAID`);
            break;

        case BillingModelEnum.POSTPAID:

            const cdrId = company?.cdrId;

            if (!cdrId) {
                logger.log(`Empresa ${company?.name} - ${company?.id} não possui CdrId`);
                continue;
            }

            try {
                const consumo = await getAmountToBeChargedByCdrId(cdrId);
                resultados.push({
                    companyId: company.id,
                    cdrId,
                    consumo,
                });

                logger.log(`Consumo para empresa ${company?.name}:`, consumo);

            } catch (error) {
                logger.error(`Erro ao buscar consumo para empresa ${company?.id}:`, error);
            }

            break;

        case BillingModelEnum.PREPAID_UNLIMITED:
            logger.log(`Calculando consumo para empresa ${company.name} - ${company.id} com modelo PREPAID_UNLIMITED`);
            break;

        case BillingModelEnum.POSTPAID_UNLIMITED:
            logger.log(`Calculando consumo para empresa ${company.name} - ${company.id} com modelo POSTPAID_UNLIMITED`);
            break;

        default:   
            logger.warn(`Billing model ${company.billingModel} not implemented for company ${company.id}`);
            continue; // Skip to the next company if billing model is not implemented
    }

  }  

  return resultados;
}


export async function getPrepaidAmountTobeCharged(
    company: CompanyWorkspaceEntity,
    financialClosing?: FinancialClosing
) : Promise<number> {

    // Implement logic to calculate prepaid amount to be charged
    return 0; 
}

export async function getPostpaidAmountTobeCharged(
    company: CompanyWorkspaceEntity,
    financialClosing?: FinancialClosing
) : Promise<number> {

    // Implement logic to calculate postpaid amount to be charged
    return 0; 
}

export async function getPrepaidUnlimitedAmountTobeCharged(
    company: CompanyWorkspaceEntity,
    financialClosing?: FinancialClosing
) : Promise<number> {
    // Implement logic to calculate prepaid unlimited amount to be charged
    return 0; 
}

export async function getPostpaidUnlimitedAmountTobeCharged(
    company: CompanyWorkspaceEntity,
    financialClosing?: FinancialClosing
) : Promise<number> {
    // Implement logic to calculate postpaid unlimited amount to be charged
    return 0; 
}


// ===========================
// Função SOAP
// ===========================
async function getAmountToBeChargedByCdrId(id: string | number) {
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
    const duracaoFormatada = duracaoRaw ? formatDuration(parseFloat(duracaoRaw)) : '';

    const camposPrincipais = {
      total_registros: Number(total_registros),
      total_chamadas,
      cliente_id,
      datahora,
      venda,
      custo,
      duracao: duracaoFormatada,
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

  const totalSegundos = Math.floor(minutosFloat * 60);
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  return `${pad(horas)} Horas, ${pad(minutos)} Minutos, ${pad(segundos)} Segundos`;
}





/*

    tipo de desconto - percent or value     typeDiscount
    quantidade de desconto - float          discount
    quantidades de fechamentos restantes com descontos - int         quantitiesRemainingFinancialClosingsDiscounts
    valor (valor total a ser cobrado de forma fix - sem descontos) - float          totalValueCharged
    valor de gasto minimo - float      valueMinimumMonthly 
    valor mensalidade - float         valuefixedMonthly
    
    dia de vencimento - int (Para o boleto de cobrança)   

*/