import { useEffect } from "react";
import useSWR from "swr";

const adminAddresses = {
  "0xbff557dc771d8d0582f460704b573f71d7069db8183708fe4fca1582620683c2": true,
};

export const handler = (web3, provider) => () => {
  const { data, mutate, ...rest } = useSWR(
    () => (web3 ? "web3/accounts" : null),
    async () => {
      const accounts = await web3.eth.getAccounts();
      const account = accounts[0];
      // console.log(web3.utils.keccak256(account));
      if (!account) {
        throw new Error(
          "Cannot retrieve and account. Please refresh the browser. "
        );
      }
      return account;
    }
  );

  useEffect(() => {
    const mutator = (accounts) => mutate(accounts[0] ?? null);
    provider?.on("accountsChanged", mutator);

    return () => {
      provider?.removeListener("accountsChanged", mutator);
    };
  }, [provider]);

  return {
    data,
    isAdmin: (data && adminAddresses[web3.utils.keccak256(data)]) ?? false,
    mutate,
    ...rest,
  };
};
