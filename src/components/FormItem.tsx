import {RuleItem} from 'async-validator';
import {ReactNode, Ref, useCallback, useEffect, useId, useState} from 'react';
import {Stores} from '../hooks/formInstance';
import useFormContext from '../hooks/useFormContext';
import validateRule, {ValidateOptions} from '../utils/validate';

/**
 * Base form item props
 */
export interface BaseFormItemProps<T = HTMLElement, F = Stores>
  extends Partial<Pick<ValidateOptions, 'rules' | 'validateFirst'>> {
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
}

/**
 * Form item props
 */
export interface FormItemProps<T, F> extends BaseFormItemProps<T, F> {
  /**
   * Render the form item main
   */
  renderMain?: (props: FormItemMainProps<T, F>) => ReactNode;

  /**
   * Render the form item container
   */
  renderContainer?: (props: FormItemContainerProps<T, F>) => ReactNode;
}

export interface FormItemChildrenProps<T, F> extends Omit<BaseFormItemProps<T, F>, 'ref'> {
  /**
   * Component unique ID
   */
  id: string;
  children?: ReactNode;

  /**
   * Form item value
   */
  value?: unknown;

  /**
   * This function is called when the value of the form option changes
   */
  onValueChange?: (value?: unknown) => void;
}

export type FormItemMainProps<T, F> = FormItemChildrenProps<T, F> &
  Pick<BaseFormItemProps<T>, 'ref'>;

export type FormItemContainerProps<T, F> = FormItemChildrenProps<T, F>;

const FormItem = <T extends HTMLElement, F extends Stores>({
  ref,
  name,
  rules,
  validateFirst,
  shouldUpdate,
  renderMain,
  renderContainer,
  ...args
}: FormItemProps<T, F>) => {
  const id = useId();
  const [status, setStatus] = useState('idle');
  const [, forceUpdate] = useState({});
  const {signInField, getFieldValue, setFieldsValue} = useFormContext<F>();
  const childrenProps = {...args, id};
  const handleStoreChange = useCallback(
    (name?: keyof F) => (changeName?: keyof F) => {
      name === changeName && forceUpdate({});
    },
    [],
  );

  const handleChildrenProps = () => ({
    value: name && getFieldValue(name),
    onValueChange: (value?: unknown) => name && setFieldsValue({[name]: value} as F),
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
        props: {name, rules, validateFirst, shouldUpdate},
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

  const main = renderMain?.({
    ...childrenProps,
    ...handleChildrenProps(),
    ref,
  });

  const content = <>{main}</>;
  const container = renderContainer?.({
    ...childrenProps,
    children: content,
  });

  return <>{container}</>;
};

export default FormItem;
