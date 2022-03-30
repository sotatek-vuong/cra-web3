import { ERC20Contract, generateContract, fallbackProvider } from 'src/utils/web3';
import { useEffect, useState } from 'react';
import { useAppWeb3 } from './useAppWeb3';

export function useContract<T>(abiName: string, addressOrIns?: string | T) {
  const { connector, provider, account } = useAppWeb3();

  const [contract, setContract] = useState<T>();

  useEffect(() => {
    if (!addressOrIns) return;

    if (typeof addressOrIns === 'string') {
      generateContract<T>(
        abiName,
        addressOrIns,
        // @ts-ignore
        provider ?? fallbackProvider,
        account,
      ).then((inst) => {
        setContract(inst);
      });
    } else {
      setContract(addressOrIns);
    }
  }, [abiName, addressOrIns, account, provider, connector]);

  return contract;
}

export type AddressOrERC20 = string | ERC20Contract;
export const useERC20Contract = (address?: AddressOrERC20) =>
  useContract<ERC20Contract>('ERC20', address);
