import * as dateFns from 'date-fns';
import jsonSchemaToZod from 'json-schema-to-zod';
import { FieldErrors, Resolver } from 'react-hook-form';
import superjson from 'superjson';
import { z, ZodTypeAny, ZodString, ZodNumber, ZodEnum, ZodDate, ZodArray, ZodOptional } from 'zod';
import zodToJsonSchema from 'zod-to-json-schema';

import { flattenObject, getSingularOrPluralRecordTypeBasedOnRecordsCount } from '@/lib/object';
import { capitalizeFirstLetter } from '@/lib/string';

import { ObjectCategory, srtToIcon } from '@/types';

import flatten from 'lodash/flatten';
import last from 'lodash/last';

import { WorkflowContextProps } from './context/workflow-context';
import {
  ActionVariable,
  AutomationAction,
  AutomationBlueprintWithRelations,
  AutomationCondition,
  AutomationConditionGroup,
  AutomationLogicConditionGroup,
  AutomationParentBlock,
  AutomationParentBlocks,
  AutomationStatus,
  AutomationTrigger,
  filterFieldTypeToOperatorMap,
  FilterOperator,
  FilterOpToValueMapEnum,
  frameWorkIcon,
  IntegrationAction,
  IntegrationContext,
  IntegrationEventTriggerProperties,
  RefinedIntegrationAction,
  RefinedIntegrationEventTriggerProperties,
  SchemaFieldOptions,
  WorkflowContextAction,
  WorkflowContextWorkflowActionsShape,
} from './types';

export const workflowStatusColorMap: Record<AutomationStatus, string> = {
  DRAFT: '#DFCA7A',
  PUBLISHED: '#4BB042',
} as const;

export const workflowStatusTextMap: Record<AutomationStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Live',
} as const;

export function extractConditions(group?: AutomationConditionGroup) {
  let result: AutomationCondition[] = [];
  if (!group) return result;

  function recurse(group: AutomationConditionGroup, conj?: 'and' | 'or') {
    const { field, operator, value, automationBlockId, id, actionId, isDefault } = group;

    if (id || field || isDefault) {
      result.push({ field, operator, value, automationBlockId, id, actionId, isDefault, conj: conj });
    }
    if (group.and) {
      for (const subGroup of group.and) {
        recurse({ ...subGroup }, 'and');
      }
    }
    if (group.or) {
      for (const subGroup of group.or) {
        recurse({ ...subGroup }, 'or');
      }
    }
  }

  recurse(group);
  return result;
}

export const blockStyles = {
  default: 'border-[0.5px] border-solid rounded-md relative border-border',
  states: 'hover:border-accent focus:border-accent',
  header: 'p-3 text-[13px] flex gap-3 items-center',
  details: 'bg-neutral-800 rounded-b-md p-3 text-[10px] text-left text-neutral-300',
};

/**
 * Stringify the framework actions
 * @param frameworkActions - framework actions
 * @param ctx - integration context
 * @returns serialized framework actions
 */
export async function getSerializedFrameworkActions({
  frameworkActions,
  ctx,
}: {
  frameworkActions: IntegrationAction[];
  ctx: IntegrationContext;
}): Promise<string> {
  const refinedActions = await Promise.all(
    frameworkActions.map(async action => {
      const schema = action.schema;
      const outputSchema = action.outputSchema;

      let schemaOptions;
      if (action.getSchemaOptions) {
        try {
          // optionally initialize schema options for each event's schema fields
          schemaOptions = await action.getSchemaOptions({ ctx });
        } catch (err) {
          console.error(err);
          schemaOptions = undefined;
        }
      }

      // remove executor, category and getSchemaOptions from the action
      const { executor, getSchemaOptions, category, ...rest } = action;

      const resolvedSchema = schema && typeof schema === 'function' ? await schema({ ctx }) : schema;
      const resolvedOutputSchema =
        outputSchema && typeof outputSchema === 'function' ? await outputSchema({ ctx }) : outputSchema;

      return {
        ...rest,
        schema: zodToJsonSchema(resolvedSchema),
        zodSchema: resolvedSchema,
        schemaOptions,
        outputSchema: resolvedOutputSchema ? zodToJsonSchema(resolvedOutputSchema) : undefined,
        zodOutputSchema: resolvedOutputSchema,
      };
    }),
  );

  return superjson.stringify({ data: refinedActions });
}

