import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';
import useFormContext from '../../src/hooks/use-form-context';

describe('test/hooks/useFormContext.test.ts', () => {
  test('It should be getting the form context', async () => {
    const { result } = renderHook(() => useFormContext());

    expect(result.current).toEqual({});
  });
});
