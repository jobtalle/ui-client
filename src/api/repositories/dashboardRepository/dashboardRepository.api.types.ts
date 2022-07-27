import {ContentInterface, TileListInterface} from 'core/models';
import {TileType} from 'core/types';

export interface DashboardRequestInterface {
  spaceId: string;
}

export interface DashboardResponseInterface {}

export interface TilesUpdatePositionInterface {
  data: TileListInterface;
}

export interface TileFormInterface {
  type: string;
  text_title?: string;
  text_description?: string;
  file?: File;
  youtube_url?: string;
}

export interface CreateTileDataRequest {
  type: TileType;
  content?: ContentInterface;
  hash?: string;
  permanentType?: null;
  render: 0 | 1;
  internal: boolean;
}

export interface CreateTileResponse {}

export interface CreateTileRequest {
  data: CreateTileDataRequest;
  spaceId: string;
}

export interface UploadTileImageResponse {
  hash: string;
}

export interface ImageUploadRequest {
  file: File;
}

export interface ImageUploadResponse {}

export interface DeleteTileResponse {}
export interface DeleteTileRequest {
  tileId: string;
}
