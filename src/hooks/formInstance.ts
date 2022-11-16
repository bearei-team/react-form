import {RuleItem, ValidateError} from 'async-validator';
import {FormItemProps} from '../components/FormItem';

/**
 * 表单字段储存
 */
export type Stores = Record<string, unknown>;

/**
 * 表单字段校验错误
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
 * 表单校验错误集合
 */
export type Errors<T> = Record<keyof T, FieldError | undefined>;

/**
 * 表单字段实体
 */
export interface FieldEntity<T> {
  /**
   * 监听表单字段存储变化
   */
  onStoreChange: (changeName?: keyof T) => void;

  /**
   * 监听是否应该更新
   */
  onForceUpdate: () => void;

  /**
   * 校验表单字段
   */
  validate: () => Promise<FieldError | undefined>;

  /**
   * 表单字段 Props
   */
  props: FormItemProps<T>;

  /**
   * 当前表单字段是否被操作
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
export interface FormInstance<T = Stores> {
  /**
   * 获取表单字段实体
   *
   * @param unsigned 是否获取已经签出的表单字段实体,默认 false
   */
  getFieldEntities: (unsigned?: boolean) => FieldEntity<T>[];

  /**
   * 签入表单字段
   */
  signInField: (entity: FieldEntity<T>) => {unsigned: () => void};

  /**
   * 签出表单字段
   *
   * @param name 表单字段名称
   */
  unsignedField: (name: keyof T) => void;

  /**
   * 签出多个表单字段
   *
   * @param names 表单字段名称集合
   */
  unsignedFields: (names?: (keyof T)[]) => void;

  /**
   * 设置表单初始化值
   *
   * @param values 表单初始化值
   * @param init 表单是否已完成初始化,如果值为 true,该方法将不会执行初始化. 默认 false
   */
  setInitialValues: (values?: T, init?: boolean) => void;

  /**
   * 获取表单初始化值
   */
  getInitialValues: () => T;

  /**
   * 设置表单字段值
   *
   * @param values 表单初始化值
   * @param validate 是否校验字段. 默认 false
   */
  setFieldsValue: (values: T, validate?: boolean) => void;

  /**
   * 获取表单字段值
   *
   *  @param name 表单字段名称
   */
  getFieldValue: (name: keyof T) => T[keyof T];

  /**
   * 获取多个表单字段值
   *
   *  @param names 表单字段名称集合
   */
  getFieldsValue: (names?: (keyof T)[]) => T;

  /**
   * 设置表单字段校验错误
   *
   * @param name 表单字段名称
   * @param error 表单字段校验错误
   */
  setFieldError: (name: keyof T, error?: FieldError) => void;

  /**
   * 获取表单字段校验错误
   *
   *  @param name 表单字段名称
   */
  getFieldError: (name: keyof T) => Errors<T>[keyof T];

  /**
   * 获取多个表单字段校验错误
   *
   *  @param names 表单字段名称集合
   */
  getFieldsError: (names?: (keyof T)[]) => Errors<T>;

  /**
   * 设置表单回调函数
   *
   *  @param callbackValues 表单回调函数值
   */
  setCallbacks: (callbackValues: Callbacks<T>) => void;

  /**
   * 设置表单字段是否被操作
   *
   * @param name 表单字段名称
   * @param touched 表单字段是否被操作,默认值 false
   */
  setFieldTouched: (name: keyof T, touched?: boolean) => void;

  /**
   * 检查表单字段是否被操作
   *
   * @param name 表单字段名称
   */
  isFieldTouched: (name: keyof T) => boolean | undefined;

  /**
   * 检查多个表单字段是否被操作,如果全部被操作返回 true,否者返回 false
   *
   * @param names 表单字段名称
   */
  isFieldsTouched: (names?: (keyof T)[]) => boolean;

  /**
   * 校验表单字段
   *
   * @param name 表单字段名称
   * @param skip 是否跳过表单字段校验. 默认值 false
   */
  validateField: (name: keyof T, skip?: boolean) => Promise<FieldError | undefined>;

  /**
   * 校验多个表单字段
   *
   * @param names 表单字段名称集合
   * @param skip 是否跳过表单字段校验. 默认值 false
   */
  validateFields: (names?: (keyof T)[], skip?: boolean) => Promise<Errors<T>>;

  /**
   * 重置表单字段
   *
   * @param name 表单字段名称
   */
  resetField: (name: keyof T) => void;

  /**
   * 重置多个表单字段
   *
   * @param names 表单字段名称集合
   */
  resetFields: (names?: (keyof T)[]) => void;

  /**
   * 表单提交
   *
   * @param skip 是否跳过表单字段校验. 默认值 false
   */
  submit: (skip?: boolean) => void;
}

