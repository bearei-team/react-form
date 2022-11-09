import assert from 'assert';
import validate from '../../src/utils/validate';

describe('test/utils/validate.test.ts', () => {
  it('It should be a success', async () => {
    const result = await validate({
      name: 'name',
      value: '123',
      rules: [
        {
          required: true,
          type: 'string',
          min: 1,
          max: 10,
          message: 'Please enter the correct password.',
        },
      ],
    });

    assert(result.length === 0);
  });

  it('It must have been a failure', async () => {
    const result = await validate({
      name: 'name',
      value: undefined,
      validateFirst: true,
      rules: [
        {
          required: true,
          message: 'Please enter the correct password.',
        },
      ],
    });

    assert(result.length !== 0);
    assert(result[0].message === 'Please enter the correct password.');
  });
});
