'use client';

import { createId } from '@paralleldrive/cuid2';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useParams } from 'next/navigation';

import { isObjectEmpty } from '@/lib/object';

import { systemLogics } from '../constants';
import {
  AutomationAction,
  AutomationBlueprint,
  AutomationLogicConditionGroup,
  AutomationTrigger,
  NewActionInMiddleProps,
  RefinedIntegrationAction,
  RefinedIntegrationEventTriggerProperties,
  UpdateAutomationTrigger,
  UpdateLogicCondtion,
  WorkflowContextAction,
  WorkflowContextBlueprintInfo,
  WorkflowContextSelectedBlock,
  WorkflowContextWorkflowActionsShape,
} from '../types';
import {
  constructBluePrint,
  constructWorkflowContextBluePrint,
  getParsedFrameworkActions,
  getParsedFrameworkEvents,
  isActionPayloadValid,
  isTriggerPayloadValid,
} from '../utils';

export interface WorkflowContextProps {
  blueprintId: string;
  blueprintInfo: WorkflowContextBlueprintInfo;
  trigger: AutomationTrigger;
  actions: WorkflowContextWorkflowActionsShape;
  updateBlueprintInfo: (info: WorkflowContextBlueprintInfo) => void;
  setBlueprintInfo: (info: WorkflowContextBlueprintInfo) => void;
  updateTrigger: (trigger: UpdateAutomationTrigger) => void;
  setTrigger: (trigger: UpdateAutomationTrigger) => void;
  updateAction: (action: WorkflowContextAction, removeActionId?: string) => AutomationBlueprint;
  removeAction: (actionId: string, deleteOnlyBlock?: boolean) => AutomationBlueprint;
  updateLogicActionCondition: ({ actionId, condition, isNewCondition }: UpdateLogicCondtion) => AutomationBlueprint;
  setActions: (actions: WorkflowContextWorkflowActionsShape) => void;
  frameworkActions: RefinedIntegrationAction[];
  frameworkAction?: RefinedIntegrationAction;
  frameworkEvents: RefinedIntegrationEventTriggerProperties[];
  frameworkEvent?: RefinedIntegrationEventTriggerProperties;
  constructedBlueprint: AutomationBlueprint;
  selectedBlock: WorkflowContextSelectedBlock | undefined;
  setSelectedBlock: (block: WorkflowContextSelectedBlock | undefined) => void;
  addNewBlankAction: (props: NewActionInMiddleProps) => AutomationBlueprint;
  actionsValidityObject: Record<string, { isValid: boolean; message: string }>;
  isTriggerValid: boolean;
  attemptedPublish: boolean;
  setAttempedPublish: (attempted: boolean) => void;
}

export const WorkflowContext = createContext({} as WorkflowContextProps);

export const useWorkflowContext = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflowContext must be used within a WorkflowProvider');
  }
  return context;
};

