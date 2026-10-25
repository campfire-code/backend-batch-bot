import { Alert, Button, Modal, Typography } from 'antd';
import { useState } from 'react';
import { SIWC_LOGIN_MESSAGE } from './auth';

export function SiwcLoginButton() {
  const [pending, setPending] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [error, setError] = useState('');

  const login = async () => {
    if (pending) {
      return;
    }
    setPending(true);
    setError('');
    try {
      const result = await chrome.runtime.sendMessage({
        type: SIWC_LOGIN_MESSAGE,
      });
      if (!result?.success) {
        throw new Error(result?.error ?? '无法发起 ChatGPT 登录授权。');
      }
      setConfirmationOpen(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <Button
        type="link"
        disabled={pending}
        onClick={() => setConfirmationOpen(true)}
        style={{ height: 'auto', padding: 0 }}
      >
        使用你的 ChatGPT 订阅 →
      </Button>
      <Modal
        title="使用 ChatGPT 登录"
        open={confirmationOpen}
        width={420}
        okText="前往 ChatGPT"
        cancelText="取消"
        confirmLoading={pending}
        cancelButtonProps={{ disabled: pending }}
        closable={!pending}
        maskClosable={!pending}
        keyboard={!pending}
        onOk={login}
        onCancel={() => {
          setConfirmationOpen(false);
          setError('');
        }}
      >
        <Typography.Paragraph>
          使用 ChatGPT 登录后，可以直接用你的 ChatGPT 订阅来驱动 Midscene，
          不需要另外申请 OpenAI 密钥。模型用量会计入你的 ChatGPT 订阅额度。
        </Typography.Paragraph>
        <Typography.Paragraph>
          授权会在新标签页中打开。登录后按页面提示操作，然后回到这里，
          把配置粘贴到“模型环境配置”输入框中。
        </Typography.Paragraph>
        <Typography.Paragraph>
          你的登录凭据只保存在本机的这个插件里，不会被收集或上传。
        </Typography.Paragraph>
        <Typography.Paragraph>
          <Typography.Link
            href="https://midscenejs.com/chatgpt-subscription.html"
            target="_blank"
            rel="noreferrer"
          >
            了解更多
          </Typography.Link>
        </Typography.Paragraph>
        {error && <Alert type="error" showIcon message={error} />}
      </Modal>
    </div>
  );
}
