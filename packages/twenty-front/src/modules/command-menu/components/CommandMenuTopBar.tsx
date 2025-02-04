import { CommandMenuContextRecordChip } from '@/command-menu/components/CommandMenuContextRecordChip';
import { CommandMenuPages } from '@/command-menu/components/CommandMenuPages';
import { COMMAND_MENU_SEARCH_BAR_HEIGHT } from '@/command-menu/constants/CommandMenuSearchBarHeight';
import { COMMAND_MENU_SEARCH_BAR_PADDING } from '@/command-menu/constants/CommandMenuSearchBarPadding';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { useCommandMenuContextChips } from '@/command-menu/hooks/useCommandMenuContextChips';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useRecoilState, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';
import {
  Button,
  IconChevronLeft,
  IconX,
  getOsControlSymbol,
  useIsMobile,
} from 'twenty-ui';

const StyledInputContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 0;

  display: flex;
  justify-content: space-between;
  font-size: ${({ theme }) => theme.font.size.lg};
  height: ${COMMAND_MENU_SEARCH_BAR_HEIGHT}px;
  margin: 0;
  outline: none;
  position: relative;

  padding: 0 ${({ theme }) => theme.spacing(COMMAND_MENU_SEARCH_BAR_PADDING)};
  gap: ${({ theme }) => theme.spacing(1)};
  flex-shrink: 0;
`;

const StyledInput = styled.input`
  border: none;
  border-radius: 0;
  background-color: transparent;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  margin: 0;
  outline: none;
  height: 24px;
  padding: 0;
  flex: 1;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
    font-weight: ${({ theme }) => theme.font.weight.medium};
  }
`;

const StyledContentContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledCloseButtonWrapper = styled.div<{ isVisible: boolean }>`
  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
`;

export const CommandMenuTopBar = () => {
  const [commandMenuSearch, setCommandMenuSearch] = useRecoilState(
    commandMenuSearchState,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const { t } = useLingui();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommandMenuSearch(event.target.value);
  };

  const isMobile = useIsMobile();

  const { closeCommandMenu, goBackFromCommandMenu } = useCommandMenu();

  const contextStoreCurrentObjectMetadataItemId = useRecoilComponentValueV2(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    COMMAND_MENU_COMPONENT_INSTANCE_ID,
  );

  const commandMenuPage = useRecoilValue(commandMenuPageState);

  return (
    <StyledInputContainer>
      <StyledContentContainer>
        <AnimatePresence>
          {commandMenuPage !== CommandMenuPages.Root && (
            <motion.div
              exit={{ opacity: 0, width: 0 }}
              transition={{
                duration: backButtonAnimationDuration,
              }}
            >
              <CommandMenuContextChip
                Icons={[<IconChevronLeft size={theme.icon.size.sm} />]}
                onClick={goBackFromCommandMenu}
                testId="command-menu-go-back-button"
              />
            </motion.div>
          )}
        </AnimatePresence>
        {isDefined(contextStoreCurrentObjectMetadataItemId) &&
        commandMenuPage !== CommandMenuPages.SearchRecords ? (
          <CommandMenuContextChipGroupsWithRecordSelection
            contextChips={contextChips}
            objectMetadataItemId={contextStoreCurrentObjectMetadataItemId}
          />
        ) : (
          <CommandMenuContextChipGroups contextChips={contextChips} />
        )}
        {commandMenuPage === CommandMenuPages.Root && (
          <StyledInput
            autoFocus
            value={commandMenuSearch}
            placeholder="Type anything"
            onChange={handleSearchChange}
          />
        )}
      </StyledContentContainer>
      {!isMobile && (
        <StyledCloseButtonWrapper isVisible={isButtonVisible}>
          <Button
            Icon={IconX}
            dataTestId="page-header-close-command-menu-button"
            size={'small'}
            variant="secondary"
            accent="default"
            hotkeys={[getOsControlSymbol(), 'K']}
            ariaLabel="Close command menu"
            onClick={closeCommandMenu}
          />
        </StyledCloseButtonWrapper>
      )}
    </StyledInputContainer>
  );
};
