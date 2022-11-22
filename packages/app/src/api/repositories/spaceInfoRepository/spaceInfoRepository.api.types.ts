export interface PositionInterface {
  x: number;
  y: number;
  z: number;
}

export interface GetSpaceInfoRequest {
  spaceId: string;
}

export interface GetSpaceInfoResponse {
  owner_id: string;
  parent_id: string;
  space_type_id: string;
  asset_2d_id: string;
  asset_3d_id: string;
  position: PositionInterface;
}