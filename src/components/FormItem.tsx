import React, {useCallback, useEffect, useState} from 'react';
import validateRules from '../utils/validate';
import useFormContext from '../hooks/useFormContext';
import {RuleItem} from 'async-validator';
import {Store} from '../hooks/useForm';

/**
 * 表单项目 Props
 */
export interface FormItemProps<T = Store> {
  /**
   * 字段名称
   */
  name?: keyof T;

  /**
   * 标签
   */
  label?: string | JSX.Element;

  /**
   * 验证规则集合
   */
  rules?: RuleItem[];

  /**
   * 是否优先验证首个规则. 如果开启,验证规则中出现第一个规则错误时将停止后续的规则验证.
   */
  validateFirst?: boolean;

  /**
   * 是否更新组件
   */
  shouldUpdate?: boolean;

  /**
   * 表单项目子级
   */
  children?: JSX.Element;
}

const FormItem: React.FC<FormItemProps> = ({
  name = '',
  rules,
  children,
  validateFirst,
  label,
  shouldUpdate = false,
}) => {
  const {signInField, getFieldValue, setFieldsValue, setFieldErrors} =
    useFormContext();

  const [, forceUpdate] = useState({});
  const handleStoreChange =
    (name = '') =>
    (changeName?: string) => {
      name === changeName && forceUpdate({});
    };

  const setChildrenProps = () => ({
    ...(label ? {prefix: label} : undefined),
    value: name && getFieldValue(name),
    touched: false,
    onValueChange: (value: string | string[]) =>
      name && setFieldsValue({[name]: value}),
  });

  const handleValidate = useCallback(
    (rules?: RuleItem[]) => async () => {
      const isValidate = name && rules?.length !== 0;

      if (isValidate) {
        const value = getFieldValue(name);
        const validatePromise = validateRules({
          name,
          value,
          rules: rules!,
          validateFirst,
        });

        validatePromise.then(error => setFieldErrors(name, error));

        return validatePromise;
      }

      return undefined;
    },
    [getFieldValue, name, setFieldErrors, validateFirst]
  );

  useEffect(() => {
    signInField({
      touched: false,
      props: {name, rules, validateFirst, shouldUpdate},
      onStoreChange: handleStoreChange(name),
      validate: handleValidate(rules),
    });
  }, [name, rules, shouldUpdate, validateFirst, signInField, handleValidate]);

  return <>{children && React.cloneElement(children, setChildrenProps())}</>;
};

export default FormItem;
