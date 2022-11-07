import {PluginConfigInterface} from './pluginConfig.interface';

export interface APIInterface<C extends PluginConfigInterface = PluginConfigInterface> {
  get: <T>(key: string) => Promise<T>;
  set: <T>(key: string, value: T extends undefined ? never : T) => Promise<T>;
  getConfig: () => Promise<C>;
}
