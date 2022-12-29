import type { ValidateError } from 'async-validator';
import type { ValidateOptions } from '..';
import type { BaseFormItemProps } from '../components/FormItem';
import handleNamePath, { NamePath } from '../utils/namePath';

/**
 * Form fields are stored
 */
export type Stores = Record<string, unknown>;

/**
 * Form field checksum error
 */
export interface FieldError extends Pick<ValidateOptions, 'rules'> {
  errors: ValidateError[];
}

export type Errors<T> = Record<keyof T, FieldError | undefined>;

/**
 * The form field entity
 */
export interface FieldEntity<T> {
  /**
   * This function is called when the form field storage changes
   */
  onStoreChange: (name?: keyof T) => void;

  /**
   * Validate form fields
   */
  validate: () => Promise<FieldError | undefined>;

  props: BaseFormItemProps<HTMLElement, T>;

  /**
   * Whether an action has taken place in the current form field
   */
  touched: boolean;
}

/**
 * From callbacks
 */
export interface Callbacks<T> {
  /**
   * This function is called when the form is completed
   */
  onFinish?: <E = unknown>(options: { event?: E; values: T }) => void;

  /**
   * This function is called when the form fails to complete
   */
  onFinishFailed?: (errors: Errors<T>) => void;

  /**
   * This function is called when the form field value changes
   */
  onValuesChange?: (changedValues: T, values: T) => void;
}

/**
 * From instance
 */
export interface FormInstance<T> {
  /**
   * Gets the form field entities
   */
  getFieldEntities: (signOut?: boolean) => FieldEntity<T>[];

  /**
   * Gets the form field entities name
   */
  getFieldEntitiesName: (
    names?: (keyof T)[],
    signOut?: boolean,
  ) => (keyof T | undefined)[];

  /**
   * Sign in form field
   */
  signInField: (entity: FieldEntity<T>) => { signOut: () => void };

  /**
   * Sign out form field
   */
  signOutField: (name?: NamePath<T>) => void;

  /**
   * Set the value of the form fields
   */
  setFieldsValue: (
    values?: T,
    options?: { validate?: boolean; response?: boolean },
  ) => void;

  /**
   * Gets the value of the form field
   */
  getFieldValue: {
    (): T;
    (name?: keyof T): T[keyof T];
    (name?: (keyof T)[]): T;
  };

  /**
   * Error setting form field
   */
  setFieldError: (error: Errors<T>) => void;

  /**
   * Gets the form field error
   */
  getFieldError: {
    (): Errors<T>;
    (name?: keyof T): Errors<T>[keyof T];
    (name?: (keyof T)[]): Errors<T>;
  };

  /**
   * Set the form initialization value
   */
  setInitialValues: (values?: T, init?: boolean) => void;

  /**
   * Gets the form initialization value
   */
  getInitialValues: () => T;

  /**
   * Sets the form callbacks
   */
  setCallbacks: (callbackValues: Callbacks<T>) => void;

  /**
   * Sets whether the form field is operated on
   */
  setFieldTouched: (name?: keyof T, touched?: boolean) => void;

  /**
   * Check that the form fields have been manipulated
   */
  isFieldTouched: (name?: NamePath<T>) => boolean;

  /**
   * Validate form field
   */
  validateField: {
    (): Promise<Errors<T>>;
    (name?: keyof T): Promise<Errors<T>[keyof T]>;
    (name?: (keyof T)[]): Promise<Errors<T>>;
  };

  /**
   * Reset the form field
   */
  resetField: (name?: NamePath<T>) => void;

  /**
   * Complete the form field submission
   */
  submit: (skipValidate?: boolean) => void;
}

