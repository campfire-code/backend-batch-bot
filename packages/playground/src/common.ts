import type { DeviceAction } from '@midscene/core';
import { findAllMidsceneLocatorField } from '@midscene/core/ai-model';
import { buildDetailedLocateParam } from '@midscene/core/yaml';
import type {
  ExecutionOptions,
  FormValue,
  PlaygroundAgent,
  ValidationResult,
} from './types';

// APIs that return extracted data from the current interface.
export const dataExtractionAPIs = [
  'aiQuery',
  'aiBoolean',
  'aiNumber',
  'aiString',
  'aiAsk',
];

export const validationAPIs = ['aiAssert', 'aiWaitFor'];

// APIs whose executions should not be rendered as replays by StandardPlayground.
export const noReplayAPIs = [...dataExtractionAPIs, ...validationAPIs];

const agentPromptAPIs = [
  'aiAct',
  'runMarkdown',
  'aiQuery',
  'aiBoolean',
  'aiNumber',
  'aiString',
  'aiAsk',
  'aiWaitFor',
] as const;

type AgentPromptAPI = (typeof agentPromptAPIs)[number];

const agentPromptAPISet = new Set<string>(agentPromptAPIs);

function getAgentPromptAPI(
  activeAgent: PlaygroundAgent,
  actionType: string,
):
  | ((
      prompt: string | undefined,
      options: ExecutionOptions,
    ) => Promise<unknown>)
  | undefined {
  if (!agentPromptAPISet.has(actionType)) {
    return undefined;
  }

  const methodName = actionType as AgentPromptAPI;
  const method = activeAgent[methodName] as unknown;
  if (typeof method !== 'function') {
    return undefined;
  }

  return async (prompt, options) =>
    (
      method as (prompt: string, options: ExecutionOptions) => Promise<unknown>
    ).call(activeAgent, prompt || '', options);
}

export const formatErrorMessage = (e: any): string => {
  const errorMessage = e?.message || '';

  if (errorMessage.includes('of different extension')) {
    return '检测到冲突的浏览器扩展。请停用可疑的扩展并刷新页面。';
  }

  if (errorMessage.includes('NOT_IMPLEMENTED_AS_DESIGNED')) {
    return '当前环境下无法继续执行后续操作';
  }

  return errorMessage || '未知错误';
};

// Parse structured parameters for callActionInActionSpace
export async function parseStructuredParams(
  action: DeviceAction<unknown>,
  params: Record<string, unknown>,
  options: ExecutionOptions = {},
): Promise<unknown[]> {
  if (!action?.paramSchema || !('shape' in action.paramSchema)) {
    return [params.prompt || '', options];
  }

  const schema = action.paramSchema;
  const keys =
    schema && 'shape' in schema
      ? Object.keys((schema as { shape: Record<string, unknown> }).shape)
      : [];

  // Start with options and merge deviceOptions into the same level
  // Destructure to exclude deviceOptions from the final object
  const {
    deviceOptions: _,
    abortSignal: __,
    ...optionsWithoutDeviceOptions
  } = options;
  const paramObj: Record<string, unknown> = {
    ...optionsWithoutDeviceOptions,
    ...(options.deviceOptions || {}),
  };

  keys.forEach((key) => {
    if (
      params[key] !== undefined &&
      params[key] !== null &&
      params[key] !== ''
    ) {
      paramObj[key] = params[key];
    }
  });

  // Check if there's a locate field that needs detailed locate param processing
  if (schema) {
    const locatorFieldKeys = findAllMidsceneLocatorField(schema);
    locatorFieldKeys.forEach((locateKey: string) => {
      const locatePrompt = params[locateKey];
      if (locatePrompt && typeof locatePrompt === 'string') {
        // Build detailed locate param using the locate prompt and options
        const detailedLocateParam = buildDetailedLocateParam(locatePrompt, {
          deepLocate: options.deepLocate,
          cacheable: true, // Default to true for playground
        });
        if (detailedLocateParam) {
          paramObj[locateKey] = detailedLocateParam;
        }
      }
    });
  }

  return [paramObj];
}

