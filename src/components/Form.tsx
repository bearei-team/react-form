import {ReactNode, Ref, useEffect, useId, useState} from 'react';
import {Callbacks, FormInstance, Stores} from '../hooks/formInstance';
import useForm from '../hooks/useForm';
import {FormContext} from '../hooks/useFormContext';
import FormItem, {BaseFormItemProps} from './FormItem';

/**
 * Base form props
 */
export interface BaseFormProps<T, F = Stores> extends Callbacks<F> {
  /**
   * Custom ref
   */
  ref?: Ref<T>;

  /**
   * Form instance
   */
  form?: FormInstance<F>;

  /**
   * Initializes the form value
   */
  initialValues?: F;

  /**
   *  Form items
   */
  items?: BaseFormItemProps<T, F>[];
}

/**
 * Form props
 */
export interface FormProps<T, F = Stores> extends BaseFormProps<T, F> {
  /**
   * Render the form main
   */
  renderMain?: (props: FormMainProps<T, F>) => ReactNode;

  /**
   * Render the form container
   */
  renderContainer?: (props: FormContainerProps<T, F>) => ReactNode;
}

export interface FormChildrenProps<T, F> extends Omit<BaseFormProps<T, F>, 'ref'> {
  /**
   * Component unique ID
   */
  id: string;
  children?: ReactNode;
}

export type FormMainProps<T, F> = FormChildrenProps<T, F>;
export type FormContainerProps<T, F> = FormChildrenProps<T, F> & Pick<BaseFormProps<T>, 'ref'>;

export type FormType = typeof Form & {Item: typeof FormItem};

const Form = <T extends HTMLElement, F extends Stores>({
  ref,
  form,
  initialValues,
  onFinish,
  onFinishFailed,
  onValuesChange,
  renderMain,
  renderContainer,
  ...args
}: FormProps<T, F>) => {
  const id = useId();
  const [status, setStatus] = useState('idle');
  const [formInstance] = useForm(form);
  const {setCallbacks, setInitialValues} = formInstance;
  const childrenProps = {...args, id};

  useEffect(() => {
    if (status === 'idle') {
      setCallbacks({onFinish, onFinishFailed, onValuesChange});
      setInitialValues(initialValues, status !== 'idle');
      setStatus('succeeded');
    }
  }, [
    initialValues,
    onFinish,
    onFinishFailed,
    onValuesChange,
    setCallbacks,
    setInitialValues,
    status,
  ]);

  const main = renderMain?.({
    ...childrenProps,
  });

  const content = <>{main}</>;
  const container = renderContainer?.({
    ...childrenProps,
    children: content,
    ref,
  });

  return (
    <FormContext.Provider value={formInstance as FormInstance<Stores>}>
      {container}
    </FormContext.Provider>
  );
};

Object.defineProperty(Form, 'Item', {value: FormItem});

export default Form as FormType;
