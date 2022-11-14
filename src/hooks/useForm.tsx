import {useRef, useState} from 'react';
import {FormInstance, formInstance} from './formInstance';

export function useForm<T extends {}>(form?: FormInstance<T>) {
  const formRef = useRef<FormInstance<T>>();
  const [, forceUpdate] = useState({});
  const handleForceUpdate = () => forceUpdate({});

  if (!formRef.current) {
    formRef.current = form ? form : formInstance<T>(handleForceUpdate);
  }

  return [formRef.current];
}
