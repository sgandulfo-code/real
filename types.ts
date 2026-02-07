
export enum PropertyStatus {
  INTERESTED = 'Interested',
  CONTACTED = 'Contacted',
  VISITED = 'Visited',
  DISCARDED = 'Discarded'
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface SearchGroup {
  id: string;
  userId: string;
  name: string;
  description: string;
  createdAt: number;
}

export interface Property {
  id: string;
  searchGroupId: string; // Belongs to a search project
  url: string;
  title: string;
  price: string;
  address: string;
  lat?: number;
  lng?: number;
  thumbnail: string;
  sourceName: string;
  favicon: string;
  rating: number;
  nextVisit?: string;
  contactName: string;
  contactPhone: string;
  status: PropertyStatus;
  comments: string;
  createdAt: number;
  isFavorite?: boolean;
}

export interface GeminiExtractionResult {
  title: string;
  price: string;
  address: string;
  sourceName: string;
  lat?: number;
  lng?: number;
}
