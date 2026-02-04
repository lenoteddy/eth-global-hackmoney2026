import { ChainType, getChains } from "@lifi/sdk";
import { useSyncWagmiConfig } from "@lifi/wallet-management";
import { type FC, type PropsWithChildren } from "react";
import type { CreateConnectorFn } from "wagmi";
import { WagmiProvider } from "wagmi";
import { injected } from "wagmi/connectors";
import { useQuery } from "@tanstack/react-query";
import { config, wagmiConfig } from "./Web3Config";

const connectors: CreateConnectorFn[] = [injected()];

export const Web3Provider: FC<PropsWithChildren> = ({ children }) => {
	const { data: chains } = useQuery({
		queryKey: ["chains"] as const,
		queryFn: async () => {
			const chains = await getChains({ chainTypes: [ChainType.EVM] });
			config.chains = chains;
			return chains;
		},
	});
	useSyncWagmiConfig(wagmiConfig, connectors, chains);

	return (
		<WagmiProvider config={wagmiConfig} reconnectOnMount={false}>
			{children}
		</WagmiProvider>
	);
};
