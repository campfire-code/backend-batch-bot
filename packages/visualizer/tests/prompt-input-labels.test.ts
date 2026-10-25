import { describe, expect, test } from '@rstest/core';
import { getPromptInputActionLabel } from '../src/utils/action-label';

describe('getPromptInputActionLabel', () => {
  test('override label wins over the auto-derived type label', () => {
    expect(getPromptInputActionLabel('aiAct', '执行')).toBe('执行');
    expect(getPromptInputActionLabel('aiTap', '发送')).toBe('发送');
  });

  test('derives the label from the selected type when no override is given', () => {
    expect(getPromptInputActionLabel('aiAct')).toBe('执行');
    expect(getPromptInputActionLabel('aiTap')).toBe('点击');
  });

  test('falls back to the default label when neither an override nor a usable type exists', () => {
    expect(getPromptInputActionLabel('')).toBe('执行');
  });
});
