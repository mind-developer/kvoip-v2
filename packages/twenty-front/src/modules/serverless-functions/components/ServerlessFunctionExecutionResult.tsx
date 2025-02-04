import styled from '@emotion/styled';

import { useTheme } from '@emotion/react';
import { ServerlessFunctionExecutionStatus } from '~/generated-metadata/graphql';
import {
  CodeEditor,
  CoreEditorHeader,
  IconSquareRoundedCheck,
  IconSquareRoundedX,
  IconLoader,
  AnimatedCircleLoading,
} from 'twenty-ui';
import { LightCopyIconButton } from '@/object-record/record-field/components/LightCopyIconButton';
import {
  DEFAULT_OUTPUT_VALUE,
  ServerlessFunctionTestData,
} from '@/workflow/states/serverlessFunctionTestDataFamilyState';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

type OutputAccent = 'default' | 'success' | 'error';

const StyledInfoContainer = styled.div`
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
`;

const StyledOutput = styled.div<{ accent?: OutputAccent }>`
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme, status }) =>
    status === ServerlessFunctionExecutionStatus.Success
      ? theme.color.turquoise
      : accent === 'error'
        ? theme.color.red
        : theme.font.color.secondary};
  display: flex;
`;

export const ServerlessFunctionExecutionResult = ({
  serverlessFunctionTestData,
  isTesting = false,
}: {
  serverlessFunctionTestData: ServerlessFunctionTestData;
  isTesting?: boolean;
}) => {
  const theme = useTheme();

  const result =
    serverlessFunctionTestData.output.data ||
    serverlessFunctionTestData.output.error ||
    '';

  const leftNode =
    serverlessFunctionTestData.output.data === DEFAULT_OUTPUT_VALUE ? (
      'Output'
    ) : (
      <StyledOutput status={serverlessFunctionTestData.output.status}>
        <IconSquareRoundedCheck size={theme.icon.size.md} />
        {serverlessFunctionTestData.output.status ===
        ServerlessFunctionExecutionStatus.Success
          ? '200 OK'
          : '500 Error'}
        {' - '}
        {serverlessFunctionTestData.output.duration}ms
      </StyledOutput>
    );

  return (
    <StyledContainer>
      <CoreEditorHeader
        leftNodes={[computeLeftNode()]}
        rightNodes={[<LightCopyIconButton copyText={result} />]}
      />
      <CodeEditor
        value={result}
        language={serverlessFunctionTestData.language}
        height={serverlessFunctionTestData.height}
        options={{ readOnly: true, domReadOnly: true }}
        isLoading={isTesting}
        withHeader
      />
    </StyledContainer>
  );
};
