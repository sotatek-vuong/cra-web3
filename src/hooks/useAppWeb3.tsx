import React, { createContext, useCallback, useContext, useEffect } from 'react';
import {
  getAddChainParameters,
  metamask,
  metamaskHooks,
  walletconnect,
  walletconnectHooks,
  CHAIN_ID,
} from 'src/utils/web3';
import type { Connector } from '@web3-react/types';
import { getPriorityConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';

import { useLocalStorage } from 'react-use';
import { ethers } from 'ethers';
import _ from 'lodash';

interface AddTokenParams {
  address: string;
  symbol: string;
  decimals: number;
  image?: string;
}

type SupportedConnection = 'metamask' | 'walletconnect';

interface IAppWeb3Context {
  connect: (conn: SupportedConnection) => Promise<any>;
  disconnect: (...args: any[]) => any;
  changeNetwork: (nextChainId: number) => Promise<any>;
  addToken: (_token: AddTokenParams, _type?: string) => Promise<any>;
  unsupportedNetwork: boolean;
  connector?: Connector;
  provider?: ethers.providers.Web3Provider;
  account?: string;
  chainId?: number;
  error?: Error;
}

const ConnectionMappings: Record<SupportedConnection, Connector> = {
  metamask,
  walletconnect,
};

const AppWeb3Context = createContext<IAppWeb3Context | null>(null);
export const useAppWeb3 = () => useContext(AppWeb3Context)!;

const {
  usePriorityConnector,
  usePriorityProvider,
  usePriorityAccount,
  usePriorityChainId,
  usePriorityError,
} = getPriorityConnector([metamask, metamaskHooks], [walletconnect, walletconnectHooks]);

export const AppWeb3Provider: React.FC = ({ children }) => {
  const [connection, setConnection, removeConnection] = useLocalStorage<SupportedConnection>(
    'connection',
    undefined,
    { raw: true },
  );

  const chainId = usePriorityChainId?.();
  const connector = usePriorityConnector?.();
  const provider = usePriorityProvider?.();
  const account = usePriorityAccount?.();
  const error = usePriorityError?.();

  const _activate = useCallback(
    async (_connector: Connector, nextChainId: number) => {
      if (nextChainId !== CHAIN_ID) return;
      try {
        if (_connector instanceof MetaMask) {
          const chain = getAddChainParameters(nextChainId);

          await _connector?.provider?.request({
            method: 'wallet_addEthereumChain',
            params: [getAddChainParameters(nextChainId, true)],
          });
          chain && (await _connector?.activate());
          setConnection('metamask');
          return;
        }

        if (_connector instanceof WalletConnect) {
          await walletconnect.activate(nextChainId);

          if (walletconnect.provider?.connected) {
            setConnection('walletconnect');
          }
          return;
        }
      } catch (err) {
        console.log({ err });
      }
    },
    [setConnection],
  );

  useEffect(() => {
    if (!chainId && !account && connection) {
      const conn = _.get(ConnectionMappings, [connection], undefined);

      conn?.connectEagerly?.();
    }
  }, [chainId, account, connection]);

  const wrongNetwork = chainId !== CHAIN_ID;

  useEffect(() => {
    /**
     * learn more: https://ethereum.stackexchange.com/questions/93502/metamask-api-cant-detect-events-connect-and-disconnect-in-react-js
     */
    metamask.provider?.on('accountsChanged', (accounts: string[]) => {
      if (_.isEmpty(accounts)) {
        removeConnection();
      }
    });

    // https://github.com/NoahZinsmeister/web3-react/blob/32c323ecfa4787304051cea73b2b85829fcb0bf0/packages/walletconnect/src/index.ts#L54
    // Override the disconnect listener of @web-react/core
    // @ts-ignore
    walletconnect.disconnectListener = function () {
      walletconnect.deactivate();

      removeConnection();
    };
  }, []);

  const connect = useCallback<IAppWeb3Context['connect']>(
    async (type) => {
      const conn = _.get(ConnectionMappings, [type], undefined);
      if (!conn) return;
      await _activate(conn, CHAIN_ID);
    },
    [_activate],
  );

  const disconnect = useCallback<IAppWeb3Context['disconnect']>(async () => {
    removeConnection();
    // in case user having multi connection on our app
    try {
      await metamask.deactivate();
    } catch (err) {
      console.log('metamask', err);
    }
    try {
      await walletconnect.deactivate();
    } catch (err) {
      console.log('walletconnect', err);
    }
  }, []);

  const addToken = useCallback<IAppWeb3Context['addToken']>(
    async (token: AddTokenParams, type = 'ERC20') => {
      try {
        await connector?.provider?.request({
          method: 'wallet_watchAsset',
          params: { type, options: token },
        });
      } catch (err) {
        console.log('addToken', err);
      }
    },
    [connector?.provider],
  );

  const changeNetwork = useCallback<IAppWeb3Context['changeNetwork']>(
    async (nextChainId) => {
      const conn = connection && _.get(ConnectionMappings, [connection], undefined);

      if (!conn || !nextChainId) return;

      return await _activate(conn, nextChainId);
    },
    [connection, _activate],
  );

  const unsupportedNetwork = wrongNetwork;

  return (
    <AppWeb3Context.Provider
      value={{
        connector,
        provider,
        account,
        chainId,
        error,
        unsupportedNetwork,
        connect,
        disconnect,
        changeNetwork,
        addToken,
      }}>
      {children}
    </AppWeb3Context.Provider>
  );
};
