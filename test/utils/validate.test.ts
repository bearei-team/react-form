import validateRule from '../../src/utils/validate';

describe('test/utils/validate.test.ts', () => {
  test('It should be a success', async () => {
    const result = await validateRule({
      name: 'name',
      value: '123',
      rules: [
        {
          required: true,
          message: 'Please enter your password.',
        },
        {
          required: true,
          type: 'string',
          min: 1,
          max: 10,
          message: 'Please enter a 1-to 10-digit password.',
        },
      ],
    });

    expect(result).toEqual(undefined);
  });

  test('It should be a failure', async () => {
    const result = await validateRule({
      name: 'name',
      value: 'undefined',
      validateFirst: true,
      rules: [
        {
          type: 'number',
          message: 'Please enter the number.',
        },
        {
          type: 'array',
          message: 'Please enter the array.',
        },
      ],
    });

    expect(result?.errors[0].field).toEqual('name');
    expect(result?.errors[0].message).toEqual('Please enter the number.');
    expect(result?.errors[0].fieldValue).toEqual('undefined');
    expect(result?.rules?.length).toEqual(2);
  });
});
