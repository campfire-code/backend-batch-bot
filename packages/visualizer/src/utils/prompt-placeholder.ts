// Get placeholder text based on run type
export const getPlaceholderForType = (type: string): string => {
  if (type === 'aiQuery') {
    return '想提取什么数据？';
  }
  if (type === 'aiAssert') {
    return '想断言什么条件？';
  }
  if (type === 'aiTap') {
    return '想点击哪个元素？';
  }
  if (type === 'aiDoubleClick') {
    return '想双击哪个元素？';
  }
  if (type === 'aiHover') {
    return '想把鼠标悬停在哪个元素上？';
  }
  if (type === 'aiInput') {
    return '格式：<要输入的内容> | <元素>\n示例：你好 | 搜索框';
  }
  if (type === 'aiRightClick') {
    return '想右键点击哪个元素？';
  }
  if (type === 'aiKeyboardPress') {
    return '格式：<按键> | <元素（可选）>\n示例：Enter | 文本框';
  }
  if (type === 'aiScroll') {
    return '格式：<方向> <距离> | <元素（可选）>\n示例：down 500 | 主要内容区';
  }
  if (type === 'aiLocate') {
    return '想定位哪个元素？';
  }
  if (type === 'aiBoolean') {
    return '想检查什么（返回是/否）？';
  }
  if (type === 'aiNumber') {
    return '想提取哪个数值？';
  }
  if (type === 'aiString') {
    return '想提取哪段文字？';
  }
  if (type === 'aiAsk') {
    return '想问什么问题？';
  }
  if (type === 'aiWaitFor') {
    return '想等待什么条件？';
  }
  return '想做什么？';
};
