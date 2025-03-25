/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type UpdateEventRequest = {
  title?: string;
  description?: string;
  shortDescription?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  price?: number;
  capacity?: number;
  difficulty?: UpdateEventRequest.difficulty;
  type?: UpdateEventRequest.type;
  tags?: Array<string>;
  status?: UpdateEventRequest.status;
  imageUrl?: string;
  coverImage?: string;
};
export namespace UpdateEventRequest {
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
  export enum status {
    DRAFT = 'DRAFT',
    UPCOMING = 'UPCOMING',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    PUBLISHED = 'PUBLISHED',
  }
}
