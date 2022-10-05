import {types} from 'mobx-state-tree';
import {ResetModel} from '@momentum/sdk';
import {UUIDModel} from '@momentum/core';

import {IntegrationData} from './models';

const Integration = types.compose(
  ResetModel,
  types.model('Integration', {
    spaceId: UUIDModel,
    integrationTypeId: UUIDModel,
    data: types.maybeNull(IntegrationData)
  })
);

export {Integration};
