import {RuleItem, ValidateError} from 'async-validator';
import {useRef} from 'react';
import {FormItemProps} from '../components/FormItem';

/**
 * 表单字段存储
 */
export type Store = Record<string, unknown>;

/**
 * 表单字段错误
 */
export type FieldError = {
  /**
   * 校验错误集合
   */
  errors: ValidateError[];

  /**
   * 校验规则集合
   */
  rules?: RuleItem[];
};

/**
 * 表单字段错误集合
 */
export type FieldsError<T> = {[key in keyof T]: ValidateError[]} & {
  /**
   * 校验规则集合
   */
  rules?: RuleItem[];
};

/**
 * 表单字段校验错误集合
 */
export type Errors<T> = {
  [key in keyof T]: FieldError;
};

/**
 * 表单字段实体
 */
export interface FieldEntity<T> {
  /**
   * 监听表单字段存储变化
   */
  onStoreChange: (changeName?: keyof T) => void;

  /**
   * 校验表单字段
   */
  validate: () => Promise<FieldsError<T> | undefined>;

  /**
   * 表单字段 Props
   */
  props: FormItemProps<T>;

  /**
   * 是否操作当前表单字段
   */
  touched: boolean;
}

/**
 * 表单回调方法
 */
export interface Callbacks<T> {
  /**
   * 监听表单完成
   */
  onFinish?: (values: T) => void;

  /**
   * 监听表单完成失败
   */
  onFinishFailed?: (errors: Errors<T>) => void;

  /**
   * 监听表单值变更
   */
  onValuesChange?: (changedValues: T, values: T) => void;
}

/**
 * 表单实例
 */
export interface FormInstance<T = Store> {
  /**
   * 签入表单字段
   *
   * @param entity 表单字段实体
   */
  signInField: (entity: FieldEntity<T>) => {unsigned: () => void};

  /**
   * 获取表单字段实体
   *
   * @param unsigned 是否获取已经签出的表单字段实体,默认值 false
   */
  getFieldEntities: (unsigned?: boolean) => FieldEntity<T>[];

  /**
   * 签出表单字段
   *
   * @param name 签出的表单字段名称
   */
  unsignedField: (name: keyof T) => void;

  /**
   * 签出多个表单字段
   *
   * @param names 签出的表单字段名称集合,默认签出全部表单字段
   */
  unsignedFields: (names?: (keyof T)[]) => void;

  /**
   * 获取表单字段值
   *
   *  @param name 获取表单字段的名称
   */
  getFieldValue: (name: keyof T) => T[keyof T];

  /**
   * 获取表单字段校验错误
   *
   *  @param name 获取表单字段的名称
   */
  getFieldErrors: (name: keyof T) => Errors<T>[keyof T];
}