/**
 * Stringify the framework events
 * @param frameworkEvents - framework events
 * @param ctx - integration context
 * @returns serialized framework events
 */
export async function getSerializedFrameworkEvents({
  frameworkEvents,
  ctx,
}: {
  frameworkEvents: IntegrationEventTriggerProperties[];
  ctx: IntegrationContext;
}): Promise<string> {
  const refinedActions = await Promise.all(
    frameworkEvents.map(async event => {
      const schema = event.schema;
      const outputSchema =
        typeof event.outputSchema === 'function' ? await event.outputSchema({ ctx }) : event.outputSchema;

      let schemaOptions;
      if (event.getSchemaOptions) {
        try {
          // optionally initialize schema options for each event's schema fields
          schemaOptions = await event.getSchemaOptions({ ctx });
        } catch (err) {
          console.error(err);
          schemaOptions = [];
        }
      }

      // remove getSchemaOptions from the event
      const { getSchemaOptions, ...rest } = event;

      return {
        ...rest,
        schema: schema ? zodToJsonSchema(schema) : undefined,
        zodSchema: schema,
        schemaOptions,
        outputSchema: outputSchema ? zodToJsonSchema(outputSchema) : undefined,
        zodOutputSchema: outputSchema,
      };
    }),
  );

  // return the serialized framework events
  return superjson.stringify({ data: refinedActions });
}

/**
 * Parse the stringified framework actions
 *
 * @param serializedFramerworkActions - serialized framework actions
 * @returns parsed framework actions
 */
export function getParsedFrameworkActions(serializedFramerworkActions: string): RefinedIntegrationAction[] {
  const parsedActions = superjson.parse<{ data: RefinedIntegrationAction[] }>(serializedFramerworkActions).data;

  // resolve zod schema and output schema from parsed events
  return parsedActions.map(action => {
    const schema = resolveSerializedZodOutput(jsonSchemaToZod(action.schema));
    const outputSchema = action.outputSchema
      ? resolveSerializedZodOutput(jsonSchemaToZod(action.outputSchema))
      : undefined;

    return {
      ...action,
      schema,
      outputSchema,
    };
  });
}

/**
 * Parse the stringified framework events
 *
 * @param serializedFramerworkEvents - serialized framework events
 * @returns parsed framework events
 */
export function getParsedFrameworkEvents(
  serializedFramerworkEvents: string,
): RefinedIntegrationEventTriggerProperties[] {
  const parsedEvents = superjson.parse<{ data: RefinedIntegrationEventTriggerProperties[] }>(
    serializedFramerworkEvents,
  ).data;

  // resolve zod schema and output schema from parsed events
  return parsedEvents.map(event => {
    // initialize zod instances from the serialized zod objects
    const schema = event.schema ? resolveSerializedZodOutput(jsonSchemaToZod(event.schema)) : undefined;
    const outputSchema = event.outputSchema
      ? resolveSerializedZodOutput(jsonSchemaToZod(event.outputSchema))
      : undefined;

    return {
      ...event,
      schema,
      outputSchema,
    };
  });
}

/**
 * Resolve serialized zod output - This function takes the string output ot the `jsonSchemaToZod` function
 * and instantiates the zod object correctly.
 *
 * @param obj - serialized zod object
 * @returns resolved zod object
 */
export function resolveSerializedZodOutput(obj: any) {
  return Function('z', `"use strict";return (${obj});`)(z);
}

export const constructBluePrint = ({
  blueprintInfo,
  actions,
  trigger,
}: Pick<WorkflowContextProps, 'blueprintInfo' | 'actions' | 'trigger'>) => {
  const parentAction = Object.values(actions).find(action => !action.parentActionId);
  if (!parentAction) return { ...blueprintInfo, trigger, actions: [] as AutomationAction[] };

  const blueprint = { ...blueprintInfo, trigger, actions: [parentAction] as AutomationAction[] };

  for (const key in actions) {
    const currentAction = actions[key] as AutomationAction;
    const subActions = Object.values(actions).filter(sub => sub.parentActionId === currentAction.id);
    currentAction.subActions = [...subActions] as AutomationAction[];
  }

  return blueprint;
};

