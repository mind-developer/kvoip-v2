import { Timeline } from '@/chat/call-center/components/Timeline';
import { InfoSection } from '@/chat/internal/components/InfoSection';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { RightDrawerStepListContainer } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepContainer';
import styled from '@emotion/styled';
// eslint-disable-next-line no-restricted-imports
import { selectedChatState } from '@/chat/call-center/state/selectedChatState';
import { ITimeline, statusEnum } from '@/chat/types/WhatsappDocument';
import { formatDate } from '@/chat/utils/formatDate';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { Person } from '@/people/types/Person';
import { format, parse } from 'date-fns';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
  IconHelp,
  IconIdBadge2,
  IconMail,
  IconPhone,
  IconPlus,
  IconProgressCheck,
  IconUser,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { v4 } from 'uuid';

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${({ theme }) => theme.spacing(13.75)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  position: relative;
`;

const StyledTicketHeader = styled.div`
  font-size: ${({ theme }) => theme.font.size.lg};
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: 600;
`;

const StyledProfileData = styled.div`
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledButtonsContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(3)};
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledTimelineHeader = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: 600;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledTimelineDividerContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledTimelineTitle = styled.div`
  margin: ${({ theme }) => theme.spacing(3)};
  color: ${({ theme }) => theme.font.color.primary};
  white-space: nowrap;
`;

const StyledTimelineDivider = styled.div`
  height: 1px;
  width: 100%;
  margin: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.background.transparent.light};
`;

export const CommandMenuTicketPage = () => {
  const selectedChat = useRecoilValue(selectedChatState);

  const [name, setName] = useState<string>(selectedChat?.client.name ?? '');
  const [email, setEmail] = useState<string>(selectedChat?.client.email ?? '');
  const [phone, setPhone] = useState<string>(selectedChat?.client.phone ?? '');
  const [status, setStatus] = useState<statusEnum>(
    selectedChat?.status ?? statusEnum.Pending,
  );
  const [sector, setSector] = useState<string>(selectedChat?.sector ?? '');

  const [formattedTimeline, setFormattedTimeline] = useState<string[]>([]);

  const { createOneRecord: createOneOpportunity } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Opportunity,
  });

  const { createOneRecord: createOneSupport } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Support,
  });

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Person,
  });

  const handleAddButtonClick = async () => {
    if (!selectedChat) return;
    createOneOpportunity({
      name: name,
      pointOfContactId: selectedChat.personId,
    });
  };

  const handleOpenSupportTicket = async () => {
    const rawPhone = phone || '';
    const callingCode = rawPhone.slice(0, 2);
    const phoneNumber = rawPhone.slice(2);

    await createOneSupport({
      id: v4(),
      name: name,
      emails: { primaryEmail: email, additionalEmails: null },
      phones: {
        primaryPhoneNumber: phoneNumber,
        primaryPhoneCountryCode: 'BR',
        primaryPhoneCallingCode: `+${callingCode}`,
        additionalPhones: null,
      },
      position: 'first',
    });
  };

  const getUniqueFormattedDates = (timeline: ITimeline[]) => {
    const formattedDate = timeline.map((item) => formatDate(item.date).date);
    const uniqueDate = Array.from(new Set(formattedDate));
    return uniqueDate;
  };

  const updatePersonInfo = async (info: keyof Person, value: any) => {
    //todo: add error
    if (!selectedChat?.client.phone || !selectedChat.client.ppUrl) return;
    await updateOneRecord({
      idToUpdate: selectedChat.personId,
      updateOneRecordInput: {
        [info]: value,
      },
    });
  };

  useEffect(() => {
    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (selectedChat) {
      setName(selectedChat.client.name || '');
      setPhone(selectedChat.client.phone || '');
      setStatus(selectedChat.status || '');
      setSector(selectedChat.sector || '');

      const dates = getUniqueFormattedDates(selectedChat.timeline ?? []);
      setFormattedTimeline(dates);
    }
  }, [selectedChat]);

  const getEventsByDate = (date: string) => {
    return (
      selectedChat?.timeline.filter(
        (item) => formatDate(item.date).date === date,
      ) ?? []
    );
  };

  const formatMonthYear = (date: string): string => {
    const formattedDate = parse(date, 'dd/MM/yyyy', new Date());
    return format(formattedDate, 'MMMM yyyy');
  };

  return (
    <RightDrawerStepListContainer>
      <StyledDiv>
        <StyledTicketHeader>{'Service Data'}</StyledTicketHeader>
      </StyledDiv>
      <StyledProfileData>
        <InfoSection
          Icon={IconUser}
          title={'Name'}
          type={'text'}
          value={name}
          onTextChange={(newText) => setName(newText)}
          onBlur={(e) => {
            updatePersonInfo('name', {
              firstName: name.split(' ')[0],
              lastName: name.split(' ').slice(1).join(' '),
            });
          }}
        />
        <InfoSection
          Icon={IconMail}
          title={'Email'}
          type={'text'}
          value={email}
          onTextChange={(newText) => setEmail(newText)}
          onBlur={() => {
            //@ts-ignore
            updatePersonInfo('emails', { primaryEmail: email });
          }}
        />
        <InfoSection
          Icon={IconPhone}
          title={'Phone'}
          type={'text'}
          value={phone}
          onTextChange={(newText) => setPhone(newText)}
          onBlur={() => {
            //@ts-ignore
            //this will cause issues because chats are linked to numbers.
            //they shouldn't.
            updatePersonInfo('phones', {
              primaryPhoneNumber: phone,
              //this should be dynamic
              primaryPhoneCountryCode: 'BR',
              primaryPhoneCallingCode: '55',
            });
          }}
        />
        <InfoSection
          Icon={IconProgressCheck}
          title={'Status'}
          type={'select'}
          value={status}
        />
        <InfoSection
          Icon={IconIdBadge2}
          title={'Sector'}
          type={'select'}
          value={sector}
        />
      </StyledProfileData>
      <StyledButtonsContainer>
        <Button
          Icon={IconPlus}
          title={'Add opportunity'}
          size="medium"
          variant="secondary"
          onClick={handleAddButtonClick}
          to={'/objects/opportunities'}
          target="_blank"
          justify="center"
        />
        <Button
          Icon={IconHelp}
          title={'Open support ticket'}
          size="medium"
          variant="secondary"
          onClick={handleOpenSupportTicket}
          to={'/objects/supports'}
          target="_blank"
          justify="center"
        />
      </StyledButtonsContainer>
      <StyledTimelineHeader>{'Timeline'}</StyledTimelineHeader>
      {formattedTimeline.map((date, index) => (
        <div key={index}>
          <StyledTimelineDividerContainer>
            <StyledTimelineTitle>{formatMonthYear(date)}</StyledTimelineTitle>
            <StyledTimelineDivider />
          </StyledTimelineDividerContainer>
          <div>
            <Timeline data={getEventsByDate(date)} />
          </div>
        </div>
      ))}
    </RightDrawerStepListContainer>
  );
};
