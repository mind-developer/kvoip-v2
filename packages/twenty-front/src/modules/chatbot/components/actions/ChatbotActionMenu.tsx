import { useHandleNodeValue } from '@/chatbot/hooks/useHandleNodeValue';
import { isChatbotActionMenuOpenState } from '@/chatbot/state/isChatbotActionMenuOpen';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import styled from '@emotion/styled';
import { useSetRecoilState } from 'recoil';
import {
  IconFileImport,
  IconHierarchy,
  IconPhoto,
  IconTextSize,
  Label,
} from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

const StyledSelectableList = styled(SelectableList)`
  z-index: 10;
`;
const StyledChatbotActionMenuContainer = styled.div`
  background-color: ${({ theme }) => theme.background.tertiary};
  padding: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  position: absolute;
  top: 0;
  left: 0;
`;

type ChatbotActionMenuProps = {
  cursorPosition?: { x: number; y: number };
};

export const ChatbotActionMenu = ({
  cursorPosition,
}: ChatbotActionMenuProps) => {
  const { addNode } = useHandleNodeValue();
  const setIsChatbotActionMenuOpen = useSetRecoilState(
    isChatbotActionMenuOpenState,
  );

  const closeChatbotActionMenu = () => {
    setIsChatbotActionMenuOpen(false);
  };

  const selectableItemIdArray = [
    'add-text-node',
    'add-image-node',
    'add-file-node',
    'add-contitional-node',
  ];

  return (
    <StyledChatbotActionMenuContainer>
      <StyledSelectableList
        selectableItemIdArray={selectableItemIdArray}
        focusId="cb-cm"
        selectableListInstanceId="=cb-cm"
      >
        <Label>Add a node</Label>
        <SelectableListItem itemId="add-text-node">
          <MenuItem
            onClick={() => {
              addNode('text', cursorPosition);
              closeChatbotActionMenu();
            }}
            LeftIcon={IconTextSize}
            text="+ Text node"
          />
        </SelectableListItem>
        <SelectableListItem itemId="add-image-node">
          <MenuItem
            onClick={() => {
              addNode('image', cursorPosition);
              closeChatbotActionMenu();
            }}
            LeftIcon={IconPhoto}
            text="+ Image node"
          />
        </SelectableListItem>
        <SelectableListItem itemId="add-file-node">
          <MenuItem
            onClick={() => {
              addNode('file', cursorPosition);
              closeChatbotActionMenu();
            }}
            LeftIcon={IconFileImport}
            text="+ File node"
          />
        </SelectableListItem>
        <SelectableListItem itemId="add-conditional-node">
          <MenuItem
            onClick={() => {
              addNode('conditional', cursorPosition);
              closeChatbotActionMenu();
            }}
            LeftIcon={IconHierarchy}
            text="+ Conditional node"
          />
        </SelectableListItem>
      </StyledSelectableList>
    </StyledChatbotActionMenuContainer>
  );
};
