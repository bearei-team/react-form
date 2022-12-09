import '@testing-library/jest-dom';
import {renderHook} from '@testing-library/react';
import useForm from '../../src/hooks/useForm';

describe('test/hooks/useForm.test.ts', () => {
  test('It should be getting an instance of the form', () => {
    const {result} = renderHook(() => useForm());
    const [form] = result.current;

    expect(Object.entries(form).every(([, fun]) => typeof fun === 'function')).toEqual(true);
  });
});