export const WorkflowProvider = ({
  children,
  serializedFrameworkActions,
  serializedFrameworkEvents,
}: {
  children: React.ReactNode;
  serializedFrameworkActions: string;
  serializedFrameworkEvents: string;
}) => {
  const [blueprintInfo, setBlueprintInfo] = useState<WorkflowContextBlueprintInfo>({} as WorkflowContextBlueprintInfo);
  const [trigger, setTrigger] = useState<AutomationTrigger>({} as AutomationTrigger);
  const [actions, setActions] = useState<WorkflowContextWorkflowActionsShape>(
    {} as WorkflowContextWorkflowActionsShape,
  );
  const [selectedBlock, setSelectedBlock] = useState<WorkflowContextSelectedBlock | undefined>();
  const [isTriggerValid, setIsTriggerValid] = useState(false);
  const [actionsValidityObject, setActionsValidityObject] = useState<
    Record<string, { isValid: boolean; message: string }>
  >({});
  const [newActionCond, setNewActionCond] = useState<{ actionId: string; condId: string }>();
  const [attemptedPublish, setAttempedPublish] = useState(false);

  const blueprintId = useParams()?.blueprintId as string;

  const frameworkActions = useMemo(() => {
    return getParsedFrameworkActions(serializedFrameworkActions);
  }, [serializedFrameworkActions]);

  const frameworkAction = useMemo(() => {
    return frameworkActions.find(action => action.type === (selectedBlock?.block as AutomationAction)?.type);
  }, [frameworkActions, selectedBlock?.block]);

  const frameworkEvents = useMemo(() => {
    return getParsedFrameworkEvents(serializedFrameworkEvents);
  }, [serializedFrameworkEvents]);

  const frameworkEvent = useMemo(() => {
    return frameworkEvents.find(event => event.type === trigger?.type);
  }, [trigger, frameworkEvents]);

  const handleSetTrigger = useCallback(
    (newTrigger: UpdateAutomationTrigger) => {
      setTrigger(newTrigger as AutomationTrigger);
      if (!newTrigger || isObjectEmpty(newTrigger)) {
        setSelectedBlock({
          type: 'trigger',
          block: newTrigger as AutomationTrigger,
        });
      } else {
        setSelectedBlock(undefined);
        const triggerBlock = frameworkEvents.find(event => event.type === newTrigger.type);
        const isValid = isTriggerPayloadValid({ trigger: newTrigger as AutomationTrigger, block: triggerBlock! });
        setIsTriggerValid(isValid);
      }
    },
    [frameworkEvents],
  );

  const handleSetActions = useCallback(
    (newActions: WorkflowContextWorkflowActionsShape) => {
      setActions(newActions);
      const actionsValidity = Object.values(newActions)?.map(action => {
        if (!action.type) {
          return { id: action.id, isValid: { isValid: false, message: 'No action type selected' } };
        }
        const concreteAction =
          frameworkActions.find(systemAction => systemAction.type === action.type) ||
          systemLogics.find(systemLogic => systemLogic.type === action.type);

        const isValid = isActionPayloadValid({
          action: action as AutomationAction,
          block: concreteAction as RefinedIntegrationAction,
        });

        return { id: action.id, isValid };
      });

      const actionsValidityObj = actionsValidity?.reduce((acc, b) => {
        return { ...acc, [b.id]: b.isValid };
      }, {} as Record<string, { isValid: boolean; message: string }>);

      setActionsValidityObject(actionsValidityObj);
    },
    [frameworkActions],
  );

  const handleUpdateTrigger = useCallback(
    (updatedTrigger: UpdateAutomationTrigger) => {
      const newTrigger = { ...trigger, ...updatedTrigger };
      setTrigger(newTrigger);
      const isValid = isTriggerPayloadValid({ trigger: newTrigger as AutomationTrigger, block: frameworkEvent! });
      setIsTriggerValid(isValid);
      if (selectedBlock?.type === 'trigger') {
        setSelectedBlock({
          type: 'trigger',
          block: newTrigger,
        });
      }
    },
    [trigger, selectedBlock, frameworkEvent],
  );

  const handleUpdateBlueprintInfo = (info: WorkflowContextBlueprintInfo) => {
    setBlueprintInfo(prev => ({ ...prev, ...info }));
  };

  const handleUpdateAction = useCallback(
    (action: WorkflowContextAction, removeActionId?: string) => {
      const newAction = {
        ...(actions[action.id] || {}),
        ...action,
      };
      const subActions = Object.values(actions).filter(val => val.parentActionId === action.id);
      const isChangingType = actions[action.id]?.type !== 'CONDITIONS';
      const isAddingNew = !actions[action.id]?.type;
      const isConditionActionType = action.type === 'CONDITIONS' && (isChangingType || isAddingNew);
      let newSubActions: WorkflowContextWorkflowActionsShape = {};
      if (isConditionActionType) {
        const conditionId1 = createId();
        const conditionId2 = createId();
        const defaultConditionId = createId();
        const actionId1 = createId();
        const actionId2 = createId();
        newSubActions = {
          [actionId1]: {
            id: actionId1,
            type: '',
            parentActionId: newAction.id,
          },
          [actionId2]: {
            id: actionId2,
            type: '',
            parentActionId: newAction.id,
          },
        };
        newAction.condition = [
          { field: '', operator: '', automationBlockId: '', actionId: actionId1, id: conditionId1 },
          { field: '', operator: '', automationBlockId: '', actionId: actionId2, id: conditionId2 },
          {
            field: '',
            operator: '',
            automationBlockId: '',
            actionId: subActions?.[0]?.id || '',
            isDefault: true,
            id: defaultConditionId,
          },
        ];
      }

      const updatedActions = {
        ...actions,
        [action.id]: newAction,
        ...newSubActions,
      };

      const concreteAction =
        frameworkActions.find(systemAction => systemAction.type === newAction.type) ||
        systemLogics.find(systemLogic => systemLogic.type === newAction.type);

      const isValid = isActionPayloadValid({
        action: newAction as AutomationAction,
        block: concreteAction as RefinedIntegrationAction,
      });

      setActionsValidityObject(prev => ({ ...prev, [action.id]: isValid }));
      const actionToRemove = updatedActions[removeActionId || ''];

      if (removeActionId) {
        delete updatedActions[removeActionId];
      }

      const constuctedBlueprint = constructBluePrint({
        blueprintInfo,
        trigger,
        actions: updatedActions,
      });
      const { actions: correctActions } = constructWorkflowContextBluePrint(constuctedBlueprint);
      setActions(correctActions);
      const removedActionParent = correctActions[actionToRemove?.parentActionId || ''];
      if (removedActionParent) {
        const parentConcreteAction =
          frameworkActions.find(systemAction => systemAction.type === removedActionParent.type) ||
          systemLogics.find(systemLogic => systemLogic.type === removedActionParent.type);

        const isRemovedActionParentValid = isActionPayloadValid({
          action: removedActionParent as AutomationAction,
          block: parentConcreteAction as RefinedIntegrationAction,
        });

        setActionsValidityObject(prev => ({
          ...prev,
          [removedActionParent.id]: isRemovedActionParentValid,
          [action.id]: isValid,
        }));
      }
      if (selectedBlock?.type === 'action' && action.type === selectedBlock.block.type) {
        setSelectedBlock({
          type: 'action',
          block: { ...(selectedBlock.block || {}), ...newAction },
        });
      }
      return constuctedBlueprint;
    },
    [actions, blueprintInfo, selectedBlock?.block, selectedBlock?.type, trigger, frameworkActions],
  );

  const handleNewBlankAction = useCallback(
    ({ newAction, isParentATrigger, isParentACondition, conditionId }: NewActionInMiddleProps) => {
      let actionIdToUpdate = isParentATrigger
        ? Object.values(actions)?.find(act => !act.parentActionId)?.id
        : Object.values(actions)?.find(act => act.parentActionId === newAction.parentActionId)?.id;
      let updatedActions = {
        ...actions,
        [newAction.id]: newAction,
      };

      if (isParentACondition) {
        const parentAction = actions[newAction.parentActionId || ''];
        if (parentAction?.id) {
          const conditions = Array.isArray(parentAction?.condition) ? parentAction.condition : [];

          if (conditions.length) {
            const newConditions = conditions?.map(cond => {
              if (cond.id === conditionId) {
                actionIdToUpdate = cond.actionId;
                cond.actionId = newAction.id;
              }
              return cond;
            });

            updatedActions[parentAction.id] = { ...updatedActions[parentAction.id], condition: newConditions };

            setActionsValidityObject(prev => ({ ...prev, [parentAction.id]: { isValid: true, message: '' } }));
          }
        }
      }
      if (actionIdToUpdate && updatedActions[actionIdToUpdate]) {
        updatedActions[actionIdToUpdate] = { ...updatedActions[actionIdToUpdate], parentActionId: newAction.id };
      }
      setActions(updatedActions);

      setSelectedBlock({
        type: 'action',
        block: newAction as AutomationAction,
      });

      const constuctedBlueprint = constructBluePrint({
        blueprintInfo,
        trigger,
        actions: updatedActions,
      });
      return constuctedBlueprint;
    },
    [actions, blueprintInfo, trigger],
  );

  const handleRemoveAction = useCallback(
    (actionId: string, deleteOnlyBlock?: boolean) => {
      const action = actions[actionId];
      const updatedActions = {
        ...actions,
      };

      if (deleteOnlyBlock) {
        const childAction = Object.values(actions)?.find(act => act.parentActionId === actionId);
        if (childAction) {
          updatedActions[childAction.id].parentActionId = action.parentActionId;
        }
      }

      delete updatedActions[actionId];

      if (action.parentActionId && actions[action.parentActionId]?.type === 'CONDITIONS') {
        const updatedParentConditions = (
          actions[action.parentActionId]?.condition as AutomationLogicConditionGroup[]
        )?.map(cond => {
          if (cond.actionId === actionId) {
            cond.actionId = '';
          }

          return cond;
        });

        updatedActions[action.parentActionId].condition = updatedParentConditions;
      }

      const constuctedBlueprint = constructBluePrint({
        blueprintInfo,
        trigger,
        actions: updatedActions,
      });
      const { actions: correctActions } = constructWorkflowContextBluePrint(constuctedBlueprint);
      setActions(correctActions);
      const removedActionParent = correctActions[action.parentActionId || ''];
      if (removedActionParent) {
        const concreteAction =
          frameworkActions.find(systemAction => systemAction.type === removedActionParent.type) ||
          systemLogics.find(systemLogic => systemLogic.type === removedActionParent.type);

        const isValid = isActionPayloadValid({
          action: removedActionParent as AutomationAction,
          block: concreteAction as RefinedIntegrationAction,
        });

        setActionsValidityObject(prev => ({ ...prev, [removedActionParent.id]: isValid }));
      }
      return constuctedBlueprint;
    },
    [actions, blueprintInfo, trigger, frameworkActions],
  );

  const handleUpdateLogicActionCondition = useCallback(
    ({ actionId, condition, isNewCondition, isPathFromGraph }: UpdateLogicCondtion) => {
      const action = actions[actionId];
      const { condition: actionCondition } = action;
      const conditions = Array.isArray(actionCondition) ? actionCondition : [];
      let newConditions = conditions?.map(cond => {
        if (cond.id === condition.id) {
          return { ...cond, ...condition };
        }

        return cond;
      });
      let updatedActions = {
        ...actions,
        [actionId]: { ...action, condition: newConditions },
      };

      const isValid = isActionPayloadValid({
        action: updatedActions[actionId] as AutomationAction,
        block: {} as RefinedIntegrationAction,
      });

      setActionsValidityObject(prev => ({ ...prev, [actionId]: isValid }));

      if (isNewCondition) {
        const newActionId = createId();
        newConditions = [...conditions, { ...condition, actionId: newActionId }];
        updatedActions = {
          ...actions,
          [actionId]: { ...action, condition: newConditions },
          [newActionId]: {
            id: newActionId,
            type: '',
            parentActionId: actionId,
          },
        };
      }

      setActions(updatedActions);

      if (isNewCondition && isPathFromGraph) {
        setNewActionCond({
          actionId,
          condId: condition.id!,
        });
      }

      const constuctedBlueprint = constructBluePrint({
        blueprintInfo,
        trigger,
        actions: updatedActions,
      });
      return constuctedBlueprint;
    },
    [actions, blueprintInfo, trigger],
  );

  useEffect(() => {
    if (newActionCond) {
      const action = actions[newActionCond.actionId];
      const condition = (action.condition as AutomationLogicConditionGroup[])?.find(
        cond => cond.id === newActionCond.condId,
      );
      if (condition) {
        setSelectedBlock({ type: 'path', block: condition });
      }
      setNewActionCond(undefined);
    }
  }, [newActionCond, actions]);

  const constructedBlueprint = constructBluePrint({
    blueprintInfo,
    trigger,
    actions,
  });

  const contextValue: WorkflowContextProps = useMemo(() => {
    return {
      blueprintInfo,
      trigger,
      actions,
      blueprintId,
      frameworkAction,
      frameworkActions,
      frameworkEvent,
      frameworkEvents,
      updateTrigger: handleUpdateTrigger,
      updateAction: handleUpdateAction,
      updateBlueprintInfo: handleUpdateBlueprintInfo,
      constructedBlueprint,
      setActions: handleSetActions,
      selectedBlock,
      setSelectedBlock,
      setTrigger: handleSetTrigger,
      setBlueprintInfo,
      updateLogicActionCondition: handleUpdateLogicActionCondition,
      removeAction: handleRemoveAction,
      addNewBlankAction: handleNewBlankAction,
      isTriggerValid,
      actionsValidityObject,
      attemptedPublish,
      setAttempedPublish,
    };
  }, [
    blueprintInfo,
    trigger,
    actions,
    blueprintId,
    frameworkAction,
    frameworkActions,
    frameworkEvent,
    frameworkEvents,
    handleUpdateTrigger,
    handleUpdateAction,
    constructedBlueprint,
    selectedBlock,
    handleSetTrigger,
    handleUpdateLogicActionCondition,
    handleRemoveAction,
    handleNewBlankAction,
    handleSetActions,
    isTriggerValid,
    actionsValidityObject,
    attemptedPublish,
  ]);

  return <WorkflowContext.Provider value={contextValue}>{children}</WorkflowContext.Provider>;
};