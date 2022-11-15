import {validateRule} from '../../src/utils/validate';
import '@testing-library/jest-dom';
import {RuleType} from 'async-validator';
import {FormInstance, Stores, formInstance} from '../../src/hooks/formInstance';

const names = ['name', 'password', 'code'];
const signInField = (from: FormInstance<Record<string, unknown>>) => {
  names.forEach(item => {
    from.signInField({
      onStoreChange: (changeName?: string) => changeName,
      onForceUpdate: () => {},
      validate: () =>
        validateRule({
          name: item,
          value: item,
          rules: [
            {required: true, message: 'Please enter the field values'},
            {type: 'number', message: 'Please enter the number'},
          ],
          validateFirst: true,
        }),
      props: {
        name: item,
        validateFirst: true,
        shouldUpdate: false,
        rules: [
          {required: true, message: 'Please enter the field values'},
          {type: 'number', message: 'Please enter the number'},
        ],
      },
      touched: false,
    });
  });
};

describe('test/hooks/formInstance.test.ts', () => {
  test('It should be getting an instance of the form', () => {
    const from = formInstance(() => {});

    expect(
      Object.entries(from).every(([, fun]) => typeof fun === 'function')
    ).toEqual(true);
  });

  test('It should be a sign in field entity', async () => {
    const from = formInstance(() => {});

    signInField(from);

    const fieldEntities = from.getFieldEntities();

    expect(
      fieldEntities.every(
        ({props, touched}) => names.indexOf(props.name!) !== -1 && !touched
      )
    ).toEqual(true);
  });

  test('It should be the unsigned field entity', async () => {
    const from = formInstance(() => {});

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
    const from = formInstance(() => {});

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

    const allValues = from.getInitialValues();

    expect(
      Object.entries(allValues).every(
        ([, value]) => names.indexOf(`${value}`) !== -1
      )
    ).toEqual(true);
  });

  test('It should be setting up a checksum error', async () => {
    const from = formInstance(() => {});

    signInField(from);

    const error = {
      errors: [{message: 'message', fieldValue: 'fieldValue', field: 'field'}],
      rules: [{type: 'string' as RuleType}],
    };

    from.setFieldError('name', error);
    from.setFieldError('password', error);
    from.setFieldError('code', error);

    expect(from.getFieldError('name')?.errors[0].field === 'field').toEqual(
      true
    );

    expect(
      from.getFieldError('password')?.errors[0].message === 'message'
    ).toEqual(true);

    expect(
      from.getFieldError('code')?.errors[0].fieldValue === 'fieldValue'
    ).toEqual(true);

    expect(
      Object.entries(from.getFieldsError()).every(
        ([, value]) =>
          value?.errors[0].field === 'field' && value.rules?.length === 1
      )
    );
  });

  test('It should be setting the callback function', async () => {
    const from = formInstance(() => {});

    let finish: Stores | undefined;

    from.setCallbacks({
      onFinish: values => {
        finish = values;

        expect(typeof finish !== 'undefined').toEqual(true);
      },
    });

    from.submit(true);
  });

  test('It should be setting whether the form fields are manipulated', async () => {
    const from = formInstance(() => {});
    signInField(from);

    from.setFieldTouched('name', true);
    from.setFieldTouched('password', true);
    expect(from.isFieldTouched('name')).toEqual(true);
    expect(from.isFieldTouched('password')).toEqual(true);
    expect(from.isFieldTouched('code')).toEqual(false);
    expect(from.isFieldsTouched()).toEqual(false);

    from.setFieldTouched('code', true);
    expect(from.isFieldTouched('code')).toEqual(true);
    expect(from.isFieldsTouched()).toEqual(true);
    expect(from.isFieldsTouched(['name', 'code'])).toEqual(true);
  });

  test('It should be a validation field', async () => {
    const from = formInstance(() => {});

    signInField(from);

    from
      .validateField('name')
      .then(result => expect(result?.errors.length !== 0).toEqual(true));

    from
      .validateField('password')
      .then(result => expect(result?.errors.length !== 0).toEqual(true));

    from
      .validateField('code')
      .then(result => expect(result?.errors.length !== 0).toEqual(true));

    from.validateFields(['name', 'password']).then(result => {
      expect(
        Object.entries(result).every(
          ([key, value]) =>
            ['name', 'password'].indexOf(key) !== -1 &&
            ['name', 'password'].indexOf(value?.errors[0].field!) !== -1
        )
      );

      expect(
        Object.entries(from.getFieldsError(['name', 'password'])).every(
          ([key, value]) =>
            ['name', 'password'].indexOf(key) !== -1 &&
            ['name', 'password'].indexOf(value?.errors[0]?.field!) !== -1
        )
      );
    });

    from.validateFields().then(result => {
      expect(
        Object.entries(result).every(
          ([key, value]) =>
            names.indexOf(key) !== -1 &&
            names.indexOf(value?.errors[0]?.field!) !== -1
        )
      );

      expect(
        Object.entries(from.getFieldsError()).every(
          ([key, value]) =>
            names.indexOf(key) !== -1 &&
            names.indexOf(value?.errors[0]?.field!) !== -1
        )
      );
    });
  });

  test('It should be a reset field', async () => {
    const from = formInstance(() => {});

    signInField(from);

    from.setInitialValues({name: 'name', password: 'password', code: 'code'});
    from.resetField('name');
    expect(!from.getFieldValue('name')).toEqual(true);

    from.resetFields(['password']);
    expect(!from.getFieldValue('password')).toEqual(true);

    from.validateFields();
    from.resetFields();
    expect(
      Object.entries(from.getFieldsValue()).filter(([, value]) => value).length
    ).toEqual(0);

    expect(
      Object.entries(from.getFieldsError()).filter(([, value]) => value).length
    ).toEqual(0);
  });

  test('It should be submitted', async () => {
    const from = formInstance(() => {});

    signInField(from);

    from.setCallbacks({
      onFinish: values => {
        expect(typeof values !== 'undefined').toEqual(true);
      },
      onFinishFailed: errs => {
        expect(
          Object.entries(errs).filter(([, value]) => value).length
        ).toEqual(3);
      },
    });

    from.setInitialValues({name: 'name'});
    from.submit();
    from.submit(true);
  });
});
