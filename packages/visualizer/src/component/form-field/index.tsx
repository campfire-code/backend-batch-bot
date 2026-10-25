import type { z } from '@midscene/core';
import { Form, Input, InputNumber, Select } from 'antd';
import type React from 'react';
import type { ZodRuntimeAccess } from '../../types';

const { TextArea } = Input;

interface FormFieldProps {
  name: string;
  label: string;
  fieldSchema: z.ZodTypeAny;
  isRequired: boolean;
  isLocateField: boolean;
  marginBottom: number;
  placeholder?: string; // Add optional placeholder prop
}

const FIELD_LABEL_ZH: Record<string, string> = {
  value: '内容',
  keyName: '按键',
  direction: '方向',
  scrollType: '滚动方式',
  distance: '距离',
  locate: '目标元素',
  prompt: '提示词',
  duration: '时长',
  timeMs: '时长（毫秒）',
  mode: '模式',
  autoDismissKeyboard: '自动收起键盘',
  from: '起点',
  to: '终点',
  start: '起点',
  end: '终点',
  url: '网址',
  text: '文本',
};

const ENUM_VALUE_ZH: Record<string, string> = {
  up: '向上',
  down: '向下',
  left: '向左',
  right: '向右',
  singleAction: '单次滚动',
  scrollToBottom: '滚动到底部',
  scrollToTop: '滚动到顶部',
  scrollToRight: '滚动到最右',
  scrollToLeft: '滚动到最左',
  replace: '替换',
  clear: '清空',
  typeOnly: '仅输入',
  append: '追加',
};

export const fieldLabelForKey = (key: string) =>
  FIELD_LABEL_ZH[key] ?? key.charAt(0).toUpperCase() + key.slice(1);

const renderLabel = (label: string, isOptional: boolean) => {
  return `${label}${isOptional ? '（可选）' : ''}`;
};

export const TextField: React.FC<Omit<FormFieldProps, 'isLocateField'>> = ({
  name,
  label,
  isRequired,
  marginBottom,
  placeholder: customPlaceholder,
}) => {
  const placeholder = customPlaceholder || `请输入${name}`;
  return (
    <Form.Item
      key={name}
      name={['params', name]}
      label={renderLabel(label, !isRequired)}
      rules={isRequired ? [{ required: true, message: `请输入${name}` }] : []}
      style={{ marginBottom }}
      colon={false}
    >
      <Input placeholder={placeholder} />
    </Form.Item>
  );
};

export const LocateField: React.FC<Omit<FormFieldProps, 'isLocateField'>> = ({
  name,
  label,
  isRequired,
  marginBottom,
  placeholder: customPlaceholder,
}) => {
  const placeholder = customPlaceholder || `请用自然语言描述${label}`;
  return (
    <Form.Item
      key={name}
      name={['params', name]}
      label={renderLabel(label, !isRequired)}
      rules={
        isRequired
          ? [
              {
                required: true,
                message: `${label}不能为空`,
              },
            ]
          : []
      }
      style={{ marginBottom }}
      colon={false}
    >
      <TextArea rows={2} placeholder={placeholder} />
    </Form.Item>
  );
};

export const EnumField: React.FC<Omit<FormFieldProps, 'isLocateField'>> = ({
  name,
  label,
  fieldSchema,
  isRequired,
  marginBottom,
  placeholder: customPlaceholder,
}) => {
  const enumValues = (fieldSchema as ZodRuntimeAccess)._def?.values || [];
  const selectOptions = enumValues.map((value: string) => ({
    value,
    label:
      ENUM_VALUE_ZH[value] ?? value.charAt(0).toUpperCase() + value.slice(1),
  }));

  return (
    <Form.Item
      key={name}
      name={['params', name]}
      label={label}
      rules={isRequired ? [{ required: true, message: `请选择${name}` }] : []}
      style={{ marginBottom }}
      colon={false}
    >
      <Select
        placeholder={customPlaceholder || `请选择${name}`}
        options={selectOptions}
      />
    </Form.Item>
  );
};

export const NumberField: React.FC<Omit<FormFieldProps, 'isLocateField'>> = ({
  name,
  label,
  isRequired,
  marginBottom,
  placeholder: customPlaceholder,
}) => {
  const defaultPlaceholder = name === 'distance' ? 500 : 0;
  const placeholderValue = customPlaceholder
    ? Number(customPlaceholder) || defaultPlaceholder
    : defaultPlaceholder;
  const min = 0;
  const max = name === 'distance' ? 10000 : undefined;

  return (
    <Form.Item
      key={name}
      name={['params', name]}
      label={`${label}${name === 'distance' ? '（px）' : ''}`}
      rules={
        isRequired
          ? [
              { required: true, message: `请输入${name}` },
              {
                type: 'number',
                min,
                message: `${label}不能小于 ${min}`,
              },
            ]
          : [
              {
                type: 'number',
                min,
                message: `${label}不能小于 ${min}`,
              },
            ]
      }
      style={{
        flex: name === 'distance' ? 1 : undefined,
        marginBottom,
      }}
      colon={false}
    >
      <InputNumber
        placeholder={placeholderValue.toString()}
        min={min}
        max={max}
        step={name === 'distance' ? 10 : 1}
        style={{ width: '100%' }}
      />
    </Form.Item>
  );
};

export const BooleanField: React.FC<Omit<FormFieldProps, 'isLocateField'>> = ({
  name,
  label,
  isRequired,
  marginBottom,
  placeholder: customPlaceholder,
}) => {
  const selectOptions = [
    { value: true, label: '是' },
    { value: false, label: '否' },
  ];

  return (
    <Form.Item
      key={name}
      name={['params', name]}
      label={renderLabel(label, !isRequired)}
      rules={isRequired ? [{ required: true, message: `请选择${name}` }] : []}
      style={{ marginBottom }}
      colon={false}
    >
      <Select
        placeholder={customPlaceholder || `请选择${name}`}
        options={selectOptions}
      />
    </Form.Item>
  );
};