export const constructWorkflowContextBluePrint = (blueprint: AutomationBlueprintWithRelations) => {
  const { trigger, actions, ...blueprintInfo } = blueprint;
  const rootAction = actions[0];
  if (!rootAction) return { trigger, blueprintInfo, actions: {} as WorkflowContextProps['actions'] };
  const { subActions, ...rest } = rootAction;
  const workflowContextActions = {
    [rootAction.id]: rest as WorkflowContextAction,
  };

  function recurse({
    action,
    parentActionId,
  }: {
    action: AutomationAction;
    actionsObj?: WorkflowContextProps['actions'];
    parentActionId?: string;
  }) {
    const { subActions, ...rest } = action;
    action.parentActionId = parentActionId;
    workflowContextActions[action.id] = action as WorkflowContextAction;

    if (subActions?.length) {
      subActions.forEach(sub => {
        recurse({
          action: sub,
          parentActionId: action.id,
        });
      });
    }
  }

  subActions.forEach(action => {
    recurse({
      action,
      parentActionId: rootAction.id,
    });
  });

  return {
    trigger,
    blueprintInfo,
    actions: workflowContextActions,
  };
};

export const schemaToFilterOperator = (schema: ZodTypeAny): FilterOperator[] => {
  if (schema instanceof ZodString) {
    return filterFieldTypeToOperatorMap['SINGLE_LINE_TEXT'];
  } else if (schema instanceof ZodNumber) {
    return filterFieldTypeToOperatorMap['CURRENCY'];
  } else if (schema instanceof ZodDate) {
    return filterFieldTypeToOperatorMap['DATE'];
  } else if (schema instanceof ZodEnum || (schema instanceof ZodArray && schema.element instanceof ZodEnum)) {
    return filterFieldTypeToOperatorMap['MULTI_SELECT'];
  } else if (schema instanceof ZodOptional) {
    return schemaToFilterOperator(schema._def.innerType);
  } else {
    return filterFieldTypeToOperatorMap['SINGLE_LINE_TEXT'];
  }
};

export const getAllParentBlocks = ({
  actions,
  actionId,
  trigger,
}: {
  actions: WorkflowContextWorkflowActionsShape;
  actionId: string;
  trigger: AutomationTrigger;
}) => {
  const action = actions[actionId];
  let parentActions: AutomationParentBlocks = [];
  let parentActionId = action.parentActionId;
  while (!!parentActionId) {
    const parent = actions[parentActionId] as AutomationAction;
    if (parent.type !== 'CONDITIONS') {
      parentActions.push({ ...parent, blockType: 'action' });
    }
    parentActionId = parent.parentActionId;
  }

  const parentBlocks = [...parentActions, { ...trigger, blockType: 'trigger' } as AutomationParentBlock];

  return parentBlocks;
};

export const getOutputSchema = ({
  block,
  payload,
  blockType,
}: {
  block: RefinedIntegrationAction | RefinedIntegrationEventTriggerProperties;
  payload: { value?: unknown } | Record<string, any>;
  blockType: 'action' | 'trigger';
}) => {
  const body = blockType === 'trigger' ? payload?.value : payload;
  const blockSchemaTypeName =
    (block as any)?.zodOutputSchema?._def?.typeName || (block?.outputSchema as any)?._def?.typeName;
  const discriminatedUnionSchemaOptions = (block?.outputSchema as any)?._def?.options;
  const discriminatedUnionSchemaDiscriminator =
    (block as any)?.zodOutputSchema?._def?.discriminator || (block?.outputSchema as any)?._def?.discriminator;

  const discriminatorValue = discriminatedUnionSchemaDiscriminator
    ? (body as any)?.[discriminatedUnionSchemaDiscriminator]
    : undefined;

  const discriminatedUnionSchema = discriminatedUnionSchemaOptions?.find(
    (option: any) => option?.shape?.[discriminatedUnionSchemaDiscriminator]?._def?.value === discriminatorValue,
  );

  const schema =
    blockSchemaTypeName === 'ZodDiscriminatedUnion'
      ? discriminatedUnionSchema?.omit({
          [discriminatedUnionSchemaDiscriminator]: true,
        })
      : (block as any)?.outputSchema || (block as any)?.schema;

  return schema;
};

