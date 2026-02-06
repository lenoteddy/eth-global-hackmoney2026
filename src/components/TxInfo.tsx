import { ChainIcon } from "connectkit";
import { formatUnits } from "viem";
import { useChains } from "wagmi";
import StringHelper from "../helpers/StringHelper";

export type TxInfoProps = null | {
	sending: {
		chainId: number;
		token: {
			logoURI: string | undefined;
			name: string | undefined;
			decimals: number;
			symbol: string | undefined;
		};
		amount: string | number | bigint | boolean;
		gasToken: {
			logoURI: string | undefined;
			name: string | undefined;
			decimals: number;
			symbol: string | undefined;
		};
		gasAmount: string | number | bigint | boolean;
		timestamp: number;
		txLink: string | URL | undefined;
		txHash: string;
	};
	fromAddress: string;
	receiving: {
		chainId: number;
		token: {
			logoURI: string | undefined;
			name: string | undefined;
			decimals: number;
			symbol: string | undefined;
		};
		amount: string | number | bigint | boolean;
		gasToken: {
			logoURI: string | undefined;
			name: string | undefined;
			decimals: number;
			symbol: string | undefined;
		};
		gasAmount: bigint;
		timestamp: number;
		txLink: string | URL | undefined;
		txHash: string;
	};
	toAddress: string;
	status: string;
};

export default function TxInfo(txData: TxInfoProps) {
	const chains = useChains();
	const chainName = (chainId: number) => {
		return chains.find((c) => c.id === chainId)?.name ?? "Unknown";
	};
	const getStatusBridge = () => {
		switch (txData?.status) {
			case "NOT_FOUND":
				return {
					text: "Transaction not found.",
					className: "text-red-500",
				};
			case "INVALID":
				return {
					text: "Transaction invalid!",
					className: "text-red-500",
				};
			case "PENDING":
				return {
					text: "Transaction in progress...",
					className: "text-yellow-500",
				};
			case "DONE":
				return {
					text: "Transaction completed!",
					className: "text-green-500",
				};
			case "FAILED":
				return {
					text: "Transaction failed.",
					className: "text-red-500",
				};
			default:
				return {
					text: "Transaction in progress...",
					className: "text-yellow-500",
				};
		}
	};

	return (
		<div className="w-full rounded-2xl border border-zinc-800 p-6 shadow-xl">
			<div className="flex items-center justify-between">
				<div className="flex-1 flex flex-col items-start">
					<div className="flex items-center gap-3">
						<ChainIcon id={Number(txData?.sending?.chainId)} size={36} />
						<div>
							<p className="text-sm">From</p>
							<p className="text-lg font-medium">{chainName(Number(txData?.sending?.chainId))}</p>
						</div>
					</div>
					<div className="mt-4">
						<p className="mb-1 text-xs">You send</p>
						<div className="flex justify-start items-center font-semibold">
							<img src={txData?.sending?.token.logoURI} alt={txData?.sending?.token.name} className="w-8" />
							<div className="text-lg px-1">{txData?.sending ? formatUnits(BigInt(txData?.sending?.amount), txData?.sending?.token?.decimals) : ""}</div>
							<div>{txData?.sending?.token.symbol}</div>
						</div>
					</div>
					<div className="mt-4">
						<p className="mb-1 text-xs">Gas fee on source chain</p>
						<div className="flex justify-start items-center font-semibold">
							<img src={txData?.sending?.gasToken.logoURI} alt={txData?.sending?.gasToken.name} className="w-4" />
							<div className="text-xs px-1">{txData?.sending ? formatUnits(BigInt(txData?.sending?.gasAmount), txData?.sending?.gasToken.decimals) : ""}</div>
							<div className="text-xs">{txData?.sending?.gasToken.symbol}</div>
						</div>
					</div>
					<div className="mt-4">
						<p className="text-sm">{txData?.sending?.timestamp ? StringHelper.timestampFormat(txData?.sending?.timestamp) : ""}</p>
						<p className="text-sm text-gray-400">
							<span className="pr-1">Source Wallet:</span>
							<a
								href={txData?.sending?.txLink ? new URL(txData?.sending?.txLink).origin + "/address/" + txData?.fromAddress : ""}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-400 hover:underline"
							>
								{StringHelper.shortHex(txData?.fromAddress || "")}
							</a>
						</p>
						<p className="text-sm text-gray-400">
							<span className="pr-1">Transaction:</span>
							<a href={String(txData?.sending?.txLink)} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
								{StringHelper.shortHex(txData?.sending?.txHash || "")}
							</a>
						</p>
					</div>
				</div>
				<div className="w-60 flex flex-col items-center px-8">
					<div className="relative w-full h-8 flex items-center overflow-hidden">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full h-0.5 bg-zinc-700" />
						</div>
						<div className="absolute arrow-move">
							<svg xmlns="http://www.w3.org/2000/svg" className={`w-8 h-8 ${getStatusBridge().className}`} viewBox="0 0 24 24" fill="currentColor">
								<path d="M13 5l7 7-7 7M5 12h14" />
							</svg>
						</div>
					</div>
					<div className={`mt-2 text-sm font-medium ${getStatusBridge().className}`}>{getStatusBridge().text}</div>
				</div>
				<div className="flex-1 flex flex-col items-end text-right">
					<div className="flex items-center gap-3">
						<div>
							<p className="text-sm">To</p>
							<p className="text-lg font-medium">{chainName(Number(txData?.receiving?.chainId))}</p>
						</div>
						<ChainIcon id={Number(txData?.receiving?.chainId)} size={36} />
					</div>
					<div className="mt-4">
						<p className="mb-1 text-xs">You Receive</p>
						<div className="flex justify-end items-center font-semibold">
							<img src={txData?.receiving?.token?.logoURI} alt={txData?.receiving?.token?.name || ""} className="w-8" />
							<div className="text-lg px-1">
								{txData?.receiving?.amount && txData?.receiving?.token?.decimals ? formatUnits(BigInt(txData?.receiving?.amount), txData?.receiving?.token?.decimals) : ""}
							</div>
							<div className="">{txData?.receiving?.token?.symbol || "..."}</div>
						</div>
					</div>
					<div className="mt-4">
						<p className="mb-1 text-xs">Gas fee on destination chain</p>
						<div className="flex justify-end items-center font-semibold">
							<img src={txData?.receiving?.gasToken?.logoURI} alt={txData?.receiving?.gasToken?.name} className="w-4" />
							<div className="text-xs px-1">
								{txData?.receiving?.gasAmount && txData?.receiving?.gasToken.decimals ? formatUnits(txData?.receiving?.gasAmount, txData?.receiving?.gasToken.decimals) : ""}
							</div>
							<div className="text-xs">{txData?.receiving?.gasToken?.symbol || "..."}</div>
						</div>
					</div>
					<div className="mt-4">
						<p className="text-sm">{txData?.receiving?.timestamp ? StringHelper.timestampFormat(txData?.receiving?.timestamp) : "..."}</p>
						<p className="text-sm text-gray-400">
							<span className="pr-1">Destination Wallet:</span>
							<a
								href={txData?.receiving?.txLink ? new URL(txData?.receiving?.txLink).origin + "/address/" + txData?.toAddress : ""}
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-400 hover:underline"
							>
								{StringHelper.shortHex(txData?.toAddress || "")}
							</a>
						</p>
						<p className="text-sm text-gray-400">
							<span className="pr-1">Transaction:</span>
							<a href={String(txData?.receiving?.txLink)} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
								{StringHelper.shortHex(txData?.receiving?.txHash || "")}
							</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
