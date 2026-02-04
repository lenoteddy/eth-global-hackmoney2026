import { EVM, createConfig } from "@lifi/sdk";
import { getWalletClient, switchChain } from "@wagmi/core";
import { createClient, http } from "viem";
import { arbitrum, mainnet, optimism } from "viem/chains";
import type { Config } from "wagmi";
import { createConfig as createWagmiConfig } from "wagmi";

export const wagmiConfig: Config = createWagmiConfig({
	chains: [mainnet, arbitrum, optimism],
	client({ chain }) {
		return createClient({ chain, transport: http() });
	},
});

export const config = createConfig({
	integrator: "OmniDeposit",
	providers: [
		EVM({
			getWalletClient: () => getWalletClient(wagmiConfig),
			switchChain: async (chainId) => {
				const chain = await switchChain(wagmiConfig, { chainId });
				return getWalletClient(wagmiConfig, { chainId: chain.id });
			},
		}),
	],
	// We disable chain preloading and will update chain configuration in runtime
	preloadChains: false,
});
