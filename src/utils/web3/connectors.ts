import { initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';
import { WalletConnect } from '@web3-react/walletconnect';
import { CHAINS, CHAIN_ID } from './chains';
import _ from 'lodash';
import { ethers } from 'ethers';

const type = localStorage.getItem('connection');

export const [metamask, metamaskHooks] = initializeConnector<MetaMask>(
  (actions) => new MetaMask(actions, type === 'metamask'),
  [CHAIN_ID],
);

const rpc: Record<number, string | string[]> = _.chain(CHAINS)
  .filter({ chainId: CHAIN_ID })
  .keyBy('chainId')
  .mapKeys((v, k) => Number(k))
  .mapValues('rpcUrls')
  .value();

export const [walletconnect, walletconnectHooks] = initializeConnector<WalletConnect>(
  (actions) =>
    new WalletConnect(
      actions,
      {
        rpc,
        qrcodeModalOptions: {
          desktopLinks: [],
          mobileLinks: [],
        },
      },
      type === 'walletconnect',
    ),
  _.map(CHAINS, 'chainId'),
);

// TODO: make this modular
export const fallbackProvider = new ethers.providers.JsonRpcProvider(rpc[CHAIN_ID][0], CHAIN_ID);
