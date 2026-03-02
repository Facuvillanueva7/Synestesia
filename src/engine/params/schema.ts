export type ParamType = 'slider' | 'toggle' | 'select' | 'color' | 'vec2' | 'vec3' | 'button';

interface ParamBase<T> {
  type: ParamType;
  label: string;
  description?: string;
  defaultValue: T;
  group?: string;
  locked?: boolean;
  visibleWhen?: { key: string; equals: unknown };
}

export interface SliderParam extends ParamBase<number> {
  type: 'slider';
  min: number;
  max: number;
  step: number;
}
export interface ToggleParam extends ParamBase<boolean> {
  type: 'toggle';
}
export interface SelectParam extends ParamBase<string> {
  type: 'select';
  options: Array<{ label: string; value: string }>;
}
export interface ColorParam extends ParamBase<string> {
  type: 'color';
}
export interface VecParam extends ParamBase<[number, number] | [number, number, number]> {
  type: 'vec2' | 'vec3';
  min: number;
  max: number;
  step: number;
}
export interface ButtonParam extends ParamBase<string> {
  type: 'button';
  action: 'randomizeSeed';
}

export type ParamDefinition =
  | SliderParam
  | ToggleParam
  | SelectParam
  | ColorParam
  | VecParam
  | ButtonParam;

export type ParamSchema = Record<string, ParamDefinition>;
export type ParamValues = Record<string, number | boolean | string | number[]>;

export const defaultsFromSchema = (schema: ParamSchema): ParamValues => {
  const values: ParamValues = {};
  Object.entries(schema).forEach(([key, param]) => {
    values[key] = Array.isArray(param.defaultValue)
      ? [...param.defaultValue]
      : (param.defaultValue as any);
  });
  return values;
};

export const clampParamValue = (definition: ParamDefinition, value: unknown): ParamValues[string] => {
  if (definition.type === 'slider') {
    const v = typeof value === 'number' ? value : definition.defaultValue;
    return Math.min(definition.max, Math.max(definition.min, v));
  }
  if (definition.type === 'vec2' || definition.type === 'vec3') {
    const arr = Array.isArray(value) ? value : definition.defaultValue;
    return arr.map((n) => Math.min(definition.max, Math.max(definition.min, Number(n)))) as number[];
  }
  if (definition.type === 'toggle') return Boolean(value);
  if (definition.type === 'select' || definition.type === 'color' || definition.type === 'button') {
    return typeof value === 'string' ? value : definition.defaultValue;
  }
  return definition.defaultValue as any;
};
