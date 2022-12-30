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
import type { Stores } from '../hooks/form_instance';
import useFormContext from '../hooks/use_form_context';
import validateRule, { ValidateOptions } from '../utils/validate';

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
}

/**
 * Base form item props
 */
export interface BaseFormItemProps<T, S>
  extends Partial<
    DetailedHTMLProps<HTMLAttributes<T>, T> &
      ViewProps &
      Pick<ValidateOptions, 'rules' | 'validateFirst'>
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
  validateFirst,
  label,
  extra,
  required,
  renderLabel,
  renderExtra,
  renderMain,
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
    (name?: keyof S) => (changeName?: keyof S) => {
      name === changeName && forceUpdate({});
    },
    [],
  );

  const handleChildrenProps = () => ({
    value: name && getFieldValue(name),
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

  useEffect(() => {
    if (status === 'idle') {
      signInField({
        touched: false,
        props: { name, rules, validateFirst },
        onStoreChange: handleStoreChange(name),
        validate: handleValidate(rules),
      });

      setStatus('succeeded');
    }
  }, [
    handleStoreChange,
    handleValidate,
    name,
    rules,
    signInField,
    status,
    validateFirst,
  ]);

  const labelNode =
    label &&
    renderLabel?.({
      ...childrenProps,
      children: label,
    });

  const extraNode =
    extra &&
    renderExtra?.({
      ...childrenProps,
      children: errorMessage ?? extra,
    });

  const main = renderMain({
    ...childrenProps,
    ...handleChildrenProps(),
    label: labelNode,
    extra: extraNode,
    ref,
  });

  const container = renderContainer({ ...childrenProps, children: main });

  return <>{container}</>;
};

export default FormItem;
