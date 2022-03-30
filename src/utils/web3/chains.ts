import type { AddEthereumChainParameter } from '@web3-react/types';
import _ from 'lodash';

export function getAddChainParameters(
  chainId: number,
  padded0x = false,
): AddEthereumChainParameter | null {
  const chainInfo = _.find(CHAINS, { chainId });

  if (!chainInfo && process.env.NODE_ENV !== 'production') {
    console.warn('Dev: Unsupported network');
  }

  if (chainInfo) {
    return {
      ...chainInfo,
      // @ts-ignore
      chainId: padded0x ? `0x${Number(chainInfo.chainId).toString(16)}` : chainId,
    };
  }

  return null;
}
const ETH: AddEthereumChainParameter['nativeCurrency'] = {
  name: 'Ether',
  symbol: 'ETH',
  decimals: 18,
};

const MATIC: AddEthereumChainParameter['nativeCurrency'] = {
  name: 'Matic',
  symbol: 'MATIC',
  decimals: 18,
};

const BNB: AddEthereumChainParameter['nativeCurrency'] = {
  name: 'BNB',
  symbol: 'BNB',
  decimals: 18,
};

const INFURA_KEY = process.env.REACT_APP_INFURA_KEY;

export const CHAINS: AddEthereumChainParameter[] = [
  // ETH
  {
    chainId: 1,
    chainName: 'Mainnet',
    rpcUrls: _.compact([
      INFURA_KEY ? `https://mainnet.infura.io/v3/${INFURA_KEY}` : undefined,
      'https://cloudflare-eth.com',
    ]),
    nativeCurrency: ETH,
  },
  {
    chainId: 3,
    chainName: 'Ropsten',
    rpcUrls: _.compact([
      INFURA_KEY ? `https://ropsten.infura.io/v3/${INFURA_KEY}` : undefined,
      'https://cloudflare-eth.com',
    ]),
    nativeCurrency: ETH,
  },
  {
    chainId: 4,
    chainName: 'Rinkeby',
    rpcUrls: _.compact([INFURA_KEY ? `https://rinkeby.infura.io/v3/${INFURA_KEY}` : undefined]),
    nativeCurrency: ETH,
  },
  {
    chainId: 42,
    chainName: 'Kovan',
    rpcUrls: _.compact([INFURA_KEY ? `https://kovan.infura.io/v3/${INFURA_KEY}` : undefined]),
    nativeCurrency: ETH,
  },

  // BSC
  {
    chainName: 'BSC (Mainnet)',
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    chainId: 56,
    nativeCurrency: BNB,
    blockExplorerUrls: ['https://bscscan.com'],
  },
  {
    chainName: 'BSC (Testnet)',
    rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545'],
    chainId: 97,
    nativeCurrency: BNB,
    blockExplorerUrls: ['https://testnet.bscscan.com'],
  },

  // Polygon
  {
    chainName: 'Polygon Mainnet',
    chainId: 137,
    rpcUrls: _.compact([
      INFURA_KEY ? `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}` : undefined,
      'https://polygon-rpc.com',
    ]),
    nativeCurrency: MATIC,
    blockExplorerUrls: ['https://polygonscan.com'],
  },
  {
    chainId: 80001,
    rpcUrls: _.compact([
      INFURA_KEY ? `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}` : undefined,
      'https://rpc-mumbai.matic.today',
    ]),
    chainName: 'Polygon Mumbai',
    nativeCurrency: MATIC,
    blockExplorerUrls: ['https://mumbai.polygonscan.com'],
  },
];

export const CHAIN_ID = +(process.env.REACT_APP_CHAIN_ID || '97');
