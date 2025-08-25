import { SelectableList } from "@/ui/layout/selectable-list/components/SelectableList"
import { SelectableListItem } from "@/ui/layout/selectable-list/components/SelectableListItem"
import styled from "@emotion/styled"
import { useReactFlow } from "@xyflow/react"
import { IconTextSize, IconFileImport, IconHierarchy, IconPhoto, Label } from "twenty-ui/display"
import { MenuItem } from "twenty-ui/navigation"


const StyledSelectableList = styled(SelectableList)`
  z-index: 10;
`
const StyledChatbotActionMenuContainer = styled.div`
  background-color: ${({ theme }) => theme.background.quaternary};
  padding: ${({ theme }) => theme.spacing(3)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
`

export const ChatbotActionMenu = () => {
  const selectableItemIdArray = ["add-text-node", "add-image-node", "add-file-node", "add-contitional-node"]
  const { addNodes } = useReactFlow()

  return (
    <StyledChatbotActionMenuContainer>
      <StyledSelectableList selectableItemIdArray={selectableItemIdArray} focusId="cb-cm" selectableListInstanceId="=cb-cm" hotkeyScope="">
        <Label>Add a node</Label>
        <SelectableListItem itemId="add-text-node"><MenuItem LeftIcon={IconTextSize} text="+ Text node" /></SelectableListItem>
        <SelectableListItem itemId="add-text-node"><MenuItem LeftIcon={IconPhoto} text="+ Image node" /></SelectableListItem>
        <SelectableListItem itemId="add-text-node"><MenuItem LeftIcon={IconFileImport} text="+ File node" /></SelectableListItem>
        <SelectableListItem itemId="add-text-node"><MenuItem LeftIcon={IconHierarchy} text="+ Conditional node" /></SelectableListItem>
      </StyledSelectableList>
    </StyledChatbotActionMenuContainer>
  )
}
