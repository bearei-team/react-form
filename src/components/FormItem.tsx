import React, {useCallback, useEffect, useState} from 'react';
import {validateRule} from '../utils/validate';
import {useFormContext} from '../hooks/useFormContext';
import {RuleItem} from 'async-validator';
import {ValidateOptions} from 'src/utils/validate';

/**
 * 表单项目 Props
 */
export interface FormItemProps<T>
  extends Pick<ValidateOptions, 'rules' | 'validateFirst'> {
  /**
   * 名称
   */
  name?: keyof T;

  /**
   * 是否更新组件
   */
  shouldUpdate?: boolean;

  /**
   * 表单项目子级
   */
  children?: JSX.Element;
}

export function FormItem<T extends {}>({
  name,
  rules,
  children,
  validateFirst,
  shouldUpdate = false,
}: FormItemProps<T>) {
  const [, forceUpdate] = useState({});
  const {signInField, getFieldValue, setFieldsValue} = useFormContext<T>();
  const handleStoreChange = useCallback(
    (name?: keyof T) => (changeName?: keyof T) => {
      name === changeName && forceUpdate({});
    },
    []
  );

  const setChildrenProps = () => ({
    value: name && getFieldValue(name),
    onChange: (value: string | string[]) =>
      name && setFieldsValue({[name]: value} as T, true),
  });

  const handleValidate = useCallback(
    (rules?: RuleItem[]) => async () => {
      const isValidate = name && rules?.length !== 0;

      if (isValidate) {
        const value = getFieldValue(name);

        return validateRule({
          name: name as string,
          value,
          rules: rules!,
          validateFirst,
        });
      }

      return undefined;
    },
    [getFieldValue, name, validateFirst]
  );

  useEffect(() => {
    signInField({
      touched: false,
      props: {name, rules, validateFirst, shouldUpdate},
      onStoreChange: handleStoreChange(name),
      validate: handleValidate(rules),
    });
  }, [
    handleStoreChange,
    handleValidate,
    name,
    rules,
    shouldUpdate,
    signInField,
    validateFirst,
  ]);

  return <>{children && React.cloneElement(children, setChildrenProps())}</>;
}
