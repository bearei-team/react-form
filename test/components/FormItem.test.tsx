import '@testing-library/jest-dom';

import {render} from '../test_utils';
import {FormItem} from '../../src/components/FormItem';
import {fireEvent} from '@testing-library/react';
import {Form} from '../../src/components/Form';
import {useEffect, useState} from 'react';

interface CostInputProps {
  onValueChange?: (value: string) => void;

  value?: string;
}

function CostInput({onValueChange, value}: CostInputProps) {
  const [inputValue, setInputValue] = useState('');
  const removeDollarSign = (value: string) =>
    value[0] === '$' ? value.slice(1) : value;

  const getReturnValue = (value: string) => (value === '' ? '' : `$${value}`);
  const handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const inputtedValue = ev.currentTarget.value;
    const noDollarSign = removeDollarSign(inputtedValue);

    setInputValue(getReturnValue(noDollarSign));
    onValueChange?.(getReturnValue(noDollarSign));
  };

  useEffect(() => {
    value && value !== inputValue && setInputValue(value);
  }, [value]);

  return (
    <input value={inputValue} aria-label="cost-input" onChange={handleChange} />
  );
}

const setup = () => {
  const utils = render(
    <Form>
      <FormItem
        name="name"
        data-cy="FormItem"
        validateFirst={true}
        rules={[
          {
            required: true,
            message: 'Please enter your password.',
          },
        ]}
      >
        <CostInput />
      </FormItem>
    </Form>
  );

  const input = utils.getByLabelText('cost-input') as HTMLInputElement;

  return {
    input,
    ...utils,
  };
};

describe('test/components/FormItem.test.ts', () => {
  test('It should be a render form item', () => {
    const {getByDataCy} = render(
      <Form>
        <FormItem
          name="name"
          data-cy="FormItem"
          validateFirst={true}
          rules={[
            {
              required: true,
              message: 'Please enter your password.',
            },
          ]}
        >
          <input data-cy="input" type="text" value="" />
        </FormItem>
      </Form>
    );

    expect(getByDataCy('input')).toHaveAttribute('type');
    expect(getByDataCy('input')).toHaveAttribute('value');
  });

  test('It should be setting the value of the form item', () => {
    const {input} = setup();
    fireEvent.change(input, {target: {value: '23'}});

    expect(input.value).toBe('$23');
  });
});
