import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import styled from '@emotion/styled';
import { IconLink } from 'twenty-ui';

const StyledMainContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`;

export const TraceableLink = () => {
  return (
    <PageContainer>
      <PageHeader Icon={IconLink} title="Traceable link" />
      <PageBody>
        <StyledMainContainer></StyledMainContainer>
      </PageBody>
    </PageContainer>
  );
};
