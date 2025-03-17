import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  login as loginAction, 
  logout as logoutAction, 
  register as registerAction,
  updateProfile as updateProfileAction,
  changePassword as changePasswordAction,
  clearError as clearErrorAction
} from '../store/authSlice';
import { 
  LoginData, 
  RegisterData, 
  UpdateProfileData, 
  ChangePasswordData 
} from '../types';
import { RootState, AppDispatch } from '@/store';

/**
 * Хук для работы с аутентификацией
 * Предоставляет доступ к состоянию аутентификации и методам для работы с ней
 */
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  // Вход пользователя
  const login = useCallback(
    async (data: LoginData) => {
      await dispatch(loginAction(data));
    },
    [dispatch]
  );

  // Регистрация пользователя
  const register = useCallback(
    async (data: RegisterData) => {
      await dispatch(registerAction(data));
    },
    [dispatch]
  );

  // Выход пользователя
  const logout = useCallback(
    async () => {
      await dispatch(logoutAction());
    },
    [dispatch]
  );

  // Обновление профиля пользователя
  const updateProfile = useCallback(
    async (userId: string, data: UpdateProfileData) => {
      await dispatch(updateProfileAction({ userId, profileData: data }));
    },
    [dispatch]
  );

  // Изменение пароля пользователя
  const changePassword = useCallback(
    async (userId: string, data: ChangePasswordData) => {
      await dispatch(changePasswordAction({ userId, passwordData: data }));
    },
    [dispatch]
  );

  // Очистка ошибок
  const clearError = useCallback(
    () => {
      dispatch(clearErrorAction());
    },
    [dispatch]
  );

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError
  };
}; 