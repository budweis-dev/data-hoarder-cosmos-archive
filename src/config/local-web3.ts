
// Local development configuration for Hardhat network
export const LOCAL_HARDHAT_CONFIG = {
  CHAIN_ID: 1337,
  RPC_URL: 'http://127.0.0.1:8545',
  NETWORK_NAME: 'Hardhat Local',
};

// Function to switch to local Hardhat network
export const switchToLocalHardhat = async (): Promise<void> => {
  if (!window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${LOCAL_HARDHAT_CONFIG.CHAIN_ID.toString(16)}` }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${LOCAL_HARDHAT_CONFIG.CHAIN_ID.toString(16)}`,
              chainName: LOCAL_HARDHAT_CONFIG.NETWORK_NAME,
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: [LOCAL_HARDHAT_CONFIG.RPC_URL],
            },
          ],
        });
      } catch (addError) {
        throw new Error('Failed to add Hardhat network to MetaMask');
      }
    } else {
      throw new Error('Failed to switch to Hardhat network');
    }
  }
};
