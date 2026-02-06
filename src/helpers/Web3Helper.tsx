import axios from "axios";
import { getContractCallsQuote, setTokenAllowance } from "@lifi/sdk";
import { encodeFunctionData, erc20Abi, formatUnits } from "viem";
import type { Address } from "viem";
import { getPublicClient, getWalletClient } from "wagmi/actions";
import { wagmiConfig } from "./Web3Config";
import aaveABI from "../constants/aave-abi.json";
import data from "../constants/chain-data.json";

const getAaveSupplyCallData = ({ token, amount, receiver }: { token: string; amount: string; receiver: string }) => {
	const calldata = encodeFunctionData({
		abi: aaveABI,
		functionName: "supply",
		args: [token, amount, receiver, 0],
	});

	return calldata;
};

const constructContractCall = ({
	fromAmount,
	fromTokenAddress,
	toContractAddress,
	toContractCallData,
	toContractGasLimit = "500000",
}: {
	fromAmount: string;
	fromTokenAddress: string;
	toContractAddress: string;
	toContractCallData: string;
	toContractGasLimit?: string;
}) => {
	return [
		{
			fromAmount,
			fromTokenAddress,
			toContractAddress,
			toContractCallData,
			toContractGasLimit,
		},
	];
};

export const executeLiFiContractCalls = async ({
	fromAddress,
	toAddress,
	fromChain,
	toChain,
	fromToken,
	toToken,
	fromAmount,
	toAmount,
	protocol,
}: {
	fromAddress: string;
	toAddress: string;
	fromChain: string;
	toChain: string;
	fromToken: string;
	toToken: string;
	fromAmount: string;
	toAmount: string;
	protocol: string;
}) => {
	try {
		const client = await getWalletClient(wagmiConfig);

		// init protocol data
		const protocolData = data[toChain as keyof typeof data][protocol as keyof (typeof data)[keyof typeof data]];
		const protocolContract = typeof protocolData === "object" && protocolData !== null && "pool" in protocolData ? protocolData.pool : undefined;
		const protocolCalldata = getAaveSupplyCallData({ token: toToken, amount: Number(fromAmount) > 0 ? fromAmount : toAmount, receiver: toAddress });
		const protocolContractCalls = constructContractCall({
			fromAmount: Number(fromAmount) > 0 ? fromAmount : toAmount,
			fromTokenAddress: toToken,
			toContractAddress: String(protocolContract),
			toContractCallData: protocolCalldata,
		});

		// init li.fi contract call quote object
		const contractCallsQuoteRequest = {
			fromAddress,
			fromChain,
			toChain,
			fromToken,
			toToken,
			...(Number(fromAmount) > 0 ? { fromAmount } : { toAmount }),
			contractCalls: protocolContractCalls,
		};
		const contractCallQuote = await getContractCallsQuote(contractCallsQuoteRequest);
		console.log("Contract Calls Quote:", contractCallQuote);

		if (!contractCallQuote.transactionRequest) throw new Error("No transactionRequest");
		console.log(contractCallQuote.transactionRequest);

		await setTokenAllowance({
			walletClient: client,
			spenderAddress: contractCallQuote.estimate.approvalAddress,
			token: contractCallQuote.action.fromToken,
			amount: BigInt(contractCallQuote.action.fromAmount),
		});

		const tx = {
			to: contractCallQuote.transactionRequest.to?.startsWith("0x") ? (contractCallQuote.transactionRequest.to as `0x${string}`) : undefined,
			data: contractCallQuote.transactionRequest.data?.startsWith("0x") ? (contractCallQuote.transactionRequest.data as `0x${string}`) : undefined,
			value: BigInt(contractCallQuote.transactionRequest.value || "0"),
			chainId: fromChain,
		};
		const transaction = await client.sendTransaction(tx);
		console.log("Transaction:", transaction);

		return { status: "success", transactionHash: transaction };
	} catch (e) {
		console.error(e);
		return { status: "error", message: "Failed to execute transaction, please try again later." };
	}
};

export async function checkLiFiTransaction({ txHash }: { txHash: string }) {
	try {
		const { data } = await axios.get(`https://li.quest/v1/status?txHash=${txHash}`);
		return data;
	} catch (e) {
		console.error(e);
		return { status: "error", message: "Failed to fetch transaction status" };
	}
}

export async function getTokenBalance(userAddress: Address, tokenAddress: Address, chainId: number): Promise<string> {
	const publicClient = getPublicClient(wagmiConfig, { chainId });
	if (!publicClient) throw new Error("Failed to get public client");

	const [balance, decimals] = await Promise.all([
		publicClient.readContract({
			address: tokenAddress,
			abi: erc20Abi,
			functionName: "balanceOf",
			args: [userAddress],
		}),
		publicClient.readContract({
			address: tokenAddress,
			abi: erc20Abi,
			functionName: "decimals",
		}),
	]);
	return formatUnits(balance, decimals);
}
