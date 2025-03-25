/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type CreateEventRequest = {
  title: string;
  description: string;
  shortDescription?: string;
  startDate: string;
  endDate: string;
  location: string;
  price: number;
  capacity: number;
  difficulty: CreateEventRequest.difficulty;
  type: CreateEventRequest.type;
  tags?: Array<string>;
  imageUrl?: string;
  coverImage?: string;
};
export namespace CreateEventRequest {
  export enum difficulty {
    EASY = 'EASY',
    MEDIUM = 'MEDIUM',
    HARD = 'HARD',
    EXPERT = 'EXPERT',
  }
  export enum type {
    RAFTING = 'RAFTING',
    KAYAKING = 'KAYAKING',
    SUP = 'SUP',
    DIVING = 'DIVING',
    SURFING = 'SURFING',
    SAILING = 'SAILING',
    OTHER = 'OTHER',
  }
}