function formStore<T = Store>(formForceUpdate: Function) {
  const store = {} as T;
  const initialValues = {} as T;
  const callbacks = {} as Callbacks<T>;
  const errors = {} as Errors<T>;

  let fieldEntities: FieldEntity<T>[] = [];

  const getFieldEntities = (unsigned = false) =>
    !unsigned
      ? fieldEntities
      : fieldEntities.filter(fieldEntity => fieldEntity.props.name);

  const signInField = (entity: FieldEntity<T>) => {
    const {name} = entity.props;
    const currentFieldEntities = getFieldEntities();
    const exist = currentFieldEntities.some(({props}) => props.name === name);

    !exist && (fieldEntities = [...currentFieldEntities, entity]);

    return {
      unsigned: () => name && unsignedField(name),
    };
  };

  const unsignedField = (name: keyof T) => {
    const currentFieldEntities = getFieldEntities();
    const fieldEntity = currentFieldEntities.find(
      ({props}) => props.name === name
    );

    if (fieldEntity) {
      fieldEntities = currentFieldEntities.filter(
        ({props}) => props.name !== name
      );

      setFieldErrors(name);
      setFieldsValue({...store, [name]: undefined}, true);
    }
  };

  const unsignedFields = (names?: (keyof T)[]) =>
    [
      ...(names
        ? names
        : getFieldEntities(true)
            .map(({props}) => props.name)
            .filter(e => e)),
    ].forEach(name => unsignedField(name!));

  const setFieldsValue = (values: T, validate?: boolean) => {
    const nextStore = {...store, ...values};
    const handleShouldUpdate = (changeName: keyof T) =>
      getFieldEntities()
        .find(({props}) => changeName === props.name && props.shouldUpdate)
        ?.onStoreChange(changeName);

    const handleStoreChange = (
      changeName: keyof T,
      onStoreChange: (name: keyof T) => void
    ) => {
      setFieldTouched(changeName);
      onStoreChange(changeName);
      handleShouldUpdate(changeName);
      formForceUpdate();
    };

    Object.assign(store as Store, nextStore);

    getFieldEntities(true).forEach(
      ({props, onStoreChange, validate: validateField}) => {
        const {name} = props;

        Object.keys(values as Store).forEach(key => {
          if (name === key || validate) {
            handleStoreChange(key as keyof T, onStoreChange);

            validate && validateField().then(() => formForceUpdate());
          }
        });
      }
    );
  };

  const getFieldValue = (name: keyof T) => store[name];
  //   const getFieldsValue = (names?: (keyof T)[]) =>
  //     !names
  //       ? store
  //       : names
  //           .map(name => ({[name]: getFieldValue(name)}))
  //           .reduce((a, b) => ({...a, ...b}), {});

  const setFieldErrors = (name: keyof T, error?: FieldsError<T>) =>
    Object.assign(errors, {
      [name]: error ? {errors: error?.[name], rules: error?.rules} : undefined,
    });

  const getFieldErrors = (name: keyof T) => errors[name];
  //   const getFieldsErrors = (names?: (keyof T)[]) => {
  //     const errs = Object.entries(errors);

  //     return [
  //       ...(names ? errs.filter(([name]) => names.indexOf(name) !== -1) : errs),
  //     ]
  //       .map(([name, errs]) => ({[name]: errs}))
  //       .flat()
  //       .reduce((a, b) => ({...a, ...b}), {});
  //   };

  //   const setInitialValues = (values = {} as T, init?: boolean) => {
  //     if (init) {
  //       return;
  //     }

  //     Object.assign(initialValues as Store, values);

  //     const entityNames = getFieldEntities(true).map(({props}) => props.name);
  //     const results = Object.entries<unknown>(initialValues)
  //       .filter(([key]) => entityNames.some(name => name === key))
  //       .map(([a, b]) => ({[a]: b}))
  //       .reduce((a, b) => ({...a, ...b}), {}) as Store;

  //     setFieldsValue(results);
  //   };

  //   const getInitialValue = () => initialValues;
  //   const setCallbacks = (callbackValues: Callbacks<T>) =>
  //     Object.assign(callbacks, callbackValues);

  const setFieldTouched = (name: keyof T) =>
    (fieldEntities = [
      ...getFieldEntities().map(fieldEntity =>
        fieldEntity.props.name === name
          ? {...fieldEntity, touched: true}
          : fieldEntity
      ),
    ]);

  //   const isFieldTouched = (name: keyof T) =>
  //     fieldEntities.find(({props}) => props.name === name)?.touched;

  //   const isFieldsTouched = (names?: (keyof T)[]) =>
  //     [
  //       ...(names
  //         ? names
  //         : getFieldEntities(true)
  //             .map(({props}) => props.name)
  //             .filter(e => e)),
  //     ]
  //       .map(name => isFieldTouched(name!))
  //       .every(item => item);

  //   const validateField = (name: keyof T) =>
  //     getFieldEntities(true)
  //       .find(({props}) => props.name === name)
  //       ?.validate();

  //   const validateFields = (names?: (keyof T)[]) =>
  //     Promise.all(
  //       names
  //         ? names.map(validateField)
  //         : getFieldEntities(true)
  //             .filter(({props}) => props.name)
  //             .map(({props}) => validateField(props.name!))
  //     ).then(results => results.reduce((a, b) => ({...a, ...b}), {})) as Promise<
  //       Errors<T>
  //     >;

  //   const resetField = (name: keyof T) =>
  //     setFieldsValue({[name]: undefined} as Store, false);

  //   const resetFields = (names?: (keyof T)[]) => {
  //     const keys = Object.keys(store) as (keyof T)[];

  //     [
  //       ...(names ? keys.filter(name => names.indexOf(name) !== -1) : keys),
  //     ].forEach(resetField);
  //   };

  //   const submit = () => {
  //     const {onFinish, onFinishFailed} = callbacks;
  //     const handleFinish = (errs: Errors) => {
  //       onFinishFailed?.(errs);
  //       formForceUpdate();
  //     };

  //     validateFields().then(() => {
  //       if (onFinish) {
  //         const errs = getFieldsErrors();

  //         Object.keys(errs).length !== 0
  //           ? handleFinish(errs)
  //           : onFinish(store as T);
  //       }
  //     });
  //   };

  return {
    getFieldEntities,
    signInField,
    unsignedField,
    unsignedFields,
    getFieldValue,
    getFieldErrors,
  };
}

function useForm<T = Store>(form?: FormInstance<T>) {
  const formRef = useRef<FormInstance<T>>();
  const handleForceUpdate = (
    method: keyof FormInstance<T>,
    ...args: unknown[]
  ) => {
    if (formRef.current && method) {
      const fun = formRef.current[method] as Function;

      fun.apply(fun, args);
    }
  };

  const formInstance = formStore<T>(handleForceUpdate);

  if (!formRef.current) {
    formRef.current = form ? form : formInstance;
  }

  return [formRef.current];
}

export default useForm;
