import * as versionRepository from './repositories/versionRepository';
import * as configRepository from './repositories/configRepository';
import * as webRepository from './repositories/web3Repository';
import * as userRepository from './repositories/userRepository';
import * as userProfileRepository from './repositories/userProfileRepository';
import * as guestRepository from './repositories_OLD/guestRepository';
import * as userRepository_OLD from './repositories_OLD/userRepository';
import * as profileRepository from './repositories_OLD/profileRepository';
import * as eventsRepository from './repositories_OLD/eventsRepository';
import * as spaceRepository from './repositories_OLD/spaceRepository';
import * as flyWithMeRepository from './repositories_OLD/flyWithMeRepository';
import * as stageModeRepository from './repositories_OLD/stageModeRepository';
import * as magicRepository from './repositories_OLD/magicRepository';
import * as tokenRuleRepository from './repositories_OLD/tokenRuleRepository';
import * as validatorsRepository from './repositories_OLD/validatorsRepository';
import * as tokenRepository from './repositories_OLD/tokenRepository';
import * as favoriteRepository from './repositories_OLD/favoriteRepository';
import * as spaceTypeRepository from './repositories_OLD/spaceTypeRepository';
import * as tablesRepository from './repositories_OLD/tablesRepository';
import * as spaceInviteRepository from './repositories_OLD/spaceInviteRepository';
import * as statsRepository from './repositories_OLD/statsRepository';
import * as statusRepository from './repositories_OLD/statusRepository';
import * as playlistRepository from './repositories_OLD/playlistRepository';
import * as meetingRepository from './repositories_OLD/meetingRepository';
import * as attendeesRepository from './repositories_OLD/attendeesRepository';
import * as dashboardRepository from './repositories_OLD/dashboardRepository';
import * as integrationRepository from './repositories_OLD/integrationRepository';
import * as resourcesRepository from './repositories_OLD/resourcesRepository';
import * as agoraRepository from './repositories_OLD/agoraRepository';
import * as spaceIntegrationsRepository from './repositories_OLD/spaceIntegrationsRepository';
import * as vibeRepository from './repositories_OLD/vibeRepository';
import * as textChatRepository from './repositories_OLD/textChatRepository';
import * as streamChatRepository from './repositories_OLD/streamChatRepository';
import * as emojiRepository from './repositories_OLD/emojiRepository';
import * as spaceEmojiRepository from './repositories_OLD/spaceEmojiRepository';
import * as worldBuilderRepository from './repositories_OLD/worldBuilderRepository';

/**
 * This layer is responsible for:
 * - communicating with backend
 * - keeping declarations of API contracts
 * - creating adapters for data to ensure stability of data structures
 */

/**
 * An object containing methods for requests from/to our backend API
 */
export const api = {
  versionRepository,
  configRepository,
  webRepository,
  userRepository,
  userProfileRepository,
  guestRepository,
  userRepository_OLD,
  profileRepository,
  eventsRepository,
  spaceRepository,
  flyWithMeRepository,
  stageModeRepository,
  magicRepository,
  tokenRuleRepository,
  tokenRepository,
  favoriteRepository,
  validatorsRepository,
  spaceTypeRepository,
  tablesRepository,
  spaceInviteRepository,
  statsRepository,
  statusRepository,
  playlistRepository,
  meetingRepository,
  attendeesRepository,
  dashboardRepository,
  agoraRepository,
  spaceIntegrationsRepository,
  integrationRepository,
  resourcesRepository,
  vibeRepository,
  textChatRepository,
  streamChatRepository,
  emojiRepository,
  spaceEmojiRepository,
  worldBuilderRepository
};

/**
 * Re-exports of related types
 *
 * Types can include Request and Response namespaces
 * This is a contract between API and frontend
 */
export * from './repositories/versionRepository/versionRepository.api.types';
export * from './repositories/configRepository/configRepository.api.types';
export * from './repositories/web3Repository/web3Repository.api.types';
export * from './repositories/userRepository/userRepository.api.types';
export * from './repositories/userProfileRepository/userProfileRepository.api.types';

export * from './repositories_OLD/guestRepository/guestRepository.api.types';
export * from './repositories_OLD/spaceRepository/spaceRepository.api.types';
export * from './repositories_OLD/flyWithMeRepository/flyWithMeRepository.api.types';
export * from './repositories_OLD/userRepository/userRepository.api.types';
export * from './repositories_OLD/profileRepository/profileRepository.api.types';
export * from './repositories_OLD/eventsRepository/eventsRepository.api.types';
export * from './repositories_OLD/validatorsRepository/validatorsRepository.api.types';
export * from './repositories_OLD/tokenRuleRepository/tokenRuleRepository.api.types';
export * from './repositories_OLD/magicRepository/magicRepository.api.types';
export * from './repositories_OLD/favoriteRepository/favoriteRepository.api.types';
export * from './repositories_OLD/tokenRepository/tokenRepository.api.types';
export * from './repositories_OLD/statsRepository/statsRepository.api.types';
export * from './repositories_OLD/playlistRepository/playlistRepository.api.types';
export * from './repositories_OLD/meetingRepository/meetingRepository.api.types';
export * from './repositories_OLD/dashboardRepository/dashboardRepository.api.types';
export * from './repositories_OLD/integrationRepository/integrationRepository.api.types';
export * from './repositories_OLD/resourcesRepository/resourcesRepository.types';
export * from './repositories_OLD/spaceTypeRepository/spaceTypeRepository.api.types';
export * from './repositories_OLD/vibeRepository/vibeRepository.api.types';
export * from './repositories_OLD/textChatRepository/textChatRepository.api.types';
export * from './repositories_OLD/streamChatRepository/streamChatRepository.api.types';
export * from './repositories_OLD/emojiRepository/emojiRepository.api.types';
export * from './repositories_OLD/spaceEmojiRepository/spaceEmojiRepository.api.types';
export * from './repositories_OLD/stageModeRepository/stageModeRepository.api.types';
export * from './repositories_OLD/worldBuilderRepository/worldBuilderRepository.api.types';
export * from './repositories_OLD/attendeesRepository/attendeesRepository.api.types';