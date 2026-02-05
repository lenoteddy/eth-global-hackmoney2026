import { encodeFunctionData } from "viem";
import aaveABI from "../constants/aave-abi.json";
import { getContractCallsQuote, setTokenAllowance } from "@lifi/sdk";
import { getWalletClient } from "wagmi/actions";
import { wagmiConfig } from "./Web3Config";
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
	toContractGasLimit = "210000",
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
	const client = await getWalletClient(wagmiConfig);
	await client.switchChain({ id: Number(fromChain) });

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
};
