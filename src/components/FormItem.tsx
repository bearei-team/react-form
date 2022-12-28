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
import type { Stores } from '../hooks/formInstance';
import useFormContext from '../hooks/useFormContext';
import validateRule, { ValidateOptions } from '../utils/validate';

export interface ControlProps {
  value: unknown;
  onValueChange?: (value?: unknown) => void;
}

/**
 * Base form item props
 */
export interface BaseFormItemProps<T = HTMLElement, F = Stores>
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
  name?: keyof F;

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
   * TODO:
   * Whether the form item should be updated
   */
  shouldUpdate?: boolean;

  control?: (props: ControlProps) => ReactNode;
}

/**
 * Form item props
 */
export interface FormItemProps<T, F> extends BaseFormItemProps<T, F> {
  /**
   * Render the form item label
   */
  renderLabel?: (props: FormItemLabelProps<T, F>) => ReactNode;

  /**
   * Render the form item extra
   */
  renderExtra?: (props: FormItemExtraProps<T, F>) => ReactNode;

  /**
   * Render the form item main
   */
  renderMain: (props: FormItemMainProps<T, F>) => ReactNode;

  /**
   * Render the form item container
   */
  renderContainer: (props: FormItemContainerProps<T, F>) => ReactNode;
}

export interface FormItemChildrenProps<T, F>
  extends Omit<BaseFormItemProps<T, F>, 'ref'> {
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

export type FormItemLabelProps<T, F> = FormItemChildrenProps<T, F>;
export type FormItemExtraProps<T, F> = FormItemChildrenProps<T, F>;
export type FormItemMainProps<T, F> = FormItemChildrenProps<T, F> &
  Pick<BaseFormItemProps<T>, 'ref'>;

export type FormItemContainerProps<T, F> = FormItemChildrenProps<T, F>;

const FormItem = <T extends HTMLElement, F extends Stores>({
  ref,
  name,
  rules,
  validateFirst,
  shouldUpdate,
  label,
  extra,
  required,
  renderLabel,
  renderExtra,
  renderMain,
  renderContainer,
  ...args
}: FormItemProps<T, F>) => {
  const id = useId();
  const [status, setStatus] = useState('idle');
  const [, forceUpdate] = useState({});
  const { signInField, getFieldValue, setFieldsValue, getFieldError } =
    useFormContext<F>();
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
    (name?: keyof F) => (changeName?: keyof F) => {
      name === changeName && forceUpdate({});
    },
    [],
  );

  const handleChildrenProps = () => ({
    value: name && getFieldValue(name),
    onValueChange: (value?: unknown) =>
      name && setFieldsValue({ [name]: value } as F),
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
        props: { name, rules, validateFirst, shouldUpdate },
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
    shouldUpdate,
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