export function validateStructuredParams(
  value: FormValue,
  action: DeviceAction<unknown> | undefined,
): ValidationResult {
  if (!value.params) {
    return { valid: false, errorMessage: '缺少必填参数' };
  }

  if (!action?.paramSchema) {
    return { valid: true };
  }

  try {
    const paramsForValidation = { ...value.params };

    const schema = action.paramSchema;
    if (schema) {
      const locatorFieldKeys = findAllMidsceneLocatorField(schema);
      locatorFieldKeys.forEach((key: string) => {
        if (typeof paramsForValidation[key] === 'string') {
          paramsForValidation[key] = {
            prompt: paramsForValidation[key],
            center: [0, 0],
            rect: { left: 0, top: 0, width: 0, height: 0 },
          };
        }
      });
    }

    action.paramSchema?.parse(paramsForValidation);
    return { valid: true };
  } catch (error: unknown) {
    const zodError = error as {
      errors?: Array<{ path: string[]; message: string }>;
    };
    if (zodError.errors && zodError.errors.length > 0) {
      const errorMessages = zodError.errors
        .filter((err) => {
          const path = err.path.join('.');
          return !path.includes('center') && !path.includes('rect');
        })
        .map((err) => {
          const field = err.path.join('.');
          return `${field}: ${err.message}`;
        });

      if (errorMessages.length > 0) {
        return {
          valid: false,
          errorMessage: `参数校验错误：${errorMessages.join('，')}`,
        };
      }
    } else {
      const errorMsg =
        error instanceof Error ? error.message : '未知的参数校验错误';
      return {
        valid: false,
        errorMessage: `参数校验失败：${errorMsg}`,
      };
    }
  }

  return { valid: true };
}

export async function executeAction(
  activeAgent: PlaygroundAgent,
  actionType: string,
  actionSpace: DeviceAction<unknown>[],
  value: FormValue,
  options: ExecutionOptions,
): Promise<unknown> {
  const canForwardDeepThink =
    actionType === 'aiAct' || actionType === 'runMarkdown';
  if (!canForwardDeepThink && options.deepThink !== undefined) {
    console.warn(
      '[Playground] Received deepThink in non-aiAct action options. deepThink is expected to be used with aiAct/runMarkdown during migration.',
      {
        actionType,
        requestId: options.requestId,
        options,
      },
    );
  }

  const action = actionSpace?.find(
    (a: DeviceAction<unknown>) =>
      a.interfaceAlias === actionType || a.name === actionType,
  );
  const signalArgs: [] | [AbortSignal] = options.abortSignal
    ? [options.abortSignal]
    : [];

  if (action && typeof activeAgent.callActionInActionSpace === 'function') {
    if (value.params) {
      const parsedParams = await parseStructuredParams(
        action,
        value.params,
        options,
      );
      return await activeAgent.callActionInActionSpace(
        action.name,
        parsedParams[0],
        ...signalArgs,
      );
    } else {
      // For prompt-based actions, we need to build the detailed locate param
      const detailedLocateParam = value.prompt
        ? buildDetailedLocateParam(value.prompt, {
            deepLocate: options.deepLocate,
            cacheable: true,
          })
        : undefined;

      // Flatten deviceOptions into the params
      // Destructure to exclude deviceOptions from the final object
      const {
        deviceOptions: _,
        reportDisplay: __,
        abortSignal: ___,
        ...optionsWithoutDeviceOptions
      } = options;
      const actionParams = {
        locate: detailedLocateParam,
        ...optionsWithoutDeviceOptions,
        ...(options.deviceOptions || {}),
      };

      return await activeAgent.callActionInActionSpace(
        action.name,
        actionParams,
        ...signalArgs,
      );
    }
  } else {
    const prompt = value.prompt;

    if (actionType === 'aiAssert') {
      const { reportDisplay: _reportDisplay, ...optionsWithoutReportDisplay } =
        options;
      const { pass, thought } =
        (await activeAgent?.aiAssert?.(prompt || '', undefined, {
          keepRawResponse: true,
          ...optionsWithoutReportDisplay,
        })) || {};
      return { pass: pass || false, thought: thought || '' };
    }

    const agentPromptAPI = getAgentPromptAPI(activeAgent, actionType);
    if (agentPromptAPI) {
      const { reportDisplay, ...agentOptions } = options;
      const optionsForAgent = reportDisplay
        ? {
            ...agentOptions,
            _internalReportDisplay: reportDisplay,
          }
        : agentOptions;
      return await agentPromptAPI(prompt, optionsForAgent);
    }

    throw new Error(`未知的操作类型：${actionType}`);
  }
}
