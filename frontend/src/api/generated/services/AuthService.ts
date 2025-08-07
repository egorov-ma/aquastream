/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LoginRequest } from '../models/LoginRequest';
import type { LoginResponse } from '../models/LoginResponse';
import type { RegisterRequest } from '../models/RegisterRequest';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
  /**
   * Авторизация пользователя
   * @returns LoginResponse Успешная авторизация
   * @throws ApiError
   */
  public static login({
    requestBody,
  }: {
    /**
     * Данные для входа
     */
    requestBody: LoginRequest;
  }): CancelablePromise<LoginResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/auth/login',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        401: `Неверные учетные данные`,
      },
    });
  }
  /**
   * Регистрация нового пользователя
   * @returns LoginResponse Пользователь зарегистрирован
   * @throws ApiError
   */
  public static register({
    requestBody,
  }: {
    /**
     * Данные для регистрации
     */
    requestBody: RegisterRequest;
  }): CancelablePromise<LoginResponse> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/auth/register',
      body: requestBody,
      mediaType: 'application/json',
      errors: {
        400: `Неверный запрос`,
      },
    });
  }
}
