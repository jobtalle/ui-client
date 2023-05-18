import {cast, flow, types} from 'mobx-state-tree';
import {LAST_AIRDROP_KEY, RequestModel} from '@momentum-xyz/core';

import {storage} from 'shared/services';
import {StorageKeyEnum} from 'core/enums';
import {ROUTES} from 'core/constants';
import {getImageAbsoluteUrl} from 'core/utils';
import {getAccessToken, refreshAxiosToken} from 'api/request';
import {PolkadotAddressInterface, User, WorldInfo} from 'core/models';
import PolkadotImplementation from 'shared/services/web3/polkadot.class';
import {
  api,
  AuthChallengeRequest,
  CheckProfileUpdatingJobResponse,
  FetchMeResponse,
  WorldInfoInterface
} from 'api';

const SessionStore = types
  .model('SessionStore', {
    token: '',
    isAuthenticating: true,
    user: types.maybeNull(User),
    signUpUser: types.maybeNull(User),
    worldsOwnedList: types.optional(types.array(WorldInfo), []),
    worldsStakedList: types.optional(types.array(WorldInfo), []),
    profileJobId: types.maybeNull(types.string),

    guestTokenRequest: types.optional(RequestModel, {}),
    challengeRequest: types.optional(RequestModel, {}),
    tokenRequest: types.optional(RequestModel, {}),
    attachAccountRequest: types.optional(RequestModel, {}),
    profileRequest: types.optional(RequestModel, {}),
    profileJobRequest: types.optional(RequestModel, {}),
    worldsRequest: types.optional(RequestModel, {})
  })
  .actions((self) => ({
    updateAxiosAndPosbusTokens(token: string): void {
      console.log('SessionStore: updateAxiosAndPosbusTokens', token);
      self.token = token;
      // TODO: Uncomment. Check Unity is ready.
      // const {universeStore} = getRootStore(self).mainStore;
      // universeStore.setAuthToken(self.token); // TODO: change key
      refreshAxiosToken(self.token);
    }
  }))
  // FIXME: Profile changes should come from a new PosBus
  .actions((self) => ({
    initJobId(): void {
      const jobId = storage.get<string>(StorageKeyEnum.ProfileJobId);
      self.profileJobId = jobId || null;
    },
    setupJobId(jobId: string) {
      storage.setString(StorageKeyEnum.ProfileJobId, jobId);
      self.profileJobId = jobId;
    },
    clearJobId() {
      storage.delete(StorageKeyEnum.ProfileJobId);
      self.profileJobId = null;
    }
  }))
  .actions((self) => ({
    fetchGuestToken: flow(function* () {
      const response = yield self.guestTokenRequest.send(api.authRepository.getGuestToken, {});
      self.updateAxiosAndPosbusTokens(response?.token || '');

      return !!response?.token;
    }),
    fetchTokenByWalletPolkadot: flow(function* (account: PolkadotAddressInterface) {
      const publicKey = PolkadotImplementation.getPublicKeyFromAddress(account.address);
      const hexPublicKey = PolkadotImplementation.convertU8AToHex(publicKey);

      const data: AuthChallengeRequest = {wallet: hexPublicKey};
      const response = yield self.challengeRequest.send(api.authRepository.getChallenge, data);

      if (!!response?.challenge && !!account) {
        // PolkadotImplementation.getAddresses();
        const result = yield PolkadotImplementation.signRaw(
          account.meta?.source || '',
          PolkadotImplementation.convertStringToHex(response.challenge),
          account.address
        );
        if (result?.signature) {
          const data = {wallet: hexPublicKey, signedChallenge: result.signature};
          const response = yield self.tokenRequest.send(api.authRepository.getToken, data);
          // don't update here, return
          // self.updateAxiosAndUnityTokens(response?.token || '');

          return response?.token;
        }
      }

      return false;
    }),
    fetchTokenByWallet: flow(function* (
      account: string,
      signChallenge: (challenge: string) => Promise<string>
    ) {
      const data: AuthChallengeRequest = {wallet: account};
      const response = yield self.challengeRequest.send(api.authRepository.getChallenge, data);

      if (response?.challenge) {
        const signature = yield signChallenge(response.challenge);
        if (signature) {
          const data = {
            wallet: account,
            signedChallenge: signature,
            // network: 'ethereum'
            network: account.length > 42 ? 'polkadot' : 'ethereum'
          };
          const response = yield self.tokenRequest.send(api.authRepository.getToken, data);

          // there's a race condition between the token and the stored user profile
          // self.updateAxiosAndUnityTokens(response?.token || '');

          if (response?.token) {
            return response.token;
          }
        }
      }
      throw new Error('Error fetching token');
    }),
    attachAnotherAccount: flow(function* (
      account: string,
      signChallenge: (challenge: string) => Promise<string>
    ) {
      if (!self.user) {
        return;
      }

      const data: AuthChallengeRequest = {wallet: account};
      const challengeResponse = yield self.challengeRequest.send(
        api.authRepository.getChallenge,
        data
      );

      if (challengeResponse?.challenge) {
        const signature = yield signChallenge(challengeResponse.challenge);
        if (signature) {
          const data = {
            wallet: account,
            signedChallenge: signature,
            network: account.length > 42 ? 'polkadot' : 'ethereum'
          };
          const attachResponse = yield self.attachAccountRequest.send(
            api.authRepository.attachAccount,
            data
          );

          if (attachResponse?.error || !attachResponse?.wallet) {
            console.log('Error attaching account, resp:', attachResponse);
            throw new Error(attachResponse.error?.message || 'Error attaching account');
          }

          //self.user.wallets = cast(attachResponse.wallet);

          return;
        }
      }
      throw new Error('Error attaching account');
    }),
    fetchProfileJobStatus: flow(function* () {
      if (self.profileJobId) {
        const response: CheckProfileUpdatingJobResponse = yield self.profileJobRequest.send(
          api.userProfileRepository.checkJobById,
          {job_id: self.profileJobId}
        );

        return response?.status;
      }

      return;
    }),
    loadUserProfile: flow(function* () {
      const response: FetchMeResponse = yield self.profileRequest.send(
        api.userRepository.fetchMe,
        {}
      );
      if (!response?.id) {
        return false;
      }

      if (!response.name) {
        // handle tmp user creation
        self.signUpUser = cast(response);
      } else {
        self.user = cast(response);
        self.signUpUser = cast(null);
      }
      return true;
    }),
    loadOwnWorlds: flow(function* () {
      const userWorlds: WorldInfoInterface[] = yield self.worldsRequest.send(
        api.userRepository.fetchOwnedWorldList,
        {userId: self.user?.id || ''}
      );

      if (userWorlds) {
        self.worldsOwnedList = cast(userWorlds);
      }
    }),
    loadStakedWorlds: flow(function* () {
      const userWorlds: WorldInfoInterface[] = yield self.worldsRequest.send(
        api.userRepository.fetchStakedWorldList,
        {userId: self.user?.id || ''}
      );

      if (userWorlds) {
        self.worldsStakedList = cast(userWorlds);
      }
    }),
    signOutRedirect(): void {
      self.clearJobId();
      self.updateAxiosAndPosbusTokens('');

      // FIXME: To use the storage instance and the StorageKeyEnum
      localStorage.removeItem(LAST_AIRDROP_KEY);
      document.location = ROUTES.explore;
    },
    // TODO: Removal
    signInRedirect(isNewAccount?: boolean): void {
      // document.location = isNewAccount ? ROUTES.signInAccount : ROUTES.signInAccount;
    }
  }))
  .actions((self) => ({
    loadUserData: flow(function* () {
      yield self.loadUserProfile();
      if (self.user && !self.user.isGuest) {
        yield self.loadOwnWorlds();
        yield self.loadStakedWorlds();
      }
      self.isAuthenticating = false;
    })
  }))
  .actions((self) => ({
    init: flow(function* () {
      const token = getAccessToken();
      if (token) {
        self.updateAxiosAndPosbusTokens(token);
      } else {
        yield self.fetchGuestToken();
      }

      self.initJobId();

      yield self.loadUserData();
    }),
    saveTokenAndClearUser(token: string): void {
      console.log('SessionStore: saveTokenAfterSignIn', token);
      if (self.user) {
        console.log('SessionStore: saveTokenAfterSignIn: clear previous user', self.user.id);
        self.isAuthenticating = true;
        self.user = null;
      }
      // user will be fetched additionally
      self.updateAxiosAndPosbusTokens(token);
    }
  }))
  .views((self) => ({
    get hasToken(): boolean {
      return !!self.token;
    },
    get isAuthenticated(): boolean {
      return !!self.token || !self.isAuthenticating;
    },
    get errorFetchingProfile(): boolean {
      // const {errorCode} = self.profileRequest;
      // TODO check why sometimes the error code is undefined, perhaps CORS issues
      // console.log('errorFetchingProfile', errorCode, self.profileRequest);
      return !!self.token && !self.isAuthenticating && !self.user;
    },
    get isTokenPending(): boolean {
      return self.challengeRequest.isPending || self.tokenRequest.isPending;
    },
    get isUpdatingInBlockchain(): boolean {
      return !!self.profileJobId;
    },
    get isGuestTokenPending(): boolean {
      return self.guestTokenRequest.isPending;
    },
    get isUserReady(): boolean {
      return !!self.user;
    },
    get isGuest(): boolean {
      return self.user?.isGuest ?? true;
    },
    get userId(): string {
      return self.user?.id || '';
    },
    get userImageUrl(): string {
      return getImageAbsoluteUrl(self.user?.profile.avatarHash) || '';
    },
    get wallet(): string {
      return self.user?.wallet || '';
    }
  }));

export {SessionStore};