export const getSchemaClient = ({
  block,
  payload,
  blockType,
}: {
  block: RefinedIntegrationAction | RefinedIntegrationEventTriggerProperties;
  payload: { value?: unknown } | Record<string, any>;
  blockType: 'action' | 'trigger';
}) => {
  const body = blockType === 'trigger' ? payload?.value : payload;
  const schema = block?.zodSchema || block?.schema;

  const blockSchemaTypeName = (schema as any)?._def?.typeName;
  const discriminatedUnionSchemaOptions = (block?.schema as any)?._def?.options;
  const discriminatedUnionSchemaDiscriminator = (schema as any)?._def?.discriminator;

  const discriminatorValue = discriminatedUnionSchemaDiscriminator
    ? (body as any)?.[discriminatedUnionSchemaDiscriminator]
    : undefined;

  const discriminatedUnionSchema =
    discriminatedUnionSchemaOptions?.find(
      (option: any) => option?.shape?.[discriminatedUnionSchemaDiscriminator]?._def?.value === discriminatorValue,
    ) || z.object({ [discriminatedUnionSchemaDiscriminator]: z.string().trim().min(1, 'Required') });

  const resolvedSchema = blockSchemaTypeName === 'ZodDiscriminatedUnion' ? discriminatedUnionSchema : block?.schema;

  return resolvedSchema;
};

export const isConditionValid = (cond: AutomationLogicConditionGroup) => {
  const valueCheck =
    cond.operator === FilterOpToValueMapEnum.SET || cond.operator === FilterOpToValueMapEnum.NOT_SET
      ? true
      : !!cond.value;

  return !!cond.automationBlockId && !!cond.field && valueCheck;
};

export const isActionPayloadValid = ({
  action,
  block,
}: {
  action: AutomationAction;
  block: RefinedIntegrationAction;
}) => {
  const { type, payload, variables } = action;

  if (type === 'CONDITIONS') {
    const atLeastOneConditionHasActions = (action?.condition as AutomationLogicConditionGroup[])
      ?.filter(cd => !cd.isDefault)
      ?.every(cond => isConditionValid(cond));
    return {
      isValid: atLeastOneConditionHasActions && action.subActions?.length > 0,
      message: 'Multi branch requires paths with defined conditions and linked actions',
    };
  }

  if (!payload || !type) return { isValid: false, message: 'Has unfilled required input(s)' };

  const schema = getSchemaClient({ block, payload, blockType: 'action' });

  const result = schema.safeParse(payload);

  const flattenPayload = flattenObject(payload, [], true);

  if (result.error) {
    const transformedErr = transformToNestObject(result.error);
    const errorHasVariable = Object.entries(transformedErr).every(([key, value]) =>
      typeof flattenPayload[key] === 'string' ? (flattenPayload[key] as string)?.includes('{{') : false,
    );
    if (!errorHasVariable) {
      return { isValid: false, message: 'Has unfilled required input(s)' };
    }
  }

  if (variables) {
    const payloadHasVariable = Object.values(flattenPayload)?.some(val =>
      typeof val === 'string' ? (val as string)?.includes('{{') : false,
    );

    if (!payloadHasVariable) return { isValid: true, message: '' };

    const message = 'Has unmapped variables';

    if (!Object.keys(variables)?.length) return { isValid: false, message };

    const flattenedVariables = flattenObject(variables, ['path', 'refBlockId']);

    const flattenedPayloadVariables = Object.values(flattenPayload).map(val => {
      const extractedVariables = extractVariables(val as string);
      return extractedVariables?.map(v => last(v?.split('.')) as string);
    });

    const payloadVariables = flatten(flattenedPayloadVariables);
    const variablesOnly = Object.entries(flattenedVariables)
      .map(([key, value]) => {
        const newKey = last(key.split('.')) as string;
        return { newKey, value };
      })
      ?.reduce((a, b) => ({ ...a, [b.newKey]: b.value }), {} as Record<string, unknown>);

    const allVariablesMapped = payloadVariables?.every(
      pp => (variablesOnly[pp] as ActionVariable)?.path && (variablesOnly[pp] as ActionVariable)?.refBlockId,
    );

    return { isValid: allVariablesMapped, message };
  }

  return { isValid: true, message: '' };
};

