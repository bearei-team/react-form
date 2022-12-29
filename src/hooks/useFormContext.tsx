import { Context, createContext, useContext } from 'react';
import type { FormInstance, Stores } from './formInstance';

export const FormContext = createContext({} as FormInstance<Stores>);

const useFormContext = <T extends Stores = Stores>() =>
  useContext<FormInstance<T>>(FormContext as Context<FormInstance<T>>);

export default useFormContext;
