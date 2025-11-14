/* @kvoip-woulz proprietary */
import styled from '@emotion/styled';
import { Component, type ErrorInfo, type ReactNode } from 'react';

const StyledErrorContainer = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  padding: ${({ theme }) => theme.spacing(2)};
`;

type FieldErrorBoundaryProps = {
  children: ReactNode;
  fieldName?: string;
};

type FieldErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export class FieldErrorBoundary extends Component<
  FieldErrorBoundaryProps,
  FieldErrorBoundaryState
> {
  constructor(props: FieldErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): FieldErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[FieldErrorBoundary] Field rendering error:', {
      fieldName: this.props.fieldName,
      error: error.message,
      errorInfo: errorInfo.componentStack,
      stack: error.stack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <StyledErrorContainer>
          Field error: {this.props.fieldName || 'unknown'}
        </StyledErrorContainer>
      );
    }

    return this.props.children;
  }
}
