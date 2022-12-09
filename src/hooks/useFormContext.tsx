import React, {Context, useContext} from 'react';
import {FormInstance, Stores} from './formInstance';

export const FormContext = React.createContext({} as FormInstance);

const useFormContext = <T extends Stores>() =>
  useContext<FormInstance<T>>(FormContext as Context<FormInstance<T>>);

export default useFormContext;
