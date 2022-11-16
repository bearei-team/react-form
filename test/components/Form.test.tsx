import '@testing-library/jest-dom';
import {render} from '../test_utils';
import {FormItem} from '../../src/components/FormItem';
import {Form} from '../../src/components/Form';
import React from 'react';

describe('test/components/Form.test.ts', () => {
  test('It should be a render form', () => {
    const {getByDataCy} = render(
      <Form>
        <FormItem name="name">
          <>
            <input data-cy="input-1" type="text" />
          </>
        </FormItem>

        <FormItem name="name">
          <>
            <input data-cy="input-2" type="text" />
          </>
        </FormItem>
      </Form>,
    );

    expect(getByDataCy('input-1')).toHaveAttribute('type');
    expect(getByDataCy('input-2')).toHaveAttribute('type');
  });
});
