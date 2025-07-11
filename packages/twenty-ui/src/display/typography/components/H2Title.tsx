import styled from '@emotion/styled';
import { OverflowingTextWithTooltip } from '@ui/display/tooltip/OverflowingTextWithTooltip';

type H2TitleProps = {
  title: string;
  description?: string;
  adornment?: React.ReactNode;
  className?: string;
  titleCentered?: boolean;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledTitleContainer = styled.div<{ titleCentered?: boolean }>`
  align-items: center;
  display: flex;
  justify-content: ${({ titleCentered }) =>
    titleCentered ? 'center' : 'start'};
`;

const StyledTitle = styled.h2`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin: 0;
`;

const StyledDescription = styled.h3`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  margin: 0;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const H2Title = ({
  title,
  description,
  adornment,
  className,
  titleCentered = false,
}: H2TitleProps) => (
  <StyledContainer className={className}>
    <StyledTitleContainer titleCentered={titleCentered}>
      <StyledTitle>{title}</StyledTitle>
      {adornment}
    </StyledTitleContainer>
    {description && (
      <StyledDescription>
        <OverflowingTextWithTooltip
          text={description}
          displayedMaxRows={2}
          isTooltipMultiline={true}
        />
      </StyledDescription>
    )}
  </StyledContainer>
);
