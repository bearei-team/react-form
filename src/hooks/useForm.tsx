import {ValidateError} from 'async-validator';
import {useRef, useState} from 'react';
import {FormItemProps} from '../components/FormItem';

/**
 * 字段实体
 */
export interface FieldEntity<T> {
  /**
   * 监听仓库变化
   */
  onStoreChange: (changeName?: keyof T) => void;

  /**
   * 验证规则
   */
  validate: () => Promise<ValidateError[]>;

  /**
   * 字段 Props
   */
  props: FormItemProps<T>;

  /**
   * 是否操作当前字段
   */
  touched: boolean;
}

/**
 * 字段仓库
 */
export type Store<T> = Record<keyof T, unknown>;

/**
 * 回调方法
 */
export interface Callbacks<T> {
  /**
   * 监听完成
   */
  onFinish?: (values: Store<T>) => void;

  /**
   * 监听完成失败
   */
  onFinishFailed?: (error: ValidateError[]) => void;

  /**
   * 监听值变更
   */
  onValuesChange?: (changedValues: T, values: T) => void;
}

/**
 * 错误集合
 */
export type Errors<T> = {
  [key in keyof T]: ValidateError[];
};

/**
 * 表单实例
 */
export interface FormInstance<T> {
  /**
   * 注册字段
   */
  signInField: (entity: FieldEntity<T>) => {unSignIn: () => void};

  /**
   * 注销字段
   */
  unSignInField: (names: (keyof T)[]) => void;

  /**
   * 设置字段值
   */
  setFieldsValue: (values: Store<T>, validate?: boolean) => void;

  /**
   * 设置字段错误
   */
  setFieldErrors: (name: keyof T, errs: ValidateError[]) => void;

  /**
   * 设置初始值
   */
  setInitialValues: (values: Store<T>, init?: boolean) => void;

  /**
   * 设置回调
   */
  setCallbacks: (callbackValues: Callbacks<T>) => void;

  /**
   * 设置字段是否被操作
   */
  setFieldTouched: (name: keyof T) => void;

  /**
   * 获取字段实体
   */
  getFieldEntities: (pure: boolean) => FieldEntity<T>[];

  /**
   * 检查字段是否被操作
   */
  isFieldTouched: (name: keyof T) => boolean | undefined;

  /**
   * 检查字段集合是否被操作
   */
  isFieldsTouched: (names?: (keyof T)[]) => boolean;

  /**
   * 获取字段值
   */
  getFieldValue: (name: keyof T) => Store<T>[keyof T];

  /**
   * 获取多个指定字段值
   */
  getFieldsValue: (names?: (keyof T)[]) => Store<T>;

  /**
   * 获取初始化值
   */
  getInitialValue: () => Store<T>;

  /**
   * 获取字段错误
   */
  getFieldErrors: (name: keyof T) => Errors<T>[keyof T];

  /**
   * 获取多个指定字段错误
   */
  getFieldsErrors: (names?: (keyof T)[]) => ValidateError[];

  /**
   * 验证字段
   */
  validateField: (name: keyof T) => Promise<ValidateError[]> | undefined;

  /**
   * 验证指定字段
   */
  validateFields: (
    names?: (keyof T)[]
  ) => Promise<(ValidateError[] | undefined)[]>;

  /**
   * 重置字段
   */
  resetField: (name: keyof T) => void;

  /**
   * 重置指定字段
   */
  resetFields: (names?: (keyof T)[]) => void;

  /**
   * 提交
   */
  submit: () => void;
}

