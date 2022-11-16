import {useRef, useState} from 'react';
import {FormInstance, formInstance, Stores} from './formInstance';

export function useForm<T extends Stores>(form?: FormInstance<T>) {
  const formRef = useRef<FormInstance<T>>();
  const [, forceUpdate] = useState({});
  const handleForceUpdate = () => forceUpdate({});

  if (!formRef.current) {
    formRef.current = form ? form : formInstance<T>(handleForceUpdate);
  }

  return [formRef.current];
}
