import useFormContext from '../../src/hooks/useFormContext';
import {renderHook} from '@testing-library/react';
import '@testing-library/jest-dom';

describe('test/hooks/useFormContext.test.ts', () => {
  test('It should be getting the form context', () => {
    const {result} = renderHook(() => useFormContext());

    expect(result.current).toEqual({});
  });
});
