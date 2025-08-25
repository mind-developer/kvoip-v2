import { GenericNode, GenericNodeData } from "../types/GenericNode";
import { useRecoilState } from "recoil";
import { chatbotFlowState } from "../state/chatbotFlowState";
import { useSaveChatbotFlowState } from "./useSaveChatbotFlowState";
import { XYPosition, useReactFlow } from "@xyflow/react";

export const useHandleNodeValue = () => {
  const flowState = useRecoilState(chatbotFlowState)[0]
  const saveChatbotFlow = useSaveChatbotFlowState()
  const { updateNodeData } = useReactFlow()

  const saveDataValue = (key: keyof GenericNodeData, value: any, node: GenericNode) => {
    if (!flowState) throw new Error(`Could not find flow state to update: ${useRecoilState(chatbotFlowState)}`)
    const newFlow = { nodes: [...flowState.nodes.filter(filterNode => filterNode.id !== node.id), { ...node, data: { ...node.data, [key]: value } }], edges: [...flowState.edges], chatbotId: flowState.chatbotId }
    updateNodeData(node.id, { ...node.data, [key]: value })
    saveChatbotFlow(newFlow)
  }

  const savePositionValue = (position: XYPosition, node: GenericNode) => {
    if (!flowState) throw new Error(`Could not find flow state to update: ${flowState}`)
    const newFlow = { nodes: [...flowState.nodes.filter(filterNode => filterNode.id !== node.id), { ...node, position }], edges: [...flowState.edges], chatbotId: flowState.chatbotId }
    updateNodeData(node.id, { ...node.data, position })
    saveChatbotFlow(newFlow)
  };

  return {
    saveDataValue,
    savePositionValue,
  }
}
