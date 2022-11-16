import React, {useEffect, useState} from 'react';
import {Callbacks, FormInstance, Stores} from '../hooks/formInstance';
import {useForm} from '../hooks/useForm';
import {FormContext} from '../hooks/useFormContext';

/**
 * 表单 Props
 */
export interface FormProps<T> extends Callbacks<T> {
  /**
   * 表单实例
   */
  form?: FormInstance<T>;

  /**
   * 初始化表单值
   */
  initialValues?: T;

  /**
   * 表单子节点
   */
  children?: React.ReactNode;
}

export function Form<T extends Stores = Stores>({
  form,
  children,
  initialValues,
  onFinish,
  onFinishFailed,
  onValuesChange,
}: FormProps<T>) {
  const [status, setStatus] = useState('idle');
  const [formInstance] = useForm(form);
  const {setCallbacks, setInitialValues} = formInstance;

  useEffect(() => {
    if (status === 'idle') {
      setCallbacks({onFinish, onFinishFailed, onValuesChange});
      setInitialValues(initialValues, status !== 'idle');
      setStatus('succeeded');
    }
  }, [
    status,
    initialValues,
    onFinish,
    onFinishFailed,
    onValuesChange,
    setCallbacks,
    setInitialValues,
  ]);

  return (
    <FormContext.Provider value={formInstance as FormInstance<Stores>}>
      {children}
    </FormContext.Provider>
  );
}
