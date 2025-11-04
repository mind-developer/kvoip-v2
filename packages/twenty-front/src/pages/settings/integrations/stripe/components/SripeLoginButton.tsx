import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import styled from '@emotion/styled';
import { useState } from 'react';

interface StripeLoginButtonProps {
  onClick: () => void;
}

const Button = styled.button`
  align-items: center;
  background-color: #080808d5;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
  padding: 8px 16px;
  width: 100%;
`;

const CheckBox = styled.input`
  margin-bottom: 30px;
  margin-right: 10px;
  padding: 8px;
`;

const StripeLoginButton = ({ onClick }: StripeLoginButtonProps) => {
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);

  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  return (
    <>
      <CheckBox type="checkbox" onClick={() => setAcceptTerms(!acceptTerms)} />
      <span>I agree to the Terms and Conditions</span>

      <Button
        onClick={() => {
          if (!acceptTerms) {
            enqueueErrorSnackBar({
              message: 'Accept the Terms',
            });
            throw new Error('Accept the Terms');
          }
          onClick();
        }}
      >
        {/* <img src="/images/integrations/stripe-logo.png" width={'24px'} alt="" /> */}
        <span style={{ color: 'white', fontWeight: '600' }}>
          Connect with Stripe
        </span>
      </Button>
    </>
  );
};

export default StripeLoginButton;
