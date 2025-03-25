/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UserDto = {
  id?: string;
  username?: string;
  email?: string;
  displayName?: string;
  avatar?: string;
  role?: UserDto.role;
  createdAt?: string;
};
export namespace UserDto {
  export enum role {
    GUEST = 'GUEST',
    USER = 'USER',
    MANAGER = 'MANAGER',
    ADMIN = 'ADMIN',
  }
}
