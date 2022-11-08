import {useRef, useState} from 'react';
import {FormItemProps} from '../components/FormItem';

/**
 * 字段仓库
 */
export type Store<T = unknown> = Record<string, T>;

/**
 * 字段实体
 */
export interface FieldEntity {
  /**
   * 监听仓库变化
   */
  onStoreChange: (changeName?: string) => void;

  /**
   * 验证规则
   */
  validateRules: () => Promise<unknown[]>;

  /**
   * 字段 Props
   */
  props: FormItemProps;
}

/**
 * 表单实例
 */
export interface FormInstance<Values = unknown> {
  /**
   * 获取指定字段值
   */
  getFieldValue: (name: string) => unknown;

  /**
   * 获取全部字段值
   */
  getFieldsValue: (names?: string[]) => Values;

  /**
   * 设置字段值
   */
  setFieldsValue: (values: Record<string, unknown>) => void;

  /**
   * 注册字段
   */
  signInField: (entity: FieldEntity) => {clear: () => void};

  /**
   * 注销字段
   */
  unSignInField: (names: string[]) => void;

  /**
   * 提交
   */
  submit: () => void;

  /**
   * 重置字段
   */
  resetFields: (names?: string[]) => void;

  /**
   * 设置回调函数
   */
  setCallbacks: (callbackValues: Callbacks<Values>) => Callbacks<unknown>;

  /**
   * 设置初始化值
   */
  setInitialValues: (values: Store, init?: boolean) => void;

  /**
   * 验证字段
   */
  validateFields: () => Promise<unknown[][]>;

  /**
   * 获取字段错误
   */
  getFieldErrors: (name: string) => unknown[];

  /**
   * 设置字段错误
   */
  setFieldsErrors: (name: string, errs: unknown[]) => Store<unknown[]>;

  /**
   * 获取字段是否被操作
   */
  getIsFieldTouched: (name: string) => boolean;

  /**
   * 获取全部字段是否被操作
   */
  getIsFieldsTouched: () => boolean;

  /**
   * 获取全部字段错误
   */
  getFieldsErrors: () => unknown[];

  /**
   * 获取初始化值
   */
  getInitialValue: () => Values;

  /**
   * 获取字段实体
   */
  getFieldEntities: (pure?: boolean) => FieldEntity[];
}

/**
 * 回调
 */
export interface Callbacks<Values = unknown> {
  /**
   * 监听完成
   */
  onFinish?: (values: Values) => void;

  /**
   * 监听完成失败
   */
  onFinishFailed?: (error: unknown) => void;

  /**
   * 监听值变更
   */
  onValuesChange?: (changedValues: Store, values: Values) => void;
}

