import { describe, expect, it } from '@rstest/core';
import { getPlaceholderForType } from '../src/utils/prompt-placeholder';

describe('getPlaceholderForType', () => {
  it('returns API-specific prompt placeholders', () => {
    expect(getPlaceholderForType('aiTap')).toBe('想点击哪个元素？');
    expect(getPlaceholderForType('aiQuery')).toBe('想提取什么数据？');
    expect(getPlaceholderForType('aiAssert')).toBe('想断言什么条件？');
  });
});
