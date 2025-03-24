import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';

import type { RootState, AppDispatch } from '../store';

// Типизированные и мемоизированные хуки для использования вместо обычных `useDispatch` и `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Этот хук автоматически мемоизирует результат селектора
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Хук для создания мемоизированных селекторов, оптимизирующий повторные рендеры
export function createSelector<TSelected>(
  selector: (state: RootState) => TSelected,
  equalityFn?: (left: TSelected, right: TSelected) => boolean
) {
  return function useAppMemoSelector() {
    return useAppSelector(selector, equalityFn);
  };
}

// Хук для получения мемоизированного значения из стора с дополнительным преобразованием
export function useMemoSelector<TSelected, TResult>(
  selector: (state: RootState) => TSelected,
  transformer: (selected: TSelected) => TResult
) {
  const selectedValue = useAppSelector(selector);
  return useMemo(() => transformer(selectedValue), [selectedValue, transformer]);
}
