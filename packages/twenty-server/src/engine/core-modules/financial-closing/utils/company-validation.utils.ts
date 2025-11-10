import { msg, t } from '@lingui/core/macro';
import { BadRequestException } from '@nestjs/common';
import { isValidBrazilianState } from 'src/engine/core-modules/financial-closing/constants/nf-constants';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';

export class CompanyValidationUtils {
  /**
   * Valida campos obrigatórios de uma empresa
   * @param company - Entidade da empresa a ser validada
   */
  static validateRequiredFields(
    company: CompanyWorkspaceEntity, 
  ): void {
    // Campos obrigatórios do objeto CompanyWorkspaceEntity
    const requiredFields = [
      'cpfCnpj', 
      'name', 
      'address', 
      'address.addressNumber', 
      'address.addressStreet1', 
      'address.addressCity', 
      'address.addressState', 
      'address.addressPostcode', 
      'emails.primaryEmail'
    ];

    const getNestedValue = (obj: any, path: string): any => {
      return path.split('.').reduce((current, key) => current?.[key], obj);
    };

    const getFieldLabel = (fieldPath: string): string => {
      // Para campos simples (sem ponto)
      if (!fieldPath.includes('.')) {
        const fieldMetadata = metadataArgsStorage
          .filterFields(CompanyWorkspaceEntity)
          .find(field => field.name === fieldPath);
        const label = fieldMetadata?.label;
        return typeof label === 'string' ? label : fieldPath;
      }

      // Para campos aninhados (com ponto)
      const [parentField, childField] = fieldPath.split('.');
      
      // Busca o campo pai na entidade
      const parentFieldMetadata = metadataArgsStorage
        .filterFields(CompanyWorkspaceEntity)
        .find(field => field.name === parentField);
      
      if (!parentFieldMetadata) {
        return fieldPath;
      }

      // Para campos de endereço
      if (parentField === 'address') {
        const addressLabels: Record<string, string> = {
          'addressNumber': `Número`,
          'addressStreet1': `Rua`,
          'addressStreet2': `Complemento`,
          'addressCity': `Cidade`,
          'addressState': `Estado`,
          'addressPostcode': `CEP`
        };
        return `${addressLabels[childField] || childField}`;
      }

      // Para campos de email
      if (parentField === 'emails') {
        const emailLabels: Record<string, string> = {
          'primaryEmail': `Email`
        };
        return `${emailLabels[childField] || childField}`;
      }

      return `${childField}`;
    };

    const missingFields = requiredFields.filter(field => !getNestedValue(company, field));

    if (missingFields.length > 0) {
      const missingFieldLabels = missingFields.map(field => getFieldLabel(field));
      throw new Error(
        `A empresa está faltando campos obrigatórios` + ': ' + missingFieldLabels.join(', ')
      );
    }
  }

  /**
   * Valida o formato do CEP
   * @param cep - CEP a ser validado
   */
  static validateCep(cep: string): void {
    if (cep.replace(/\D/g, '').length !== 8) {
      throw new Error(
        `O campo CEP da empresa está incorreto, deve ter 8 números e preferencialmente sem caracteres especiais`
      );
    }
  }

  /**
   * Valida o estado da empresa
   * @param state - Estado da empresa a ser validado
   */
  static validateState(state: string): void {
    if (!isValidBrazilianState(state)) {
      throw new Error(
        `O campo estado da empresa está incorreto, deve ser um estado válido do Brasil (SP, RJ, MG, etc.)`
      );
    }
  }

  /**
   * Valida percentuais de NF (NFCom e NFSe)
   * @param company - Entidade da empresa com os percentuais
   * @param context - Contexto da validação para mensagens de erro mais específicas
   */
  static validateNfPercentages(
    company: CompanyWorkspaceEntity, 
  ): void {
    const percentNfcom = company.percentNfcom || 0;
    const percentNfse = company.percentNfse || 0;
    const totalPercent = percentNfcom + percentNfse;

    // Verificar se pelo menos um percentual está preenchido
    if (percentNfcom <= 0 && percentNfse <= 0) {
      throw new Error(
        `Pelo menos um percentual de NF deve ser preenchido para a empresa (percentNfcom ou percentNfse)`
      );
    }

    // Verificar se os percentuais são números válidos
    if (isNaN(percentNfcom) || isNaN(percentNfse)) {
      throw new Error(
        `Os percentuais de NF devem ser números válidos`
      );
    }

    // Verificar se os percentuais estão no range válido (0-100)
    if (percentNfcom < 0 || percentNfcom > 100 || percentNfse < 0 || percentNfse > 100) {
      throw new Error(
        `Os percentuais de NF devem estar entre 0 e 100`
      );
    }

    // Verificar se a soma não excede 100%
    if (totalPercent > 100) {
      throw new Error(
        `A soma dos percentuais de NF não pode exceder 100%. Atual: ` + `${totalPercent}% (NFCom: ${percentNfcom}%, NFSe: ${percentNfse}%)`
      );
    }
  }
}
