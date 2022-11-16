import React, {Context, useContext} from 'react';
import {FormInstance, Stores} from './formInstance';

export const FormContext = React.createContext({} as FormInstance);
export function useFormContext<T = Stores>() {
  return useContext<FormInstance<T>>(FormContext as Context<FormInstance<T>>);
}
