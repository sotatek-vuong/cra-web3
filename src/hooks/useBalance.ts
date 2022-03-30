import { BigNumber } from 'ethers';
import { useEffect } from 'react';
import { useAsyncRetry } from 'react-use';
import { useAppWeb3 } from './useAppWeb3';
import { AddressOrERC20, useERC20Contract } from './useContract';
import BN from 'bignumber.js';

// if native, pass undefined as parameter
export const useBalance = (token?: AddressOrERC20) => {
  const { provider, account } = useAppWeb3();

  const erc20 = useERC20Contract(token);

  const {
    value: { decimals = 18, balance = 0 } = {},
    loading,
    retry: refresh,
  } = useAsyncRetry(async () => {
    if (!account || !provider) return;

    let wei: BigNumber;
    let decimals = 18;
    if (!erc20) {
      wei = await provider.getBalance(account);
    } else {
      [wei, decimals] = await Promise.all([erc20.balanceOf(account), erc20.decimals()]);
    }

    const balance = new BN(wei.toString()).div(10 ** decimals);

    return { balance, decimals };
  }, [account, provider, erc20]);

  useEffect(() => {
    if (!erc20 || !account) return;

    const MeTransferEvent = erc20.filters.Transfer(account, null);
    const TransferToMeEvent = erc20.filters.Transfer(null, account);

    if (erc20.listenerCount(MeTransferEvent) === 0) {
      erc20.on(MeTransferEvent, refresh);
    }

    if (erc20.listenerCount(TransferToMeEvent) === 0) {
      erc20.on(TransferToMeEvent, refresh);
    }

    return () => {
      erc20.removeAllListeners(MeTransferEvent);
      erc20.removeAllListeners(TransferToMeEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [erc20, account]);

  return { balance: new BN(balance), decimals, loading, refresh };
};
