import { SettingOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { parseConfig, useEnvConfig } from '../../store/store';
import type { PlaygroundSDKLike } from '../../types';
import {
  type CommonAgentOptions,
  ConfigModal,
  type ConfigModalProps,
} from '../config-modal';

export type { CommonAgentOptions } from '../config-modal';

export interface EnvConfigProps {
  showTooltipWhenEmpty?: boolean;
  showModelName?: boolean;
  tooltipPlacement?: 'bottom' | 'top';
  mode?: 'icon' | 'text';
  playgroundSDK?: PlaygroundSDKLike | null;
  onVerify?: ConfigModalProps['onVerify'];
  modelConfigActions?: ConfigModalProps['modelConfigActions'];
  agentOptions?: CommonAgentOptions;
  onAgentOptionsSave?: (options: CommonAgentOptions) => void | Promise<void>;
  configModalClassName?: string;
  configModalWidth?: ConfigModalProps['width'];
  envTextareaAutoSize?: ConfigModalProps['envTextareaAutoSize'];
  envTextareaMinRows?: ConfigModalProps['envTextareaMinRows'];
}

export function EnvConfig({
  showTooltipWhenEmpty = true,
  showModelName = true,
  tooltipPlacement = 'bottom',
  mode = 'icon',
  playgroundSDK,
  onVerify,
  modelConfigActions,
  agentOptions,
  onAgentOptionsSave,
  configModalClassName,
  configModalWidth,
  envTextareaAutoSize,
  envTextareaMinRows,
}: EnvConfigProps) {
  const { config, configString, loadConfig, syncFromStorage } = useEnvConfig();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const midsceneModelName = config.MIDSCENE_MODEL_NAME;
  const componentRef = useRef<HTMLDivElement>(null);
  const verifyModel =
    onVerify ??
    (playgroundSDK?.runConnectivityTest
      ? playgroundSDK.runConnectivityTest.bind(playgroundSDK)
      : undefined);

  const showModal = (event: React.MouseEvent) => {
    syncFromStorage();
    setIsModalOpen(true);
    event.preventDefault();
    event.stopPropagation();
  };

  useEffect(() => {
    if (!isModalOpen) return;
    syncFromStorage();
  }, [isModalOpen, syncFromStorage]);

  return (
    <div
      ref={componentRef}
      style={{
        alignItems: 'center',
        display: 'flex',
        gap: '10px',
        height: '100%',
        justifyContent: 'flex-end',
        minHeight: '32px',
      }}
    >
      {showModelName ? midsceneModelName : null}
      <Tooltip
        align={{ offset: [-10, 5] }}
        getPopupContainer={() => componentRef.current as HTMLElement}
        open={
          isModalOpen
            ? false
            : showTooltipWhenEmpty
              ? Object.keys(config).length === 0
              : undefined
        }
        placement={tooltipPlacement}
        title="使用前请先配置模型环境变量。"
      >
        {mode === 'icon' ? (
          <SettingOutlined onClick={showModal} />
        ) : (
          <span
            onClick={showModal}
            style={{ color: '#006AFF', cursor: 'pointer' }}
          >
            去设置
          </span>
        )}
      </Tooltip>
      <ConfigModal
        agentOptionsValue={agentOptions}
        className={configModalClassName}
        envTextareaAutoSize={envTextareaAutoSize}
        modelConfigActions={modelConfigActions}
        envTextareaMinRows={envTextareaMinRows}
        width={configModalWidth}
        onClose={() => setIsModalOpen(false)}
        onSave={async ({ text, agentOptions: nextAgentOptions }) => {
          const previousConfigText = configString;
          const previousAgentOptions = agentOptions ?? {};
          let agentOptionsSaved = false;
          let configSaveStarted = false;

          try {
            await onAgentOptionsSave?.(nextAgentOptions);
            agentOptionsSaved = Boolean(onAgentOptionsSave);
            configSaveStarted = true;
            loadConfig(text);
            setIsModalOpen(false);
          } catch (error) {
            const rollbackErrors: unknown[] = [];

            if (configSaveStarted) {
              try {
                loadConfig(previousConfigText);
              } catch (rollbackError) {
                rollbackErrors.push(rollbackError);
              }
            }
            if (agentOptionsSaved) {
              try {
                await onAgentOptionsSave?.(previousAgentOptions);
              } catch (rollbackError) {
                rollbackErrors.push(rollbackError);
              }
            }

            if (rollbackErrors.length > 0) {
              throw new Error(
                `保存配置失败，且回滚不完整。原始错误：${String(error)}。回滚错误：${rollbackErrors.map(String).join('；')}`,
              );
            }
            throw error;
          }
        }}
        onVerify={verifyModel ? (env) => verifyModel(env) : undefined}
        open={isModalOpen}
        parseEnvText={parseConfig}
        showAgentOptions={Boolean(onAgentOptionsSave)}
        textValue={configString}
      />
    </div>
  );
}
