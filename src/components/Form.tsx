import React, {useEffect, useState} from 'react';
import {Callback, FormInstance, Store} from '../hooks/formInstance';
import {useForm} from '../hooks/useForm';
import {FormContext} from '../hooks/useFormContext';

/**
 * 表单 Props
 */
export interface FormProps<T> extends Callback<T> {
  /**
   * 表单实例
   */
  form?: FormInstance<T>;

  /**
   * 初始化值
   */
  initialValues?: T;

  /**
   * 表单子节点
   */
  children?: React.ReactNode;
}

export function Form<T extends {} = Store>({
  children,
  form,
  initialValues,
  onFinish,
  onFinishFailed,
  onValuesChange,
}: FormProps<T>) {
  const [status, setStatus] = useState('idle');
  const [formInstance] = useForm(form);
  const {setCallback, setInitialValues} = formInstance;

  useEffect(() => {
    if (status === 'idle') {
      setCallback({onFinish, onFinishFailed, onValuesChange});
      setInitialValues(initialValues, status !== 'idle');
      setStatus('succeed');
    }
  }, [
    initialValues,
    onFinish,
    onFinishFailed,
    onValuesChange,
    setCallback,
    setInitialValues,
    status,
  ]);

  return (
    <FormContext.Provider value={formInstance as FormInstance<Store>}>
      {children}
    </FormContext.Provider>
  );
}

export {useForm} from '../hooks/useForm';
export {FormItem} from './FormItem';
export {useFormContext} from '../hooks/useFormContext';
