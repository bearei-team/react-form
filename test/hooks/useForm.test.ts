import validateRules from '../../src/utils/validate';
import useForm, {FormInstance, Store} from '../../src/hooks/useForm';
import {renderHook} from '@testing-library/react';
import '@testing-library/jest-dom';
import {RuleType} from 'async-validator';

const names = ['name', 'password', 'code'];
const signInField = (from: FormInstance<Record<string, unknown>>) => {
  names.forEach(item => {
    from.signInField({
      onStoreChange: (changeName?: string) => changeName,
      validate: () =>
        validateRules({
          name: item,
          value: item,
          rules: [{required: true, message: 'Please enter the field values'}],
          validateFirst: true,
        }),
      props: {
        name: item,
        label: item,
        validateFirst: true,
        shouldUpdate: false,
        rules: [{required: true, message: 'Please enter the field values'}],
      },
      touched: false,
    });
  });
};

describe('test/hooks/useForm.test.ts', () => {
  test('It should be getting an instance of the form', () => {
    const {result} = renderHook(() => useForm());
    const [from] = result.current;

    expect(
      Object.entries(from).every(([, fun]) => typeof fun === 'function')
    ).toEqual(true);
  });

  test('It should be a sign in field entity', async () => {
    const {result} = renderHook(() => useForm());
    const [from] = result.current;

    signInField(from);

    const fieldEntities = from.getFieldEntities();

    expect(
      fieldEntities.every(
        ({props, touched}) => names.indexOf(props.name!) !== -1 && !touched
      )
    ).toEqual(true);
  });

  test('It should be the unsigned field entity', async () => {
    const {result} = renderHook(() => useForm());
    const [from] = result.current;

    signInField(from);

    from.unsignedField('code');
    expect(
      !from.getFieldEntities().find(({props}) => props.name === 'code')
    ).toEqual(true);

    expect(from.getFieldValue('code')).toEqual(undefined);
    expect(from.getFieldError('code')).toEqual(undefined);

    from.unsignedFields(['name']);
    expect(
      !from
        .getFieldEntities()
        .find(({props}) => ['name', 'code'].indexOf(props.name!) !== -1)
    ).toEqual(true);

    from.unsignedFields();
    expect(
      !from
        .getFieldEntities()
        .find(({props}) => names.indexOf(props.name!) !== -1)
    ).toEqual(true);
  });

  test('It should be setting the initialization value', async () => {
    const {result} = renderHook(() => useForm());
    const [from] = result.current;

    signInField(from);

    from.setInitialValues({name: 'name', password: 'password', code: 'code'});
    expect(from.getFieldValue('name') === 'name').toEqual(true);
    expect(from.getFieldValue('password') === 'password').toEqual(true);
    expect(from.getFieldValue('code') === 'code').toEqual(true);

    const valueKeys = Object.keys(from.getFieldsValue(['name', 'password']));
    expect(
      valueKeys.length === 2 &&
        valueKeys.every(key => key === 'name' || key === 'password')
    ).toEqual(true);

    const allValues = from.getInitialValue();

    expect(
      Object.entries(allValues).every(
        ([, value]) => names.indexOf(`${value}`) !== -1
      )
    ).toEqual(true);
  });

  test('It should be setting up a checksum error', async () => {
    const {result} = renderHook(() => useForm());
    const [from] = result.current;

    signInField(from);

    const error = {
      errors: [{message: 'message', fieldValue: 'fieldValue', field: 'field'}],
      rules: [{type: 'string' as RuleType}],
    };

    from.setFieldError('name', error);
    from.setFieldError('password', error);
    from.setFieldError('code', error);

    expect(from.getFieldError('name').errors[0].field === 'field').toEqual(
      true
    );

    expect(
      from.getFieldError('password').errors[0].message === 'message'
    ).toEqual(true);

    expect(
      from.getFieldError('code').errors[0].fieldValue === 'fieldValue'
    ).toEqual(true);

    expect(
      Object.entries(from.getFieldsError()).every(
        ([, val]) => val.errors[0].field === 'field' && val.rules?.length === 1
      )
    );
  });

  test('It should be setting the callback function', async () => {
    const {result} = renderHook(() => useForm());
    const [from] = result.current;

    let finish: Store | undefined;

    from.setCallback({
      onFinish: values => {
        finish = values;

        expect(typeof finish !== 'undefined').toEqual(true);
      },
      onFinishFailed: () => {},
      onValuesChange: () => {},
    });

    from.submit();
  });

  test('It should be setting whether the form fields are manipulated', async () => {
    const {result} = renderHook(() => useForm());
    const [from] = result.current;

    signInField(from);
    from.setFieldTouched('name');
    from.setFieldTouched('password');

    expect(from.isFieldTouched('name')).toEqual(true);
    expect(from.isFieldTouched('password')).toEqual(true);
    expect(from.isFieldTouched('code')).toEqual(false);
    expect(from.isFieldsTouched()).toEqual(false);

    from.setFieldTouched('code');

    expect(from.isFieldTouched('code')).toEqual(true);
    expect(from.isFieldsTouched()).toEqual(true);
    expect(from.isFieldsTouched(['name', 'code'])).toEqual(true);
  });
});

