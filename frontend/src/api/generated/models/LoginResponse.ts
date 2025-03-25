/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { UserDto } from './UserDto';
export type LoginResponse = {
  data?: {
    user?: UserDto;
    accessToken?: string;
    refreshToken?: string;
  };
};
