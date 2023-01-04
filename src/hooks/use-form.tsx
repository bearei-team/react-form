import { useRef, useState } from 'react';
import formInstance, { FormInstance, Stores } from './form-instance';

const useForm = <T extends Stores = Stores>(form?: FormInstance<T>) => {
  const formRef = useRef<FormInstance<T>>();
  const [, forceUpdate] = useState({});
  const handleForceUpdate = () => forceUpdate({});

  if (!formRef.current) {
    formRef.current = form ? form : formInstance<T>(handleForceUpdate);
  }

  return [formRef.current];
};

export default useForm;
