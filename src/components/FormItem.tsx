import React, {useCallback, useEffect, useState} from 'react';
import {validateRule} from '../utils/validate';
import {useFormContext} from '../hooks/useFormContext';
import {RuleItem} from 'async-validator';
import {ValidateOptions} from '../utils/validate';
import {Stores} from '../hooks/formInstance';

/**
 * 表单项目 Props
 */
export interface FormItemProps<T>
  extends Partial<Pick<ValidateOptions, 'rules' | 'validateFirst'>> {
  /**
   * 表单字段名称
   */
  name?: keyof T;

  /**
   * 表单项目子元素
   */
  children?: JSX.Element;

  /**
   * 表单项目是否应该更新
   */
  shouldUpdate?: boolean;
}

export function FormItem<T extends Stores = Stores>({
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
      name === changeName && handleForceUpdate();
    },
    [],
  );

  const handleForceUpdate = () => forceUpdate({});
  const setChildrenProps = () => ({
    value: name && getFieldValue(name),
    onValueChange: (value: unknown) => name && setFieldsValue({[name]: value} as T, true),
  });

  const handleValidate = useCallback(
    (rules?: RuleItem[]) => async () => {
      const isValidate = name && rules?.length !== 0;

      if (isValidate) {
        const value = getFieldValue(name);

        return validateRule({
          name: name as string,
          value,
          rules,
          validateFirst,
        });
      }

      return undefined;
    },
    [name, validateFirst, getFieldValue],
  );

  useEffect(() => {
    signInField({
      touched: false,
      props: {name, rules, validateFirst, shouldUpdate},
      onStoreChange: handleStoreChange(name),
      onForceUpdate: handleForceUpdate,
      validate: handleValidate(rules),
    });
  }, [name, rules, shouldUpdate, validateFirst, signInField, handleValidate, handleStoreChange]);

  return <>{children && React.cloneElement(children, setChildrenProps())}</>;
}
