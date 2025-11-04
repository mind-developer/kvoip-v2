import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

import { ValidateFreeTrialDuration } from '../validate-free-trial-duration.decorator';

class TestClass {
  @ValidateFreeTrialDuration({
    message: 'Duration must be greater than 0 when free trial is enabled',
  })
  BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS?: number;

  BILLING_IS_FREE_TRIAL_ENABLED?: boolean;
}

describe('ValidateFreeTrialDuration', () => {
  it('should pass validation when free trial is disabled', () => {
    const testObject = plainToClass(TestClass, {
      BILLING_IS_FREE_TRIAL_ENABLED: false,
      BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS: 0,
    });

    const errors = validateSync(testObject);
    expect(errors).toHaveLength(0);
  });

  it('should pass validation when free trial is enabled and duration is greater than 0', () => {
    const testObject = plainToClass(TestClass, {
      BILLING_IS_FREE_TRIAL_ENABLED: true,
      BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS: 30,
    });

    const errors = validateSync(testObject);
    expect(errors).toHaveLength(0);
  });

  it('should fail validation when free trial is enabled and duration is 0', () => {
    const testObject = plainToClass(TestClass, {
      BILLING_IS_FREE_TRIAL_ENABLED: true,
      BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS: 0,
    });

    const errors = validateSync(testObject);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.validateFreeTrialDuration).toBe(
      'Duration must be greater than 0 when free trial is enabled',
    );
  });

  it('should fail validation when free trial is enabled and duration is negative', () => {
    const testObject = plainToClass(TestClass, {
      BILLING_IS_FREE_TRIAL_ENABLED: true,
      BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS: -5,
    });

    const errors = validateSync(testObject);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.validateFreeTrialDuration).toBe(
      'Duration must be greater than 0 when free trial is enabled',
    );
  });

  it('should fail validation when free trial is enabled and duration is undefined', () => {
    const testObject = plainToClass(TestClass, {
      BILLING_IS_FREE_TRIAL_ENABLED: true,
      BILLING_FREE_TRIAL_WITH_CREDIT_CARD_DURATION_IN_DAYS: undefined,
    });

    const errors = validateSync(testObject);
    expect(errors).toHaveLength(1);
    expect(errors[0].constraints?.validateFreeTrialDuration).toBe(
      'Duration must be greater than 0 when free trial is enabled',
    );
  });
});