export const isTriggerPayloadValid = ({
  trigger,
  block,
}: {
  trigger: AutomationTrigger;
  block: RefinedIntegrationEventTriggerProperties;
}) => {
  const { type, payload } = trigger;

  if (!type) return false;

  const schema = getSchemaClient({ block, payload: payload!, blockType: 'trigger' });

  const result = schema?.safeParse(payload?.value);

  if (result?.error) {
    return false;
  }

  return true;
};

export const getFieldSchema = ({ schema, field }: { schema: z.ZodSchema<unknown>; field: string }) => {
  let fields = field?.split('.') || [];
  let fieldSchema = schema;
  let index = 0;

  while (fieldSchema instanceof z.ZodObject && index < fields.length) {
    fieldSchema = (fieldSchema as any)?.shape?.[fields[index]];
    index++;
  }

  return fieldSchema;
};

export const filterChecks = {
  stringCheck: ({
    filterField,
    operator,
    comparator,
  }: {
    filterField: string;
    operator: FilterOperator;
    comparator: string;
  }) => {
    if (!filterField) return false;

    if (typeof filterField !== 'string') return false;

    switch (operator) {
      case FilterOpToValueMapEnum.EQUAL:
        return filterField.trim().toLowerCase() === comparator.trim().toLowerCase();
      case FilterOpToValueMapEnum.NOT_EQUAL:
        return filterField.trim().toLowerCase() !== comparator.trim().toLowerCase();
      case FilterOpToValueMapEnum.CONTAINS:
        return filterField.trim().toLowerCase().includes(comparator.trim().toLowerCase());
      case FilterOpToValueMapEnum.DOES_NOT_CONTAIN:
        return !filterField.trim().toLowerCase().includes(comparator.trim());
      case FilterOpToValueMapEnum.SET:
        return !!filterField;
      case FilterOpToValueMapEnum.NOT_SET:
        return !filterField;
      default:
        return false;
    }
  },
  numberCheck: ({
    filterField,
    operator,
    comparator,
  }: {
    filterField: number;
    operator: FilterOperator;
    comparator: number;
  }) => {
    if (!filterField) return false;
    if (typeof filterField !== 'number') return false;
    switch (operator) {
      case 'EQUAL':
        return filterField === comparator;
      case 'NOT_EQUAL':
        return filterField !== comparator;
      case 'GREATER_THAN':
        return filterField > comparator;
      case 'LESS_THAN':
        return filterField < comparator;
      case 'GREATER_THAN_OR_EQUAL':
        return filterField >= comparator;
      case 'LESS_THAN_OR_EQUAL':
        return filterField <= comparator;
      default:
        return false;
    }
  },

  dateCheck: ({
    filterField,
    operator,
    comparator,
  }: {
    filterField: string;
    operator: FilterOperator;
    comparator: string;
  }) => {
    if (!filterField) return false;
    const datesAreEqual = dateFns.isEqual(filterField, new Date(comparator).toDateString());
    const dateIsAfter = dateFns.isAfter(filterField, new Date(comparator).toDateString());
    const dateIsBefore = dateFns.isBefore(filterField, new Date(comparator).toDateString());

    switch (operator) {
      case 'EQUAL':
        return datesAreEqual;
      case 'NOT_EQUAL':
        return !datesAreEqual;
      case 'GREATER_THAN':
        return dateIsAfter;
      case 'LESS_THAN':
        return dateIsBefore;
      default:
        return false;
    }
  },
  booleanCheck: ({
    filterField,
    operator,
    comparator,
  }: {
    filterField: boolean;
    operator: FilterOperator;
    comparator: unknown;
  }) => {
    switch (operator) {
      case 'IS':
        return filterField === Boolean(comparator);
      case 'IS_NOT':
        return filterField !== Boolean(comparator);
      default:
        return false;
    }
  },
};

export const transformToNestObject = (error: z.ZodError): FieldErrors => {
  const fieldErrors: FieldErrors = {};
  error.errors.forEach(err => {
    if (err.path.length > 0) {
      const path = err.path.join('.');
      fieldErrors[path] = {
        type: 'validation',
        message: err.message,
      };
    }
  });
  return fieldErrors;
};