// describe('test/hooks/useForm.test.ts', () => {

//   //   it('It should be set that the field is manipulated', async () => {
//   //     const store = formStore(() => {});

//   //     signInField(store);
//   //     store.setFieldTouched('name');
//   //     store.setFieldTouched('password');
//   //     store.setFieldTouched('code');

//   //     assert(typeof store.isFieldTouched('name'));
//   //     assert(typeof store.isFieldTouched('password'));
//   //     assert(typeof store.isFieldTouched('code'));
//   //     assert(typeof store.isFieldsTouched());
//   //     assert(typeof store.isFieldsTouched(['name', 'code']));
//   //   });

//   //   it('It should be a validation field', async () => {
//   //     const store = formStore(() => {});

//   //     signInField(store);

//   //     store.validateField('name')?.then(result => assert(result.length === 0));
//   //     store
//   //       .validateField('password')
//   //       ?.then(result => assert(result.length === 0));
//   //     store.validateField('code')?.then(result => assert(result.length === 0));
//   //     store
//   //       .validateFields()
//   //       ?.then(result =>
//   //         assert(
//   //           Object.entries(result).every(
//   //             ([key, val]) =>
//   //               names.indexOf(key) !== -1 && names.indexOf(val?.[0].field!) !== -1
//   //           )
//   //         )
//   //       );

//   //     store
//   //       .validateFields(['name', 'password'])
//   //       ?.then(result =>
//   //         assert(
//   //           Object.entries(result).every(
//   //             ([key, val]) =>
//   //               names.indexOf(key) !== -1 && names.indexOf(val?.[0].field!) !== -1
//   //           )
//   //         )
//   //       );
//   //   });

//   //   it('It should be a reset field', async () => {
//   //     const store = formStore(() => {});
//   //     signInField(store);

//   //     store.setInitialValues({name: 'name', password: 'password', code: 'code'});
//   //     store.resetField('name');
//   //     assert(!store.getFieldValue('name'));

//   //     store.resetFields(['password']);
//   //     assert(!store.getFieldValue('password'));

//   //     store.resetFields();
//   //     assert(
//   //       Object.entries(store.getFieldsValue()).filter(([, val]) => val).length ===
//   //         0
//   //     );
//   //   });

//   //   it('It should be submitted', async () => {
//   //     const store = formStore(() => {});

//   //     signInField(store);

//   //     store.setCallbacks({
//   //       onFinish: () => {},
//   //       onFinishFailed: () => {},
//   //       onValuesChange: () => {},
//   //     });

//   //     store.submit();
//   //   });
// });
