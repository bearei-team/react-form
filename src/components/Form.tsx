import {
  DetailedHTMLProps,
  FormHTMLAttributes,
  ReactNode,
  Ref,
  useEffect,
  useId,
  useState,
} from 'react';
import type { ViewProps } from 'react-native';
import type { Callbacks, FormInstance, Stores } from '../hooks/form-instance';
import useForm from '../hooks/use-form';
import { FormContext } from '../hooks/use-form-context';
import FormItem, { BaseFormItemProps } from './Form-item';

/**
 * Base form props
 */
export interface BaseFormProps<T, S>
  extends Partial<
    DetailedHTMLProps<FormHTMLAttributes<T>, T> & ViewProps & Callbacks<S>
  > {
  /**
   * Custom ref
   */
  ref?: Ref<T>;

  /**
   * Form instance
   */
  form?: FormInstance<S>;

  /**
   * Form layout
   */
  layout?: 'horizontal' | 'vertical';

  /**
   * Form label layout
   */
  labelLayout?: 'horizontal' | 'vertical' | 'inline';

  /**
   * Initializes the form value
   */
  initialValues?: S;

  /**
   *  Form items
   */
  items?: BaseFormItemProps<T, S>[];
}

/**
 * Form props
 */
export interface FormProps<T, S> extends BaseFormProps<T, S> {
  /**
   * Render the form main
   */
  renderMain: (props: FormMainProps<T, S>) => ReactNode;

  /**
   * Render the form container
   */
  renderContainer: (props: FormContainerProps<T, S>) => ReactNode;
}

export interface FormChildrenProps<T, S>
  extends Omit<BaseFormProps<T, S>, 'ref'> {
  /**
   * Component unique ID
   */
  id: string;
}

export type FormMainProps<T, S> = FormChildrenProps<T, S> &
  Pick<BaseFormProps<T, S>, 'ref'>;

export type FormContainerProps<T, S> = FormChildrenProps<T, S>;
export type FormType = typeof Form & {
  Item: typeof FormItem;
  useForm: typeof useForm;
};

const Form = <
  T extends HTMLFormElement = HTMLFormElement,
  S extends Stores = Stores,
>({
  ref,
  form,
  initialValues,
  onFinish,
  onFinishFailed,
  onValuesChange,
  renderMain,
  renderContainer,
  ...args
}: FormProps<T, S>) => {
  const id = useId();
  const [status, setStatus] = useState('idle');
  const [formInstance] = useForm(form);
  const { setCallbacks, setInitialValues } = formInstance;
  const childrenProps = { ...args, id };
  const main = renderMain({ ...childrenProps, ref });
  const container = renderContainer({
    ...childrenProps,
    children: main,
  });

  setCallbacks({ onFinish, onFinishFailed, onValuesChange });

  useEffect(() => {
    if (status === 'idle') {
      setInitialValues(initialValues, status !== 'idle');
      setStatus('succeeded');
    }
  }, [initialValues, setInitialValues, status]);

  return (
    <FormContext.Provider value={formInstance as FormInstance<Stores>}>
      {container}
    </FormContext.Provider>
  );
};

Object.defineProperty(Form, 'Item', { value: FormItem });
Object.defineProperty(Form, 'useForm', { value: useForm });

export default Form as FormType;
