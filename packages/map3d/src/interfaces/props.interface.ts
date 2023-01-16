import {PlanetInterface} from './planet.interface';

export interface Map3dPropsInterface {
  centerWallet: string;
  items: PlanetInterface[];
  selectedUuid?: string;
  getImageUrl(imageUrlOrHash: string | undefined | null): string | null;
  getConnections(wallet: string): Promise<string[]>;
  onSelect: (uuid: string) => void;
}
