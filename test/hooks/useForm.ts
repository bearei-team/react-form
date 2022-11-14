import '@testing-library/jest-dom';
import {renderHook} from '@testing-library/react';
import {useForm} from '../../src/hooks/useForm';

describe('test/hooks/useForm.test.ts', () => {
  test('It should be getting an instance of the form', () => {
    const {result} = renderHook(() => useForm());

    expect(
      Object.entries(result.current).every(
        ([, fun]) => typeof fun === 'function'
      )
    ).toEqual(true);
  });
});
