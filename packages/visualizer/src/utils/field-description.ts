// 操作参数输入框的提示文字。原文来自 @midscene/core 的参数说明（同时也是写给大模型的提示词），
// 这里只在界面展示时翻译，按前缀匹配，匹配不到就原样显示。
const DESCRIPTION_ZH: Array<[string, string]> = [
  ['The element to be tapped', '描述想要点击的元素'],
  ['The element to be right clicked', '描述想要右键点击的元素'],
  ['The element to be double clicked', '描述想要双击的元素'],
  ['The element to be hovered', '描述想要悬停的元素'],
  ['The element to be long pressed', '描述想要长按的元素'],
  ['The text to input', '要输入的文字'],
  [
    'Input mode:',
    '输入方式：replace（默认，先清空再输入）、typeOnly（直接追加输入）、clear（只清空）',
  ],
  [
    'The optional element to click before pressing the key',
    '按键前先点击的元素（可选，不填则作用于当前焦点）',
  ],
  [
    'The key to be pressed',
    '要按的按键，组合键用 + 连接，例如 Control+A、Shift+Enter',
  ],
  ['The scroll behavior', '滚动方式'],
  ['The direction toward the off-screen content', '滚动方向'],
  ['Positive requested scroll amount', '滚动距离（正数）'],
  [
    'Describe the target element to be scrolled on',
    '描述要滚动的区域，例如“订单列表”“内容区域”',
  ],
  ['The position to be dragged', '描述拖动的起点元素'],
  ['The position to be dropped', '描述拖动的终点位置'],
  ['Long press duration in milliseconds', '长按时长（毫秒）'],
  ['The input field to be cleared', '描述要清空的输入框'],
  ['The direction to move the cursor', '光标移动方向'],
  ['The number of times to move the cursor', '光标移动次数'],
  ['The element to pinch on', '描述要缩放的元素（不填则用屏幕中心）'],
  ['Pinch direction', '缩放方向：in 为缩小，out 为放大'],
  ['How far each finger moves', '每个手指移动的距离（像素）'],
  ['Duration of the pinch gesture', '手势时长（毫秒）'],
  ['Duration of the swipe gesture', '滑动时长（毫秒）'],
  ['Sleep duration in milliseconds', '等待时长（毫秒），默认 1000'],
  [
    'The URL to navigate to',
    '要打开的网址，需以 https://、file:// 或类似协议开头',
  ],
];

export const describeFieldInChinese = (description: string): string => {
  if (!description) return description;
  const hit = DESCRIPTION_ZH.find(([prefix]) => description.startsWith(prefix));
  return hit ? hit[1] : description;
};
