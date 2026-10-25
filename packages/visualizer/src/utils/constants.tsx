import type { InfoListItem, PlaygroundResult } from '../types';

// tracking popup tip
export const trackingTip = '仅限当前标签页弹出';

// deep locate tip
export const deepLocateTip = '深度定位';

// deep think tip (for aiAct planning)
export const deepThinkTip = '深度思考';

// screenshot included tip
export const screenshotIncludedTip = '请求中包含截图';

// dom included tip
export const domIncludedTip = '请求中包含页面结构信息';

// Android device options tips
export const imeStrategyTip = '输入法策略';
export const screenshotStrategyTip = '截图策略';
export const autoDismissKeyboardTip = '自动收起键盘';
export const keyboardDismissStrategyTip = '键盘收起策略';
export const alwaysRefreshScreenInfoTip = '始终刷新屏幕信息';

export const apiMetadata = {
  aiAct: {
    group: 'interaction',
    title: '自动规划：拆分步骤并执行',
  },
  aiTap: { group: 'interaction', title: '点击元素' },
  aiDoubleClick: { group: 'interaction', title: '双击元素' },
  aiHover: { group: 'interaction', title: '悬停在元素上' },
  aiInput: { group: 'interaction', title: '向元素输入文字' },
  aiRightClick: { group: 'interaction', title: '右键点击元素' },
  aiKeyboardPress: { group: 'interaction', title: '按下键盘按键' },
  aiScroll: { group: 'interaction', title: '滚动页面或元素' },
  aiLocate: { group: 'interaction', title: '在页面上定位元素' },
  aiQuery: {
    group: 'extraction',
    title: '直接从界面提取数据',
  },
  aiBoolean: { group: 'extraction', title: '获取是/否答案' },
  aiNumber: { group: 'extraction', title: '提取数值' },
  aiString: { group: 'extraction', title: '提取文本' },
  aiAsk: { group: 'extraction', title: '针对界面提问' },
  aiAssert: { group: 'validation', title: '断言某个条件成立' },
  aiWaitFor: { group: 'validation', title: '等待条件满足' },
};

export const defaultMainButtons = ['aiAct', 'aiTap', 'aiQuery', 'aiAssert'];

// welcome message template
export const getWelcomeMessageTemplate = (
  targetName = '网页',
): Omit<InfoListItem, 'id' | 'timestamp'> => ({
  type: 'system',
  content: `
      欢迎使用 Midscene.js 操作台！

      这是一个用来体验和测试 Midscene.js 功能的面板。你可以用自然语言指令来操作${targetName}，例如点击按钮、填写表单、查询信息等。

      请在下方输入框中输入指令，开始体验。
    `,
  loading: false,
  result: undefined,
  replayScriptsInfo: null,
  replayCounter: 0,
  loadingProgressText: '',
  verticalMode: false,
});

// keep backward compatibility
export const WELCOME_MESSAGE_TEMPLATE: Omit<InfoListItem, 'id' | 'timestamp'> =
  getWelcomeMessageTemplate();

// blank result template
export const BLANK_RESULT: PlaygroundResult = {
  result: undefined,
  dump: null,
  reportHTML: null,
  report: null,
  error: null,
};
