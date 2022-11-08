import React, {useContext} from 'react';
import {FormInstance} from './useForm';

export const FormContext = React.createContext<FormInstance>(
  {} as FormInstance
);

const useFormContext = () => useContext(FormContext);

export default useFormContext;
