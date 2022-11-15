import React, {useCallback, useEffect, useState} from 'react';
import {validateRule} from '../utils/validate';
import {useFormContext} from '../hooks/useFormContext';
import {RuleItem} from 'async-validator';
import {ValidateOptions} from 'src/utils/validate';
import {Stores} from 'src/hooks/formInstance';

/**
 * 表单项目 Props
 */
export interface FormItemProps<T>
  extends Pick<ValidateOptions, 'rules' | 'validateFirst'> {
  /**
   * 表单字段名称
   */
  name?: keyof T;

  /**
   * 表单项目子元素
   */
  children?: JSX.Element;
}

export function FormItem<T extends {} = Stores>({
  name,
  rules,
  children,
  validateFirst,
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
    onValueChange: (value: unknown) =>
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
    [name, validateFirst, getFieldValue]
  );

  useEffect(() => {
    signInField({
      touched: false,
      props: {name, rules, validateFirst},
      onStoreChange: handleStoreChange(name),
      validate: handleValidate(rules),
    });
  }, [
    name,
    rules,
    validateFirst,
    signInField,
    handleValidate,
    handleStoreChange,
  ]);

  return <>{children && React.cloneElement(children, setChildrenProps())}</>;
}