export const customZodResolver = (schemaUnion: ZodTypeAny, discriminator: string): Resolver<any> => {
  return async values => {
    //get schema based on discriminator
    const schema =
      schemaUnion?._def?.options?.find(
        (option: any) => option?.shape?.[discriminator]?._def?.value === values[discriminator],
      ) || z.object({ [discriminator]: z.string() });

    // Filter out keys that are not in the schema
    const filteredValues = Object.fromEntries(Object.entries(values).filter(([key]) => (schema as any)?.shape?.[key]));

    const result = schema.safeParse(filteredValues);

    if (result.success) {
      return { values: result.data, errors: {} };
    } else {
      const errors = transformToNestObject(result.error);
      return { values: {}, errors };
    }
  };
};

export function extractVariables(value: string | string[]) {
  const regex = /\{\{([\w._]+)\}\}/g; // supporting only text matches
  const matches = [];
  let match;

  if (Array.isArray(value)) {
    value.forEach(val => {
      const nestedMatches = extractVariables(val);
      matches.push(...nestedMatches);
    });
  } else {
    while ((match = regex.exec(value)) !== null) {
      matches.push(match[1]);
    }
  }
  return matches;
}

type RecordTypePayloadValue = { recordType: ObjectCategory };

export const getBlockIconAndTitle = ({
  block,
  blockDescription,
}: {
  block: AutomationTrigger | AutomationAction;
  blockDescription?: string;
}) => {
  if (block?.type?.toLocaleLowerCase()?.includes('record')) {
    if (block?.payload) {
      const { recordType } = (block.payload?.value || block.payload || {}) as RecordTypePayloadValue;
      const blockTitle = block.type.split('_')?.join(' ')?.toLocaleLowerCase();
      const recordTypeTitle = getSingularOrPluralRecordTypeBasedOnRecordsCount(recordType);
      const title = recordTypeTitle ? blockTitle?.replace('record', recordTypeTitle) : '';
      const description =
        recordTypeTitle && blockDescription ? blockDescription?.replace('record', recordTypeTitle) : blockDescription;
      const icon = srtToIcon[recordType];

      return {
        title,
        description,
        icon: { icon, alt: `${recordTypeTitle} icon` } as frameWorkIcon,
        recordTypeTitle,
      };
    }
  }

  return {
    title: '',
    description: blockDescription,
    icon: null,
    recordTypeTitle: '',
  };
};

/**
 * Extract schema options for the provided schema - Builds a map of fieldname to field options
 * @param schema - schema
 * @param dataCtx - data context - this is an object of options for each field that isn't enum (meaning string fields) but should have options
 * @returns schema options
 * */
export function extractSchemaOptions({
  schema,
  dataCtx,
}: {
  schema: z.ZodObject<any>;
  dataCtx?: Record<string, SchemaFieldOptions>;
}): Record<string, SchemaFieldOptions> {
  return Object.entries(schema.shape).reduce((acc, [field, schema]) => {
    setFieldOptions({ schema, acc, field, dataCtxList: dataCtx?.[field] });

    return acc;
  }, {} as Record<string, SchemaFieldOptions>);
}

/**
 * Set field options for the schema - Recursively populate the accumulator with field options for the provided field
 * if the schema is an enum or an array of enums, or an array of strings and has dataCtxList
 * @param schema - schema
 * @param acc - accumulator
 * @param field - field
 * @param dataCtxList - data context list - custom options for the field
 * @returns void
 * */
function setFieldOptions({
  schema,
  acc,
  field,
  dataCtxList,
}: {
  schema: any;
  acc: Record<string, SchemaFieldOptions>;
  field: string;
  dataCtxList?: SchemaFieldOptions;
}) {
  if (schema instanceof z.ZodEnum) {
    acc[field] = { options: schema.options.map((value: string) => ({ value, label: capitalizeFirstLetter(value) })) };
  } else if (schema instanceof z.ZodArray) {
    if (schema.element instanceof z.ZodEnum) {
      acc[field] = {
        options: schema.element.options.map((value: string) => ({ value, label: capitalizeFirstLetter(value) })),
      };
    } else if (schema.element instanceof z.ZodString && dataCtxList) {
      acc[field] = dataCtxList || { options: undefined };
    }
  } else if (schema instanceof z.ZodString && dataCtxList) {
    acc[field] = dataCtxList || { options: undefined };
  } else if (schema instanceof z.ZodOptional) {
    setFieldOptions({ schema: schema._def.innerType, dataCtxList, field, acc });
  } else {
    acc[field] = { options: undefined };
  }
}

export const pathAlphabet = 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');