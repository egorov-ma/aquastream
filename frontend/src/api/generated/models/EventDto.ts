/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserDto } from './UserDto';
export type EventDto = {
  id?: string;
  title?: string;
  description?: string;
  shortDescription?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  price?: number;
  capacity?: number;
  currentParticipants?: number;
  organizerId?: string;
  organizer?: UserDto;
  difficulty?: EventDto.difficulty;
  type?: EventDto.type;
  tags?: Array<string>;
  status?: EventDto.status;
  imageUrl?: string;
  coverImage?: string;
  createdAt?: string;
  updatedAt?: string;
};
export namespace EventDto {
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
