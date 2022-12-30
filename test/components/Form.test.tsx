import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/react';
import React, { FC, useEffect, useState } from 'react';
import Form from '../../src/components/Form';
import type { ControlProps } from '../../src/components/Form_item';
import useForm from '../../src/hooks/use_form';
import { render } from '../test_utils';

const items = [
  {
    label: 'label1',
    name: 'name1',
    renderControl: (props: ControlProps) => <CostInput {...props} index={1} />,
  },
  {
    label: 'label2',
    name: 'name2',
    renderControl: (props: ControlProps) => <CostInput {...props} index={2} />,
  },
  {
    label: 'label3',
    name: 'name3',
    renderControl: (props: ControlProps) => <CostInput {...props} index={3} />,
  },
];

interface CostInputProps {
  onValueChange?: (value: string) => void;
  value?: unknown;
  index?: number;
}

const CostInput: FC<CostInputProps> = ({ value, onValueChange, index }) => {
  const [inputValue, setInputValue] = useState('');
  const handleChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    ev.preventDefault();
    const inputtedValue = ev.currentTarget.value;

    setInputValue(inputtedValue);
    onValueChange?.(inputtedValue);
  };

  useEffect(() => {
    value && value !== inputValue && setInputValue(`${value}`);
  }, [value]);

  return (
    <input
      value={inputValue}
      data-cy={`input-${index}`}
      aria-label={`cost-input-${index}`}
      onChange={handleChange}
    />
  );
};

const setup = () => {
  const CostInputForm = () => {
    const [form] = useForm();

    return (
      <Form
        form={form}
        items={items}
        renderMain={({ items }) =>
          items?.map((item, index) => (
            <Form.Item
              key={item.name}
              {...item}
              renderMain={({ value, onValueChange, renderControl }) =>
                renderControl?.({ value, onValueChange })
              }
              renderContainer={({ children }) => (
                <div data-cy={`form-item-${index}`} tabIndex={index}>
                  {children}
                </div>
              )}
            />
          ))
        }
        renderContainer={({ children }) => (
          <div data-cy="form" tabIndex={1}>
            {children}
          </div>
        )}
      />
    );
  };

  const utils = render(<CostInputForm />);
  const input = utils.getByLabelText('cost-input-1') as HTMLInputElement;

  return { input, ...utils };
};

describe('test/components/FormItem.test.ts', () => {
  test('It should be a render form', async () => {
    const { getByDataCy } = render(
      <Form
        items={items}
        renderMain={({ items }) =>
          items?.map((item, index) => (
            <Form.Item
              key={item.name}
              {...item}
              renderMain={({ value, onValueChange, renderControl }) =>
                renderControl?.({ value, onValueChange })
              }
              renderContainer={({ children }) => (
                <div data-cy={`form-item-${index}`} tabIndex={index}>
                  {children}
                </div>
              )}
            />
          ))
        }
        renderContainer={({ children }) => (
          <div data-cy="form" tabIndex={1}>
            {children}
          </div>
        )}
      />,
    );

    expect(getByDataCy('form')).toHaveAttribute('tabIndex');
    expect(getByDataCy('form-item-1')).toHaveAttribute('tabIndex');
    expect(getByDataCy('input-1')).toHaveAttribute('value');
  });

  test('It would be to change the input value', async () => {
    const { input } = setup();

    expect(input).toHaveAttribute('value');

    fireEvent.change(input, { target: { value: '17' } });

    fireEvent.focus(input);
    fireEvent.blur(input);

    expect(input.value).toBe('17');
  });
});
