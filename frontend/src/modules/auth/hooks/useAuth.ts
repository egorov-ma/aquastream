import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  login,
  logout,
  register,
  updateProfile,
  changePassword,
  clearError,
} from '../store/authSlice';
import { User, LoginData, RegisterData, UpdateProfileData, ChangePasswordData } from '../types';

import { RootState, AppDispatch } from '@/store';

/**
 * Хук для работы с аутентификацией
 */
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user, accessToken, refreshToken, isLoading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const loginUser = useCallback(
    (credentials: LoginData) => dispatch(login(credentials)),
    [dispatch]
  );

  const registerUser = useCallback((data: RegisterData) => dispatch(register(data)), [dispatch]);

  const logoutUser = useCallback(() => dispatch(logout()), [dispatch]);

  const updateUserProfile = useCallback(
    (userId: string, data: UpdateProfileData) =>
      dispatch(updateProfile({ userId, profileData: data })),
    [dispatch]
  );

  const changeUserPassword = useCallback(
    (userId: string, data: ChangePasswordData) =>
      dispatch(changePassword({ userId, passwordData: data })),
    [dispatch]
  );

  const clearAuthError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    isAuthenticated,
    user,
    token: accessToken,
    refreshToken,
    isLoading,
    error,
    login: loginUser,
    register: registerUser,
    logout: logoutUser,
    updateProfile: updateUserProfile,
    changePassword: changeUserPassword,
    clearError: clearAuthError,
  };
};

export type { User, LoginData, RegisterData, UpdateProfileData, ChangePasswordData };
