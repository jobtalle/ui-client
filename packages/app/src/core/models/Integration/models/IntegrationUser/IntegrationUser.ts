import {types} from 'mobx-state-tree';
import {UUIDModel} from '@momentum/core';

import {IntegrationUserData} from './models';

const IntegrationUser = types.model('IntegrationUser', {
  userId: UUIDModel,
  spaceId: UUIDModel,
  integrationTypeId: UUIDModel,
  flag: types.number,
  data: IntegrationUserData
});

export {IntegrationUser};
