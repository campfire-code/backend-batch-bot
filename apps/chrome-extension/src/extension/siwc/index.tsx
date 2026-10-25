import { SIWC_AUTH_STORAGE_KEY } from '@midscene/core/ai-model';
import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { type LoginSession, SIWC_SESSION_KEY, type exchangeCode } from './auth';
import './index.css';

const modelConfigExample = `MIDSCENE_MODEL_AUTH_MODE="siwc"
MIDSCENE_MODEL_NAME="gpt-6.1-sol"
MIDSCENE_MODEL_FAMILY="gpt-6"`;

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const resetTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(resetTimer.current), []);
  return (
    <>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setError('');
            clearTimeout(resetTimer.current);
            resetTimer.current = setTimeout(() => setCopied(false), 1500);
          } catch (cause) {
            setCopied(false);
            setError(String(cause));
          }
        }}
      >
        {copied ? '已复制' : label}
      </button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}

function SiwcResult() {
  const [session, setSession] = useState<LoginSession>();
  const [credentials, setCredentials] =
    useState<Awaited<ReturnType<typeof exchangeCode>>>();
  const [error, setError] = useState('');
  useEffect(() => {
    const lifecycle = { disposed: false, finished: false };
    const load = async () => {
      try {
        const current = await chrome.storage.session.get(SIWC_SESSION_KEY);
        if (lifecycle.disposed || lifecycle.finished) {
          return;
        }
        const nextSession = current[SIWC_SESSION_KEY] as
          | LoginSession
          | undefined;
        setSession(nextSession);
        if (
          nextSession?.status === 'waiting' ||
          nextSession?.status === 'exchanging'
        ) {
          return;
        }
        lifecycle.finished = true;
        chrome.storage.onChanged.removeListener(onChange);
        if (nextSession?.status === 'success') {
          const saved = await chrome.storage.local.get(SIWC_AUTH_STORAGE_KEY);
          if (!lifecycle.disposed) {
            setCredentials(saved[SIWC_AUTH_STORAGE_KEY]?.credentials);
          }
        }
      } catch (cause) {
        lifecycle.finished = true;
        chrome.storage.onChanged.removeListener(onChange);
        if (!lifecycle.disposed) {
          setError(String(cause));
        }
      }
    };
    const onChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string,
    ) => {
      if (area === 'session' && SIWC_SESSION_KEY in changes) {
        void load();
      }
    };
    // Listen before the initial read so completion during that read isn't missed.
    chrome.storage.onChanged.addListener(onChange);
    void load();
    return () => {
      lifecycle.disposed = true;
      chrome.storage.onChanged.removeListener(onChange);
    };
  }, []);
  const success = session?.status === 'success';
  return (
    <main>
      <header className="authorization-header">
        <img src="/icon128.png" width="48" height="48" alt="Midscene" />
        <h1>
          {success ? (
            '✅ ChatGPT 授权成功'
          ) : session?.status === 'error' ? (
            '授权失败'
          ) : (
            <>
              正在完成 ChatGPT 授权
              <span className="authorization-dots" aria-hidden="true">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </>
          )}
        </h1>
      </header>
      {(error || session?.error) && (
        <pre role="alert">{error || session?.error}</pre>
      )}
      {success && credentials && (
        <>
          <p>凭据只保存在本浏览器的插件里，不会被收集或上传。</p>
          <section className="usage-guide">
            <div className="config-heading">
              <h2>插件所需配置</h2>
              <span>示例：GPT-6.1 Sol</span>
            </div>
            <pre className="config-example">
              <code>{modelConfigExample}</code>
            </pre>
            <div className="config-actions">
              <CopyButton text={modelConfigExample} label="复制配置" />
            </div>
            <p>
              更多说明请查看{' '}
              <a
                href="https://midscenejs.com/chatgpt-subscription.html"
                target="_blank"
                rel="noreferrer"
              >
                使用文档
              </a>
              。
            </p>
          </section>
          <details className="token-details">
            <summary>查看访问令牌</summary>
            <label htmlFor="access-token">🔑 你的访问令牌：</label>
            <textarea
              id="access-token"
              readOnly
              value={credentials.access_token}
              spellCheck={false}
            />
            <p>
              过期时间：{' '}
              {new Date(credentials.expires_at).toLocaleString('zh-CN')}
            </p>
            <CopyButton text={credentials.access_token} label="复制访问令牌" />
          </details>
          <details className="token-details">
            <summary>查看完整凭据</summary>
            <pre className="credentials-json">
              {JSON.stringify(credentials, null, 2)}
            </pre>
          </details>
        </>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<SiwcResult />);
