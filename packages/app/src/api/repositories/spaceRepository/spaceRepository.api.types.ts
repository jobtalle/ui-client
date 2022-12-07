export interface SpaceInterface {
  name: string;
}

export interface FetchSpaceRequest {
  spaceId: string;
}

export interface FetchSpaceResponse extends SpaceInterface {}

export interface PostSpaceRequest {
  parent_id: string;
  space_name: string;
  space_type_id: string;

  asset_2d_id?: string;
  asset_3d_id?: string;
}

export interface PostSpaceResponse {
  space_id: string;
}