const formInstance = <T extends Stores = Stores>(
  forceUpdateForm: () => void,
): FormInstance<T> => {
  const stores = {} as T;
  const initialValues = {} as T;
  const callbacks = {} as Callbacks<T>;
  const errors = {} as Errors<T>;

  let fieldEntities: FieldEntity<T>[] = [];

  const getFieldEntities = (signOut = false) =>
    signOut
      ? fieldEntities
      : fieldEntities.filter(fieldEntity => fieldEntity.props.name);

  const getFieldEntitiesName = (names?: (keyof T)[], signOut = false) => {
    const entityNames = getFieldEntities(signOut).map(
      ({ props }) => props.name,
    );

    return [
      ...(names
        ? entityNames.filter(name => name && names.includes(name))
        : entityNames),
    ];
  };

  const signInField = (entity: FieldEntity<T>) => {
    const { name } = entity.props;

    if (name) {
      const currentEntities = getFieldEntities(true);
      const exist = currentEntities.find(({ props }) => props.name === name);

      if (!exist) {
        fieldEntities = [...currentEntities, entity];

        setFieldsValue({ [name]: undefined } as T, {
          validate: false,
          response: false,
        });
        setFieldError({ [name]: undefined } as Errors<T>);
      }
    }

    return {
      signOut: () => signOutField(name),
    };
  };

  const signOutField = (name?: NamePath<T>) => {
    const names = handleNamePath(name);
    const handleSignOut = (name?: keyof T) => {
      if (name) {
        const currentEntities = getFieldEntities(true);
        const fieldEntity = currentEntities.find(
          ({ props }) => props.name === name,
        );

        if (fieldEntity) {
          const nextStores = { ...stores };
          const nextErrors = { ...errors };

          delete nextStores[name];
          delete nextErrors[name];

          fieldEntities = currentEntities.filter(
            ({ props }) => props.name !== name,
          );

          setFieldsValue(nextStores, { validate: false, response: false });
          setFieldError(nextErrors);
        }
      }
    };

    getFieldEntitiesName(names).forEach(handleSignOut);
  };

  const setFieldsValue = (
    values = {} as T,
    { validate = true, response = true } = {},
  ) => {
    const { onValuesChange } = callbacks;
    const entities = getFieldEntities();
    const handleStoreChange = (
      name: keyof T,
      onStoreChange: (name: keyof T) => void,
    ) => {
      setFieldTouched(name, true);
      onStoreChange(name);
    };

    Object.assign(stores, values);

    values &&
      response &&
      Object.keys(values).forEach(key => {
        const entity = entities.find(({ props }) => props.name === key);

        if (entity) {
          handleStoreChange(key, entity.onStoreChange);

          validate && entity.validate();
        }
      });

    onValuesChange?.(values, stores);
  };

  function getFieldValue(): T;
  function getFieldValue(name?: keyof T): T[keyof T];
  function getFieldValue(name?: (keyof T)[]): T;
  function getFieldValue(name?: NamePath<T>) {
    const names = handleNamePath(name);
    const values = {} as T;
    const handleValue = (name?: keyof T) =>
      name && Object.assign(values, { [name]: stores[name] });

    names
      ? getFieldEntitiesName(names).forEach(handleValue)
      : Object.assign(values, stores);

    return !Array.isArray(name) && name ? values[name] : values;
  }

  const setFieldError = (error: Errors<T>) => {
    error && Object.assign(errors, error);
  };

  function getFieldError(): Errors<T>;
  function getFieldError(name?: keyof T): Errors<T>[keyof T];
  function getFieldError(name?: (keyof T)[]): Errors<T>;
  function getFieldError(name?: NamePath<T>) {
    const names = handleNamePath(name);
    const errs = {} as Errors<T>;
    const handleError = (name?: keyof T) =>
      name && Object.assign(errs, { [name]: errors[name] });

    names
      ? getFieldEntitiesName(names).forEach(handleError)
      : Object.assign(errs, errors);

    return !Array.isArray(name) && name ? errs[name] : errs;
  }

  const setInitialValues = (values = {} as T, initialized?: boolean) => {
    if (!initialized) {
      Object.assign(initialValues, values);

      const names = getFieldEntitiesName();
      const fieldsValue = {} as T;

      Object.entries(initialValues)
        .filter(([key]) => names.includes(key))
        .forEach(([key, value]) =>
          Object.assign(fieldsValue, { [key]: value }),
        );

      setFieldsValue(fieldsValue);
    }
  };

  const getInitialValues = () => initialValues;
  const setCallbacks = (callbackValues: Callbacks<T>) => {
    Object.assign(callbacks, callbackValues);
  };

  const setFieldTouched = (name?: keyof T, touched = false) => {
    name &&
      (fieldEntities = [
        ...getFieldEntities().map(fieldEntity =>
          fieldEntity.props.name === name
            ? { ...fieldEntity, touched }
            : fieldEntity,
        ),
      ]);
  };

  const isFieldTouched = (name?: NamePath<T>) => {
    const names = handleNamePath(name);
    const entities = getFieldEntities();
    const handleFieldTouched = (name?: keyof T) =>
      name && entities.find(({ props }) => props.name === name)?.touched;

    return getFieldEntitiesName(names)
      .map(handleFieldTouched)
      .every(item => item);
  };

  function validateField(): Promise<Errors<T>>;
  function validateField(name?: keyof T): Promise<Errors<T>[keyof T]>;
  function validateField(name?: (keyof T)[]): Promise<Errors<T>>;
  async function validateField(name?: NamePath<T>) {
    const names = handleNamePath(name);
    const entities = getFieldEntities();
    const handleValidate = (name?: keyof T) =>
      name
        ? entities
            .find(({ props }) => props.name === name)
            ?.validate()
            .then(result => {
              if (result) {
                setFieldError({ [name]: result } as Errors<T>);

                return result;
              }

              return undefined;
            })
        : undefined;

    const handleFieldErrors = (fieldErrors: (FieldError | undefined)[]) => {
      const errs = {} as Errors<T>;

      fieldErrors.forEach(fieldError => {
        const field = fieldError?.errors[0].field;

        field && Object.assign(errs, { [field]: fieldError });
      });

      return !Array.isArray(name) && name ? errs[name] : errs;
    };

    const fieldErrors = await Promise.all(
      getFieldEntitiesName(names).map(name =>
        name ? handleValidate(name) : undefined,
      ),
    );

    return handleFieldErrors(fieldErrors);
  }

  const resetField = (name?: NamePath<T>) => {
    const names = handleNamePath(name);
    const handleReset = (name?: keyof T) => {
      if (name) {
        setFieldsValue({ [name]: undefined } as T, { validate: false });
        setFieldError({ [name]: undefined } as Errors<T>);
      }
    };

    getFieldEntitiesName(names).forEach(handleReset);
  };

  const submit = <E = unknown>(event?: E, skipValidate = false) => {
    const { onFinish, onFinishFailed } = callbacks;
    const handleFailed = (errs: Errors<T>) => {
      onFinishFailed?.(errs);
      forceUpdateForm();
    };

    const handleFinish = () => onFinish?.({ event, values: stores });

    skipValidate
      ? handleFinish()
      : validateField().then(errs =>
          Object.entries(errs).find(([, value]) => value)
            ? handleFailed(errs)
            : handleFinish(),
        );
  };

  return {
    getFieldEntities,
    getFieldEntitiesName,
    signInField,
    signOutField,
    setFieldsValue,
    getFieldValue,
    setFieldError,
    getFieldError,
    setInitialValues,
    getInitialValues,
    setCallbacks,
    setFieldTouched,
    isFieldTouched,
    validateField,
    resetField,
    submit,
  };
};

export default formInstance;
