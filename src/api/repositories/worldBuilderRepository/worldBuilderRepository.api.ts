import {RequestInterface} from 'api/interfaces';
import {request} from 'api/request';

import {worldBuilderEndpoints} from './worldBuilderRepository.api.endpoints';
import {
  ValidateDomainNameResponse,
  ValidationRequest,
  ValidationResponse
} from './worldBuilderRepository.api.types';

export const validateName: RequestInterface<ValidationRequest, ValidationResponse> = (options) => {
  const {name, ...restOptions} = options;

  return request.post(worldBuilderEndpoints().validateName, {name}, restOptions);
};

export const valiedateDomain: RequestInterface<ValidationRequest, ValidateDomainNameResponse> = (
  options
) => {
  const {name, ...restOptions} = options;

  return request.post(worldBuilderEndpoints().valiedateDomain, {name}, restOptions);
};