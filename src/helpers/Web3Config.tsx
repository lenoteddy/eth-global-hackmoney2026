import { EVM, createConfig } from "@lifi/sdk";
import { getWalletClient, switchChain } from "@wagmi/core";
import { ChainIcon } from "connectkit";
import { createClient, http } from "viem";
import { arbitrum, mainnet } from "viem/chains";
import type { Config } from "wagmi";
import { createConfig as createWagmiConfig } from "wagmi";

export const chainList = [
	{ label: mainnet.name, value: String(mainnet.id), icon: <ChainIcon id={mainnet.id} /> },
	{ label: arbitrum.name, value: String(arbitrum.id), icon: <ChainIcon id={arbitrum.id} /> },
];

export const wagmiConfig: Config = createWagmiConfig({
	chains: [mainnet, arbitrum],
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
