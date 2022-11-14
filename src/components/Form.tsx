import useForm, {Callbacks, FormInstance, Store} from '../hooks/useForm';
import React, {PropsWithChildren, useEffect, useState} from 'react';
import FormItem from './FormItem';
import useFormContext, {FormContext} from '../hooks/useFormContext';

/**
 * 表单 Props
 */
export interface FormProps<T = Record<string, unknown>> {
  /**
   * 表单实例
   */
  form?: FormInstance<T>;

  /**
   * 初始化值
   */
  initialValues?: Store<T>;

  /**
   * 监听完成
   */
  onFinish?: Callbacks<T>['onFinish'];

  /**
   * 监听完成失败
   */
  onFinishFailed?: Callbacks<T>['onFinishFailed'];

  /**
   * 监听值变更
   */
  onValuesChange?: Callbacks<T>['onValuesChange'];
}

/**
 * 表单类型
 */
export type FormType = {
  <T = Record<string, unknown>>(
    props: FormProps<T> & PropsWithChildren<FormProps<T>>
  ): React.ReactElement;
};

/**
 * 表单实例
 */
export interface FormInterface extends FormType {
  /**
   * 表单项目
   */
  Item: typeof FormItem;

  /**
   * 表单 hook
   */
  useForm: typeof useForm;

  /**
   * 表单 Context
   */
  useFormContext: typeof useFormContext;
}

const Form: FormType = ({
  children,
  form,
  initialValues,
  onFinish,
  onFinishFailed,
  onValuesChange,
}) => {
  const [status, setStatus] = useState('idle');
  const [formInstance] = useForm(form);
  const {setCallbacks, setInitialValues} = formInstance;

  setCallbacks({onFinish, onFinishFailed, onValuesChange});
  setInitialValues(initialValues, status !== 'idle');

  useEffect(() => {
    status === 'idle' && setStatus('succeeded');
  }, [status]);

  return (
    <FormContext.Provider
      value={formInstance as FormInstance<Record<string, unknown>>}
    >
      {children}
    </FormContext.Provider>
  );
};

Object.defineProperty(Form, 'Item', {value: FormItem});
Object.defineProperty(Form, 'useForm', {value: useForm});
Object.defineProperty(Form, 'useFormContext', {value: useFormContext});

export default Form as FormInterface;
