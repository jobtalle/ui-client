import {cast, flow, types} from 'mobx-state-tree';
import {ApiPromise} from '@polkadot/api';
import {BN, BN_THOUSAND, BN_TWO, BN_ZERO, bnMin, bnToBn, formatBalance} from '@polkadot/util';
import {cloneDeep} from 'lodash-es';
import {
  DeriveBalancesAll,
  DeriveSessionProgress,
  DeriveStakingAccount
} from '@polkadot/api-derive/types';
import {u64} from '@polkadot/types-codec/primitive/U64';
import {SubmittableExtrinsic} from '@polkadot/api/promise/types';

import {
  PolkadotAddress,
  PolkadotAddressBalance,
  PolkadotUnlockingDuration,
  ResetModel
} from 'core/models';
import SubstrateProvider from 'shared/services/web3/SubstrateProvider';
import {calcUnbondingAmount, formatExistential} from 'core/utils';
import {AccountTypeBalanceType, KeyringAddressType} from 'core/types';
import {Payee, StakingTransactionType} from 'core/enums';
import {inputToBN} from 'core/utils';

const PolkadotProviderStore = types
  .compose(
    ResetModel,
    types.model('PolkadotProvider', {
      addresses: types.optional(types.array(PolkadotAddress), []),
      stashAccount: types.maybeNull(PolkadotAddress),
      stashAccountBalance: types.maybeNull(PolkadotAddressBalance),
      controllerAccount: types.maybeNull(PolkadotAddress),
      controllerAccountBalance: types.maybeNull(PolkadotAddressBalance),
      unlockingDuration: types.maybeNull(PolkadotUnlockingDuration),
      chainDecimals: types.maybe(types.number),
      tokenSymbol: '',
      existentialDeposit: types.optional(types.frozen(), 0),
      minNominatorBond: '',
      ss58Format: types.maybe(types.number),
      isWeb3Injected: false,
      paymentDestination: '',
      customPaymentDestination: '',
      stakingAmount: '',
      unbondAmount: '',
      bondedAddress: types.maybeNull(types.string),
      usedStashAddress: types.maybeNull(types.string),
      transactionType: types.maybeNull(types.enumeration(Object.values(StakingTransactionType))),
      transactionFee: '',
      isLoading: false
    })
  )
  .volatile<{
    channel: ApiPromise | null;
    balanceAll: DeriveBalancesAll | null;
    customRewardDestinationBalance: DeriveBalancesAll | null;
    stakingInfo: DeriveStakingAccount | null;
    sessionProgress: DeriveSessionProgress | null;
  }>(() => ({
    channel: null,
    balanceAll: null,
    customRewardDestinationBalance: null,
    stakingInfo: null,
    sessionProgress: null
  }))
  .views((self) => {
    return {
      get hasAddresses() {
        return !!self.addresses.length;
      },
      get accountAddresses() {
        return self.addresses.map((account) => account.address);
      },
      get addressOptions() {
        return self.addresses.map((account) => ({
          label: account.meta?.name
            ? `${account.meta?.name} - ${account.address}`
            : account.address,
          value: account.address,
          icon: 'wallet' as IconName
        }));
      },
      get controllerAccountValidation() {
        const isMappedToAnotherStash =
          self.bondedAddress && self.stashAccount?.address !== self.controllerAccount?.address;
        const isManagingMultipleStashes = !!self.usedStashAddress;
        const sufficientFunds = self.controllerAccountBalance?.transferable === '0';
        return {
          isMappedToAnotherStash,
          isManagingMultipleStashes,
          sufficientFunds,
          isNominatorAcceptable:
            isMappedToAnotherStash || isManagingMultipleStashes || sufficientFunds
        };
      },
      get customRewardDestinationValidation() {
        return (
          self.customRewardDestinationBalance?.freeBalance.isZero() ||
          !self.customPaymentDestination
        );
      },
      get hasCustomRewardValidation() {
        return self.paymentDestination === Payee.Account
          ? this.customRewardDestinationValidation
          : false;
      },
      get bondAmountValidation() {
        const gtStashFunds =
          Number(self.stashAccountBalance?.transferableWithoutFee) !== 0 &&
          Number(self.stakingAmount) > Number(self.stashAccountBalance?.transferableWithoutFee);
        const ltThenExistentialDeposit =
          Number(self.stakingAmount) < Number(formatExistential(self.existentialDeposit as BN));
        const ltMinNominatorBond =
          Number(self.minNominatorBond) &&
          Number(self.stakingAmount) < Number(self.minNominatorBond);

        return {
          gtStashFunds,
          ltThenExistentialDeposit,
          ltMinNominatorBond,
          isBondAmountAcceptable: gtStashFunds || ltMinNominatorBond || ltThenExistentialDeposit
        };
      },
      get unlockingProgress() {
        return SubstrateProvider.deriveUnlockingProgress(self.stakingInfo, self.sessionProgress);
      },
      get isStakingAccountUnlocking() {
        const [mapped] = this.unlockingProgress;
        return !(!self.stakingInfo || !mapped.length);
      },
      get isUnbondingPermitted() {
        const isOwnController = this.accountAddresses.includes(
          self.stakingInfo?.controllerId?.toJSON() || ''
        );
        return !(
          !isOwnController ||
          !self.stakingInfo ||
          !self.stakingInfo?.stakingLedger ||
          self.stakingInfo?.stakingLedger.active?.isEmpty
        );
      },
      get unbondAmountValidation() {
        const minAmount = Number(self.unbondAmount) <= 0;
        const maxAmount = Number(self.unbondAmount) > Number(self.stashAccountBalance?.bonded);
        return {
          minAmount,
          maxAmount,
          isBondAmountAcceptable: minAmount || maxAmount
        };
      },
      get bondedControllerAddress() {
        return self.stakingInfo?.controllerId?.toJSON();
      },
      get transactionSigner() {
        const signerAddress =
          self.transactionType === StakingTransactionType.Bond
            ? self.stashAccount?.address
            : this.bondedControllerAddress;
        return self.addresses.find((account) => account.address === signerAddress);
      },
      get isWithdrawUnbondedPermitted() {
        return !!self.stakingInfo?.redeemable?.gtn(0);
      }
    };
  })
  .actions((self) => ({
    getBalances: flow(function* (address: string, accountTypeBalance: AccountTypeBalanceType) {
      const balanceAll =
        self.channel !== null ? yield self.channel.derive.balances?.all(address) : null;

      const stakingInfo =
        self.channel !== null ? yield self.channel.derive.staking?.account(address) : null;

      const locked = formatBalance(
        balanceAll.lockedBalance,
        SubstrateProvider.FORMAT_OPTIONS,
        self.chainDecimals
      );
      const total = formatBalance(
        balanceAll.freeBalance.add(balanceAll.reservedBalance),
        SubstrateProvider.FORMAT_OPTIONS,
        self.chainDecimals
      );
      const transferable = formatBalance(
        balanceAll.availableBalance,
        SubstrateProvider.FORMAT_OPTIONS,
        self.chainDecimals
      );

      const transferableWithoutFee = formatBalance(
        balanceAll.freeBalance.gt(self.existentialDeposit)
          ? balanceAll.freeBalance.sub(self.existentialDeposit)
          : BN_ZERO,
        SubstrateProvider.FORMAT_OPTIONS,
        self.chainDecimals
      );

      const bonded = formatBalance(
        stakingInfo.stakingLedger.active.unwrap(),
        SubstrateProvider.FORMAT_OPTIONS,
        self.chainDecimals
      );
      const redeemable = formatBalance(
        stakingInfo.redeemable,
        SubstrateProvider.FORMAT_OPTIONS,
        self.chainDecimals
      );
      const unbonding = formatBalance(
        calcUnbondingAmount(stakingInfo),
        SubstrateProvider.FORMAT_OPTIONS,
        self.chainDecimals
      );

      self[accountTypeBalance] = cast({
        locked,
        total,
        transferable,
        bonded,
        redeemable,
        unbonding,
        transferableWithoutFee
      });
    }),
    setIsLoading(payload: boolean) {
      self.isLoading = payload;
    },
    setStakingInfo(payload: DeriveStakingAccount) {
      self.stakingInfo = payload;
    },
    setBalanceAll(payload: DeriveBalancesAll) {
      self.balanceAll = payload;
    },
    setCustomRewardDestinationBalance(payload: DeriveBalancesAll) {
      self.customRewardDestinationBalance = payload;
    },
    setSessionProgress(payload: DeriveSessionProgress) {
      self.sessionProgress = payload;
    },
    setInjectAddresses(payload: KeyringAddressType[]) {
      self.addresses = cast(payload);
    }
  }))
  .actions((self) => ({
    getAddresses: flow(function* () {
      yield SubstrateProvider.getAddresses(self.ss58Format).then((injectedAccounts) => {
        SubstrateProvider.loadToKeyring(
          injectedAccounts,
          self.ss58Format,
          self.channel?.genesisHash
        );
      });
      const injectedAddresses = SubstrateProvider.getKeyringAddresses();
      self.setInjectAddresses(injectedAddresses as KeyringAddressType[]);
    }),

    setStashAccount: flow(function* (address: string) {
      const result = self.addresses.find((account) => account.address === address);
      self.stashAccount = cast(cloneDeep(result));
      yield self.getBalances(address, 'stashAccountBalance');
    }),
    getMinNominatorBond: flow(function* () {
      const minNominatorBond = self.channel
        ? yield self.channel?.query.staking.minNominatorBond()
        : null;
      const minNominatorBondFormatted = formatBalance(
        minNominatorBond,
        SubstrateProvider.FORMAT_OPTIONS,
        self.chainDecimals
      );
      self.minNominatorBond = cast(minNominatorBondFormatted);
    }),
    setControllerAccount: flow(function* (address: string) {
      const result = self.addresses.find((account) => account.address === address);
      self.controllerAccount = cast(cloneDeep(result));
      yield self.getBalances(address, 'controllerAccountBalance');
    }),
    getBondedAddress: flow(function* (address: string) {
      const bonded =
        self.channel !== null ? yield self.channel.query.staking.bonded(address) : null;
      self.bondedAddress = cast(bonded.toJSON());
    }),
    getUsedStashAddress: flow(function* (address: string) {
      const stash = self.channel !== null ? yield self.channel.query.staking.ledger(address) : null;
      const stashId = stash.toJSON() !== null ? stash.toJSON().stash : null;
      self.usedStashAddress = cast(stashId);
    })
  }))
  .actions((self) => ({
    connectToChain: flow(function* () {
      self.channel = yield SubstrateProvider.initAPI();
    }),
    setIsWeb3Injected: flow(function* () {
      const isEnabled = yield SubstrateProvider.isExtensionEnabled();
      self.isWeb3Injected = cast(isEnabled);
    }),
    initAccount: flow(function* () {
      yield self.setStashAccount(self.addresses[0].address);
      if (self.stashAccount?.address) {
        yield self.setControllerAccount(self.stashAccount.address);
        yield self.getBondedAddress(self.stashAccount.address);
        yield self.getUsedStashAddress(self.stashAccount.address);
      }
    }),
    getChainInformation: flow(function* () {
      self.tokenSymbol = cast(
        self.channel?.registry.chainTokens[0] ? self.channel?.registry.chainTokens[0] : ''
      );

      self.ss58Format = cast(self.channel?.registry.chainSS58);
      self.chainDecimals = cast(self.channel?.registry.chainDecimals[0]);
      SubstrateProvider.setDefaultBalanceFormatting(
        self.channel?.registry.chainDecimals[0],
        self.channel?.registry.chainTokens[0]
      );

      self.existentialDeposit = cast(self.channel?.consts.balances.existentialDeposit);
      yield self.getMinNominatorBond();
    }),
    async calculateUnlockingDuration(blocks: BN) {
      const A_DAY = new BN(24 * 60 * 60 * 1000);
      const THRESHOLD = BN_THOUSAND.div(BN_TWO);
      const DEFAULT_TIME = new BN(6_000);

      const time =
        self.channel?.consts.babe?.expectedBlockTime ||
        self.channel?.consts.difficulty?.targetBlockTime ||
        self.channel?.consts.subspace?.expectedBlockTime ||
        ((self.channel?.consts.timestamp?.minimumPeriod as u64).gte(THRESHOLD)
          ? (self.channel?.consts.timestamp.minimumPeriod as u64).mul(BN_TWO)
          : (await self.channel?.query.parachainSystem)
          ? DEFAULT_TIME.mul(BN_TWO)
          : DEFAULT_TIME);

      const interval = bnMin(A_DAY, time as BN);
      const duration = SubstrateProvider.formatUnlockingDuration(interval, bnToBn(blocks));

      self.unlockingDuration = cast(duration);
    },
    setTransactionType(transactionType: StakingTransactionType) {
      self.transactionType = cast(transactionType);
    },
    setPaymentDestination(payee: Payee) {
      self.paymentDestination = cast(payee);
    },
    setCustomPaymentDestination(address: string) {
      self.customPaymentDestination = cast(address);
    },
    setStakingAmount(amount: string) {
      self.stakingAmount = cast(amount);
    },
    setUnbondAmount(amount: string) {
      self.unbondAmount = cast(amount);
    },
    setTransactionFee(amount: string) {
      self.transactionFee = cast(amount);
    },
    derivePaymentDestination() {
      return self.paymentDestination === Payee.Account
        ? {
            Account: self.customPaymentDestination
          }
        : self.paymentDestination;
    },
    bondExtrinsics(selectedValidators: string[]) {
      const amountBN = inputToBN(self.stakingAmount, self.chainDecimals, self.tokenSymbol);
      const txBatched: Array<SubmittableExtrinsic | undefined> = [];

      const paymentDestination = this.derivePaymentDestination();

      if (self.stashAccount?.address === self.controllerAccount?.address) {
        txBatched.push(
          self.channel?.tx.staking.bond(self.stashAccount?.address, amountBN, paymentDestination)
        );
        txBatched.push(self.channel?.tx.staking.nominate(selectedValidators));
      } else if (self.stashAccount?.address !== self.controllerAccount?.address) {
        txBatched.push(
          self.channel?.tx.staking.bond(self.stashAccount?.address, amountBN, paymentDestination)
        );
        txBatched.push(self.channel?.tx.staking.setController(self.controllerAccount?.address));
        txBatched.push(self.channel?.tx.staking.nominate(selectedValidators));
      }

      return self.channel?.tx.utility.batchAll(txBatched);
    },
    unbondExtrinsics() {
      const amountBN = inputToBN(self.unbondAmount, self.chainDecimals, self.tokenSymbol);
      return self.channel?.tx.staking.unbond(amountBN);
    },
    async withdrawUnbondedExtrinsics() {
      const args = (await self.channel?.tx.staking.withdrawUnbonded.meta.args.length) === 1;
      const spanCount = await self.channel?.query.staking.slashingSpans(self.stakingInfo?.stashId);
      const params = args ? [spanCount] : [];
      return self.channel?.tx.staking.withdrawUnbonded(params);
    },
    chillExtrinsics() {
      return self.channel?.tx.staking.chill();
    },
    async calculateFee(extrinsics: SubmittableExtrinsic | undefined) {
      const calculatedFee = await extrinsics?.paymentInfo(
        self.transactionSigner?.address as string
      );
      const feeFormatted = formatBalance(calculatedFee?.partialFee, {withSiFull: true}, 12);
      this.setTransactionFee(feeFormatted);
    }
  }))
  .actions((self) => ({
    init: flow(function* () {
      self.setIsLoading(true);
      yield self.connectToChain();
      yield self.setIsWeb3Injected();
      yield self.getChainInformation();
      yield self.getAddresses();
      yield self.initAccount();
      self.setIsLoading(false);
    })
  }));

export {PolkadotProviderStore};
