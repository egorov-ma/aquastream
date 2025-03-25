import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import type { RootState, AppDispatch } from './index';

/**
 * Типизированный хук для доступа к dispatch
 * Использование: const dispatch = useAppDispatch();
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Типизированный хук для доступа к state
 * Использование: const someState = useAppSelector(state => state.someSlice.someProperty);
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
