import {flow, Instance, types, cast} from 'mobx-state-tree';
import {RequestModel} from '@momentum/core';
import {ResetModel} from '@momentum/sdk';

import {api, WorldConfigType, WorldConfigResponse} from 'api';

const WorldStore = types.compose(
  ResetModel,
  types
    .model('WorldStore', {
      worldId: types.optional(types.string, ''),
      worldConfigRequest: types.optional(RequestModel, {}),
      worldConfig: types.maybe(types.frozen<WorldConfigType>())
    })
    .actions((self) => ({
      fetchWorldConfig: flow(function* (worldId: string) {
        const response: WorldConfigResponse = yield self.worldConfigRequest.send(
          api.spaceRepository.fetchWorldConfig,
          {worldId}
        );

        if (response) {
          self.worldConfig = cast(response);
        }
      })
    }))
    .actions((self) => ({
      init(worldId: string) {
        self.worldId = worldId;
        self.fetchWorldConfig(worldId);
      }
    }))
);

export type WorldStoreType = Instance<typeof WorldStore>;

export {WorldStore};
