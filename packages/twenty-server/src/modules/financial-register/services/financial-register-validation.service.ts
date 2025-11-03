/* @kvoip-woulz proprietary */
import { BadRequestException, Injectable } from '@nestjs/common';

import {
  RegisterStatus,
  RegisterType,
} from '../standard-objects/financial-register.workspace-entity';

@Injectable()
export class FinancialRegisterValidationService {
  validateCpfCnpj(cpfCnpj: string): boolean {
    const digitsOnly = cpfCnpj.replace(/\D/g, '');

    if (digitsOnly.length === 11) {
      return this.validateCPF(digitsOnly);
    } else if (digitsOnly.length === 14) {
      return this.validateCNPJ(digitsOnly);
    }

    return false;
  }

  private validateCPF(cpf: string): boolean {
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      return false;
    }

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  }

  private validateCNPJ(cnpj: string): boolean {
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
      return false;
    }

    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    const digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    if (result !== parseInt(digits.charAt(0))) return false;

    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
      sum += parseInt(numbers.charAt(length - i)) * pos--;
      if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
  }

  validatePixKey(pixKey: string): boolean {
    if (/^\d{11}$/.test(pixKey)) {
      return this.validateCPF(pixKey);
    }

    if (/^\d{14}$/.test(pixKey)) {
      return this.validateCNPJ(pixKey);
    }

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pixKey)) {
      return true;
    }

    if (/^\+?55\d{10,11}$/.test(pixKey.replace(/\D/g, ''))) {
      return true;
    }

    if (
      /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
        pixKey,
      )
    ) {
      return true;
    }

    return false;
  }

  validateBarcode(barcode: string): boolean {
    const digitsOnly = barcode.replace(/\D/g, '');

    return digitsOnly.length === 47 || digitsOnly.length === 48;
  }

  validateAmount(amount: number): void {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }
  }

  validateDueDate(dueDate: Date): void {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      throw new BadRequestException('Due date must be in the future');
    }
  }

  validateStatusTransition(
    currentStatus: RegisterStatus,
    newStatus: RegisterStatus,
    registerType: RegisterType,
  ): void {
    if (
      currentStatus === RegisterStatus.PAID &&
      newStatus === RegisterStatus.PENDING
    ) {
      throw new BadRequestException('Cannot revert paid status to pending');
    }

    if (currentStatus === RegisterStatus.CANCELLED) {
      throw new BadRequestException(
        'Cannot change status of cancelled register',
      );
    }

    const receivableOnlyStatuses = [
      RegisterStatus.DO_NOT_PAY,
      RegisterStatus.BANK_RELEASE,
      RegisterStatus.DISPUTED,
    ];

    if (
      registerType === RegisterType.PAYABLE &&
      receivableOnlyStatuses.includes(newStatus)
    ) {
      throw new BadRequestException(
        `Status ${newStatus} is only valid for receivables`,
      );
    }
  }
}