function formStore<Values = unknown>(formForceUpdate: () => void) {
  const store: Store = {};
  const initialValues: Store = {};
  const callbacks: Callbacks<Values> = {};
  const errors: Store<unknown[]> = {};

  let fieldEntities: FieldEntity[] = [];

  const signInField = (entity: FieldEntity) => {
    const isExist = fieldEntities.some(
      ({props}) => props.name === entity.props.name
    );

    !isExist && (fieldEntities = [...fieldEntities, entity]);

    const {name} = entity.props;

    return {
      clear: () => {
        fieldEntities = fieldEntities.filter(
          fieldEntity => fieldEntity.props.name !== entity.props.name
        );

        name && setFieldsValue({...store, [name]: undefined});
      },
    };
  };

  const unSignInField = (names: string[]) => {
    names.forEach(name => {
      const fieldEntity = fieldEntities.find(({props}) => props.name === name);

      if (fieldEntity) {
        fieldEntities = fieldEntities.filter(({props}) => props.name === name);

        setFieldsErrors(name, []);
        setFieldsValue({...store, [name]: undefined}, true);
      }
    });
  };

  const setFieldsValue = (values: Store, reset?: boolean) => {
    const {onValuesChange} = callbacks;
    const nextStore = {...store, ...values};
    const handleShouldUpdate = () =>
      fieldEntities.forEach(
        ({props, onStoreChange}) =>
          props.shouldUpdate && onStoreChange(props.name)
      );

    const handleStoreChange = (
      changeName: string,
      onStoreChange: (name: string) => void
    ) => {
      onStoreChange(changeName);
      handleShouldUpdate();
      formForceUpdate();
      onValuesChange?.(values, nextStore as unknown as Values);
    };

    Object.assign(store, nextStore);

    getFieldEntities(true).forEach(({props, onStoreChange, validateRules}) => {
      const {name} = props;

      Object.keys(values).forEach(key => {
        if (name === key || reset) {
          handleStoreChange(key, onStoreChange);

          !reset && validateRules().then(() => formForceUpdate());
        }
      });
    });
  };

  const setFieldsErrors = (name: string, errs: unknown[]) =>
    Object.assign(errors, {[name]: errs});

  const setInitialValues = (values: Store, init?: boolean) => {
    if (init) {
      return;
    }

    Object.assign(initialValues, values);

    const entityNames = getFieldEntities(true).map(({props}) => props.name);
    const results = Object.entries(initialValues)
      .filter(([key]) => entityNames.some(name => name === key))
      .map(([a, b]) => ({[a]: b}))
      .reduce((a, b) => ({...a, ...b}), {});

    setFieldsValue(results, true);
  };

  const setCallbacks = (callbackValues: Callbacks) =>
    Object.assign(callbacks, callbackValues);

  const getFieldEntities = (pure = false) =>
    !pure ? fieldEntities : fieldEntities.filter(field => field.props.name);

  const getFieldValue = (name: string) => store[name];

  const getIsFieldTouched = (name: string) =>
    Object.keys(store).some(key => key === name);

  const getIsFieldsTouched = () => {
    const storeLength = Object.keys(store).length;

    return (
      storeLength ===
        getFieldEntities(true).filter(({props}) => props.name).length &&
      storeLength !== 0
    );
  };

  const getFieldsValue = () => store;
  const getInitialValue = () => initialValues;
  const getFieldErrors = (name: string) => errors[name] ?? [];

  const getFieldsErrors = () =>
    Object.entries(errors)
      .map(([, fieldErrors]) => fieldErrors)
      .flat();

  const validateFields = () =>
    Promise.all(getFieldEntities(true).map(entity => entity.validateRules()));

  const submit = () => {
    const {onFinish, onFinishFailed} = callbacks;
    const handleFinish = (errs: unknown[]) => {
      onFinishFailed?.(errs);
      formForceUpdate();
    };

    validateFields().then(() => {
      if (onFinish) {
        const errs = getFieldsErrors();

        errs.length ? handleFinish(errs) : onFinish(store as Values);
      }
    });
  };

  const resetFields = (names: string[]) =>
    setFieldsValue(
      (names?.length !== 0 ? names : Object.keys(store))
        .map(key => ({[key]: ''}))
        .reduce((a, b) => ({...a, ...b}), {}),
      /**是否重置*/ true
    );

  return () => ({
    signInField,
    unSignInField,
    getFieldValue,
    getFieldsValue,
    setFieldsValue,
    setCallbacks,
    setInitialValues,
    setFieldsErrors,
    getFieldErrors,
    getFieldsErrors,
    validateFields,
    getIsFieldTouched,
    getIsFieldsTouched,
    getInitialValue,
    getFieldEntities,
    submit,
    resetFields,
  });
}

function useForm<Values = unknown>(form?: FormInstance<Values>) {
  const formRef = useRef<FormInstance<Values>>();
  const [, forceUpdate] = useState({});
  const handleForceUpdate = () => forceUpdate({});
  const store = formStore(handleForceUpdate);

  if (!formRef.current) {
    formRef.current = form ? form : (store() as FormInstance<Values>);
  }

  return [formRef.current];
}

export default useForm;