export function formInstance<T extends Stores = Stores>(formForceUpdate: () => void) {
  const stores = {} as T;
  const initialValues = {} as T;
  const callbacks = {} as Callbacks<T>;
  const errors = {} as Errors<T>;

  let fieldEntities: FieldEntity<T>[] = [];

  const getFieldEntities = (unsigned = false) =>
    !unsigned ? fieldEntities : fieldEntities.filter(fieldEntity => fieldEntity.props.name);

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
    const fieldEntity = currentFieldEntities.find(({props}) => props.name === name);

    if (fieldEntity) {
      fieldEntities = currentFieldEntities.filter(({props}) => props.name !== name);

      setFieldError(name);
      setFieldsValue({...stores, [name]: undefined});
    }
  };

  const unsignedFields = (names?: (keyof T)[]) =>
    [...(names ? names : getFieldEntities(true).map(({props}) => props.name))].forEach(name =>
      unsignedField(name!),
    );

  const setFieldsValue = (values: T, validate?: boolean) => {
    const nextStore = {...stores, ...values};
    const handleShouldUpdate = (changeName: keyof T) =>
      getFieldEntities()
        .find(({props}) => changeName === props.name && props.shouldUpdate)
        ?.onForceUpdate();

    const handleStoreChange = (changeName: keyof T, onStoreChange: (name: keyof T) => void) => {
      setFieldTouched(changeName, true);
      onStoreChange(changeName);
      handleShouldUpdate(changeName);
    };

    Object.assign(stores as Stores, nextStore);

    getFieldEntities(true).forEach(({props, onStoreChange, validate: validateField}) => {
      const {name} = props;

      Object.keys(values as Stores).forEach(key => {
        if (name === key) {
          handleStoreChange(key as keyof T, onStoreChange);

          validate && validateField();
        }
      });
    });
  };

  const getFieldValue = (name: keyof T) => stores[name];
  const getFieldsValue = (names?: (keyof T)[]) =>
    !names
      ? stores
      : (names
          .map(name => ({[name]: getFieldValue(name)}))
          .reduce((a, b) => ({...a, ...b}), {}) as T);

  const setFieldError = (name: keyof T, error?: FieldError) => {
    Object.assign(errors, {[name]: error});
  };

  const getFieldError = (name: keyof T) => errors[name];
  const getFieldsError = (names?: (keyof T)[]) => {
    const errs = Object.entries<FieldError | undefined>(errors);

    return [...(names ? errs.filter(([name]) => names.indexOf(name as keyof T) !== -1) : errs)]
      .map(([name, errs]) => ({[name]: errs}))
      .flat()
      .reduce((a, b) => ({...a, ...b}), {}) as Errors<T>;
  };

  const setInitialValues = (values = {} as T, init?: boolean) => {
    if (init) {
      return;
    }

    Object.assign(initialValues, values);

    const names = getFieldEntities(true).map(({props}) => props.name);
    const fieldsValue = Object.entries(initialValues)
      .filter(([key]) => names.some(name => name === key))
      .map(([key, value]) => ({[key]: value}))
      .reduce((a, b) => ({...a, ...b}), {}) as T;

    setFieldsValue(fieldsValue);
  };

  const getInitialValues = () => initialValues;
  const setCallbacks = (callbackValues: Callbacks<T>) => {
    Object.assign(callbacks, callbackValues);
  };

  const setFieldTouched = (name: keyof T, touched = false) => {
    fieldEntities = [
      ...getFieldEntities().map(fieldEntity =>
        fieldEntity.props.name === name ? {...fieldEntity, touched} : fieldEntity,
      ),
    ];
  };

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

  const validateField = async (name: keyof T, skip = false) =>
    !skip
      ? getFieldEntities(true)
          .find(({props}) => props.name === name)
          ?.validate()
          .then(result => {
            if (result) {
              setFieldError(name, result);

              return result;
            }

            return undefined;
          })
      : undefined;

  const validateFields = async (names?: (keyof T)[], skip = false) => {
    const handleFieldErrors = (fieldErrors: (FieldError | undefined)[]) =>
      fieldErrors
        .filter(e => e)
        .map(fieldError => ({[fieldError!.errors[0].field!]: fieldError}))
        .reduce((a, b) => ({...a, ...b}), {}) as Errors<T>;

    const fieldErrors = await Promise.all(
      names
        ? names.map(name => validateField(name, skip))
        : getFieldEntities(true)
            .filter(({props}) => props.name)
            .map(({props}) => validateField(props.name!, skip)),
    );

    return handleFieldErrors(fieldErrors);
  };

  const resetField = (name: keyof T) => {
    setFieldsValue({[name]: undefined} as T, false);
    setFieldError(name);
  };

  const resetFields = (names?: (keyof T)[]) => {
    const keys = Object.keys(stores) as (keyof T)[];

    [...(names ? keys.filter(name => names.indexOf(name) !== -1) : keys)].forEach(resetField);
  };

  const submit = (skip = false) => {
    const {onFinish, onFinishFailed} = callbacks;
    const handleFailed = (errs: Errors<T>) => {
      onFinishFailed?.(errs);
      formForceUpdate();
    };

    validateFields(undefined, skip).then(errs =>
      onFinish &&
      Object.entries<FieldError | undefined>(errs).filter(([, value]) => value).length !== 0
        ? handleFailed(errs)
        : onFinish?.(stores),
    );
  };

  return {
    getFieldEntities,
    signInField,
    unsignedField,
    unsignedFields,
    setInitialValues,
    getInitialValues,
    setFieldsValue,
    getFieldValue,
    getFieldsValue,
    setFieldError,
    getFieldError,
    getFieldsError,
    setCallbacks,
    setFieldTouched,
    isFieldTouched,
    isFieldsTouched,
    validateField,
    validateFields,
    resetField,
    resetFields,
    submit,
  };
}
