import {SpaceAttributeItemResponse} from 'api';

/**
 * Convert key-value pairs to generic type.
 * @param subAttributes key-value pairs.
 * @return {type} Generic type.
 */
export const mapSpaceSubAttributes = <T>(subAttributes: SpaceAttributeItemResponse): T => {
  // TODO: add edge cases if it needs
  return subAttributes as never as T;
};