function formStore<T = Record<string, unknown>>(formForceUpdate: () => void) {
  const store = {} as Store<T>;
  const initialValues = {} as Store<T>;
  const callbacks = {} as Callbacks<T>;
  const errors = {} as Errors<T>;

  let fieldEntities: FieldEntity<T>[] = [];

  const signInField = (entity: FieldEntity<T>) => {
    const {name} = entity.props;
    const isExist = fieldEntities.some(({props}) => props.name === name);

    !isExist && (fieldEntities = [...fieldEntities, entity]);

    return {
      unSignIn: () => {
        if (name) {
          fieldEntities = fieldEntities.filter(
            fieldEntity => fieldEntity.props.name !== entity.props.name
          );

          unSignInField([name]);
        }
      },
    };
  };

  const unSignInField = (names: (keyof T)[]) => {
    names.forEach(name => {
      const fieldEntity = fieldEntities.find(({props}) => props.name === name);

      if (fieldEntity) {
        fieldEntities = fieldEntities.filter(({props}) => props.name === name);

        setFieldErrors(name, []);
        setFieldsValue({...store, [name]: undefined}, true);
      }
    });
  };

  const setFieldsValue = (values: Store<T>, validate?: boolean) => {
    const nextStore = {...store, ...values};
    const handleShouldUpdate = (changeName: keyof T) =>
      fieldEntities
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

    Object.assign(store, nextStore);

    getFieldEntities(true).forEach(
      ({props, onStoreChange, validate: validateField}) => {
        const {name} = props;

        Object.keys(values).forEach(key => {
          if (name === key || validate) {
            handleStoreChange(key as keyof T, onStoreChange);

            validate && validateField().then(() => formForceUpdate());
          }
        });
      }
    );
  };

  const setFieldErrors = (name: keyof T, errs: ValidateError[]) =>
    Object.assign(errors, {[name]: errs});

  const setInitialValues = (values: Store<T>, init?: boolean) => {
    if (init) {
      return;
    }

    Object.assign(initialValues, values);

    const entityNames = getFieldEntities(true).map(({props}) => props.name);
    const results = Object.entries(initialValues)
      .filter(([key]) => entityNames.some(name => name === key))
      .map(([a, b]) => ({[a]: b}))
      .reduce((a, b) => ({...a, ...b}), {}) as Store<T>;

    setFieldsValue(results);
  };

  const setCallbacks = (callbackValues: Callbacks<T>) =>
    Object.assign(callbacks, callbackValues);

  const setFieldTouched = (name: keyof T) =>
    (fieldEntities = [
      ...fieldEntities.map(fieldEntity =>
        fieldEntity.props.name === name
          ? {...fieldEntity, touched: true}
          : fieldEntity
      ),
    ]);

  const getFieldEntities = (pure = false) =>
    !pure
      ? fieldEntities
      : fieldEntities.filter(fieldEntity => fieldEntity.props.name);

  const isFieldTouched = (name: keyof T) =>
    fieldEntities.find(({props}) => props.name === name)?.touched;

  const isFieldsTouched = (names?: (keyof T)[]) =>
    [
      ...(names
        ? names
        : getFieldEntities(true)
            .map(({props}) => props.name)
            .filter(e => e)),
    ]
      .map(name => isFieldTouched(name!))
      .every(item => item);

  const getFieldValue = (name: keyof T) => store[name];
  const getFieldsValue = (names?: (keyof T)[]) =>
    (!names
      ? store
      : names
          .map(name => ({[name]: getFieldValue(name)}))
          .reduce((a, b) => ({...a, ...b}), {})) as Store<T>;

  const getInitialValue = () => initialValues;
  const getFieldErrors = (name: keyof T) => errors[name] ?? [];
  const getFieldsErrors = (names?: (keyof T)[]) => {
    const errs = Object.entries<ValidateError[]>(errors);

    return [
      ...(names
        ? errs.filter(([name]) => names.indexOf(name as keyof T) !== -1)
        : errs),
    ]
      .map(([, errs]) => errs)
      .flat();
  };

  const validateField = (name: keyof T) =>
    getFieldEntities(true)
      .find(({props}) => props.name === name)
      ?.validate();

  const validateFields = (names?: (keyof T)[]) => {
    const validate = (name: keyof T) => validateField(name);

    return Promise.all(
      names
        ? names.map(validate)
        : getFieldEntities(true)
            .filter(({props}) => props.name)
            .map(({props}) => validate(props.name!))
    );
  };

  const resetField = (name: keyof T) =>
    setFieldsValue({[name]: undefined} as Store<T>, false);

  const resetFields = (names?: (keyof T)[]) => {
    const keys = Object.keys(store);

    [
      ...(names
        ? keys.filter(name => names.indexOf(name as keyof T) !== -1)
        : keys),
    ].forEach(name => resetField(name as keyof T));
  };

  const submit = () => {
    const {onFinish, onFinishFailed} = callbacks;
    const handleFinish = (errs: ValidateError[]) => {
      onFinishFailed?.(errs);
      formForceUpdate();
    };

    validateFields().then(() => {
      if (onFinish) {
        const errs = getFieldsErrors();

        errs.length !== 0 ? handleFinish(errs) : onFinish(store);
      }
    });
  };

  return () => ({
    signInField,
    isFieldTouched,
    isFieldsTouched,
    setCallbacks,
    unSignInField,
    setFieldsValue,
    setFieldErrors,
    setFieldTouched,
    resetField,
    resetFields,
    getFieldsErrors,
    getFieldErrors,
    getInitialValue,
    setInitialValues,
    getFieldEntities,
    getFieldValue,
    getFieldsValue,
    validateField,
    validateFields,
    submit,
  });
}

function useForm<T = unknown>(form: FormInstance<T>) {
  const formRef = useRef<FormInstance<T>>();
  const [, forceUpdate] = useState({});
  const handleForceUpdate = () => forceUpdate({});
  const store = formStore<T>(handleForceUpdate);

  if (!formRef.current) {
    formRef.current = form ? form : store();
  }

  return [formRef.current];
}

export default useForm;
