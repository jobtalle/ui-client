import React, {FC, useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {useTheme} from 'styled-components';
import {t} from 'i18next';
import {keyring} from '@polkadot/ui-keyring';

import {Dialog, Loader, TabBar, TabBarTabInterface} from 'ui-kit';
import {useStore} from 'shared/hooks';

import {Validators, Authorization, Nominator} from './components/templates';
import * as styled from './StakingWidget.styled';

const StakingWidget: FC = () => {
  const theme = useTheme();
  const {stakingStore} = useStore().widgetStore;
  const {stakingDialog, validatorsStore, operatorSpaceId, polkadotProviderStore} = stakingStore;
  const [selectedTab, setSelectedTab] = useState<TabBarTabInterface>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const tabBarTabs: TabBarTabInterface[] = [
    {
      id: '1',
      title: t('staking.stakingTab.stakingDashboard'),
      label: t('staking.nominator'),
      icon: 'wallet',
      disabled: true
    },
    {
      id: '2',
      title: t('staking.stakingTab.validators'),
      label: `${t('staking.validatorsTab')} [${validatorsStore.validatorsTotals}]`,
      icon: 'cube',
      disabled: true
    },
    {
      id: '3',
      title: t('staking.stakingTab.authorization'),
      label: t('staking.authorization'),
      icon: 'lightningDuotone',
      disabled: true
    }
  ];

  const connectToChain = () => {
    setIsLoading(true);
    polkadotProviderStore.init().then(() => {
      setIsLoading(false);
      keyring.accounts.subject.subscribe((accounts = {}) => {
        console.log('useAccounts hook');
        console.log(accounts);
      });
    });
  };

  useEffect(() => {
    stakingStore.fetchValidators();
    setSelectedTab(tabBarTabs[0]);

    return () => {
      stakingStore.clearStore();
    };
  }, [stakingStore]);

  useEffect(() => {
    connectToChain();
  }, []);

  return (
    <Dialog
      theme={theme}
      title={selectedTab?.title ? selectedTab.title : ''}
      headerStyle="uppercase"
      showCloseButton
      onClose={stakingDialog.close}
    >
      <styled.Container>
        <TabBar
          tabs={tabBarTabs}
          selectedTab={selectedTab}
          onTabSelect={(tab) => setSelectedTab(tab)}
        />
        <styled.TabContainer>
          {isLoading ? (
            <Loader />
          ) : (
            <>
              {selectedTab?.id === '1' && (
                <Nominator
                  goToValidators={() => setSelectedTab(tabBarTabs[1])}
                  goToAuthorization={() => setSelectedTab(tabBarTabs[2])}
                />
              )}
              {selectedTab?.id === '2' && (
                <Validators
                  operatorSpaceId={operatorSpaceId}
                  goToNominator={() => setSelectedTab(tabBarTabs[0])}
                  goToAuthorization={() => setSelectedTab(tabBarTabs[2])}
                />
              )}
              {selectedTab?.id === '3' && (
                <Authorization
                  goToNominator={() => setSelectedTab(tabBarTabs[0])}
                  goToValidators={() => setSelectedTab(tabBarTabs[1])}
                />
              )}
            </>
          )}
        </styled.TabContainer>
      </styled.Container>
    </Dialog>
  );
};

export default observer(StakingWidget);
