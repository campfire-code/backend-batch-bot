import type { UIContext } from '@midscene/core';
import { Button } from 'antd';
import type React from 'react';
import Blackboard from '../blackboard';
import { iconForStatus } from '../misc';
import DemoData from '../playground/playground-demo-ui-context.json';
import './index.less';

interface ContextPreviewProps {
  uiContextPreview: UIContext | undefined;
  setUiContextPreview: (context: UIContext) => void;
  showContextPreview: boolean;
}

export const ContextPreview: React.FC<ContextPreviewProps> = ({
  uiContextPreview,
  setUiContextPreview,
  showContextPreview,
}) => {
  if (!showContextPreview) {
    return null;
  }

  return (
    <div className="form-part context-panel">
      <h3>界面上下文</h3>
      {uiContextPreview ? (
        <Blackboard uiContext={uiContextPreview} hideController />
      ) : (
        <div>
          {iconForStatus('failed')} 暂无界面上下文
          <Button
            type="link"
            onClick={(e) => {
              e.preventDefault();
              setUiContextPreview(DemoData as unknown as UIContext);
            }}
          >
            加载示例
          </Button>
          <div>
            要加载界面上下文，可以使用上面的示例数据，或在报告页面点击“发送到操作台”。
          </div>
        </div>
      )}
    </div>
  );
};
