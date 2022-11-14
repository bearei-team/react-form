import React, {Context, useContext} from 'react';
import {FormInstance, Store} from './formInstance';

export const FormContext = React.createContext({} as FormInstance);
export function useFormContext<T = Store>() {
  return useContext<FormInstance<T>>(FormContext as Context<FormInstance<T>>);
}
