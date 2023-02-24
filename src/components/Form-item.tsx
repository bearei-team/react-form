import type { RuleItem } from 'async-validator';
import {
  DetailedHTMLProps,
  HTMLAttributes,
  ReactNode,
  Ref,
  useCallback,
  useEffect,
  useId,
  useState,
} from 'react';
import type { ViewProps } from 'react-native';
import type { Stores } from '../hooks/form-instance';
import useFormContext from '../hooks/use-form-context';
import validateRule, { ValidateOptions } from '../utils/validate';
import type { BaseFormProps } from './Form';

/**
 * Controlled component props
 */
export interface ControlProps {
  /**
   * Component value
   */
  value: unknown;

  /**
   * This function is called when the value of the controlled component changes
   */
  onValueChange?: (value?: unknown) => void;

  /**
   * This function is called when a controlled component changes
   */
  onChange?: () => void;

  /**
   * Component prefix
   */
  prefix?: ReactNode;

  /**
   * Component suffix
   */
  suffix?: ReactNode;
}

/**
 * Base form item props
 */
export interface BaseFormItemProps<T, S>
  extends Partial<
    DetailedHTMLProps<HTMLAttributes<T>, T> &
      ViewProps &
      Pick<ValidateOptions, 'rules' | 'validateFirst'> &
      Pick<BaseFormProps<T, S>, 'layout'>
  > {
  /**
   * Custom ref
   */
  ref?: Ref<T>;

  /**
   * Form item field name
   */
  name?: keyof S;

  /**
   * Form item label
   */
  label?: ReactNode;

  /**
   * Whether the form item is unstyled
   */
  noStyle?: boolean;

  /**
   * The initial value of the form item
   */
  initialValue?: unknown;

  /***
   * Additional content for the form item
   */
  extra?: ReactNode;

  /**
   * Whether the form entry is a required field
   */
  required?: boolean;

  /**
   * Render the controlled component
   */
  renderControl?: (props: ControlProps) => JSX.Element;
}

/**
 * Form item props
 */
export interface FormItemProps<T, S> extends BaseFormItemProps<T, S> {
  /**
   * Render the form item label
   */
  renderLabel?: (props: FormItemLabelProps<T, S>) => ReactNode;

  /**
   * Render the form item extra
   */
  renderExtra?: (props: FormItemExtraProps<T, S>) => ReactNode;

  /**
   * Render the form item main
   */
  renderMain: (props: FormItemMainProps<T, S>) => ReactNode;

  /**
   * Render the form item container
   */
  renderContainer: (props: FormItemContainerProps<T, S>) => ReactNode;
}

export interface FormItemChildrenProps<T, S>
  extends Omit<BaseFormItemProps<T, S>, 'ref'> {
  /**
   * Component unique ID
   */
  id: string;

  /**
   * Form item value
   */
  value?: unknown;

  /**
   * This function is called when the value of the form option changes
   */
  onValueChange?: (value?: unknown) => void;
}

export type FormItemLabelProps<T, S> = FormItemChildrenProps<T, S>;
export type FormItemExtraProps<T, S> = FormItemChildrenProps<T, S>;
export type FormItemMainProps<T, S> = FormItemChildrenProps<T, S> &
  Pick<BaseFormItemProps<T, S>, 'ref'>;

export type FormItemContainerProps<T, S> = FormItemChildrenProps<T, S>;

const FormItem = <
  T extends HTMLElement = HTMLElement,
  S extends Stores = Stores,
>({
  ref,
  name,
  rules,
  label,
  extra,
  required,
  validateFirst,
  renderExtra,
  renderMain,
  renderLabel,
  renderContainer,
  ...args
}: FormItemProps<T, S>) => {
  const id = useId();
  const [status, setStatus] = useState('idle');
  const [, forceUpdate] = useState({});
  const { signInField, getFieldValue, setFieldsValue, getFieldError } =
    useFormContext<S>();

  const errorMessage = name && getFieldError(name)?.errors[0].message;
  const childrenProps = {
    ...args,
    required:
      typeof required === 'boolean'
        ? required
        : rules?.some(({ required }) => required),
    id,
  };

  const handleStoreChange = useCallback(
    (name?: keyof S) => (changeName?: keyof S) =>
      name === changeName && forceUpdate({}),
    [],
  );

  const handleChildrenProps = () => ({
    value: name && getFieldValue(name),

    /**
     * Used to bind controlled component change events
     */
    onChange: () => undefined,
    onValueChange: (value?: unknown) =>
      name && setFieldsValue({ [name]: value } as S),
  });

  const handleValidate = useCallback(
    (rules?: RuleItem[]) => async () => {
      const isValidate = name && rules?.length !== 0;

      if (isValidate) {
        const value = getFieldValue(name);

        return validateRule({
          name: name as string,
          value,
          rules,
          validateFirst,
        });
      }

      return undefined;
    },
    [getFieldValue, name, validateFirst],
  );

  const labelNode =
    label &&
    renderLabel?.({
      ...childrenProps,
      children: label,
    });

  const extraNode = renderExtra?.({
    ...childrenProps,
    children: errorMessage ?? extra,
  });

  const main = renderMain({
    ...childrenProps,
    ...handleChildrenProps(),
    ref,
    label: labelNode,
    extra: extraNode,
  });

  const container = renderContainer({ ...childrenProps, children: main });

  useEffect(() => {
    if (status === 'idle') {
      signInField({
        props: { name, rules, validateFirst },
        touched: false,
        validate: handleValidate(rules),
        onStoreChange: handleStoreChange(name),
      });

      setStatus('succeeded');
    }
  }, [
    name,
    rules,
    status,
    validateFirst,
    signInField,
    handleValidate,
    handleStoreChange,
  ]);

  return <>{container}</>;
};

export default FormItem;
