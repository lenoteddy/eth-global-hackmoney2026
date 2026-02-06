import { useEffect, useState } from "react";
import { ConnectKitButton } from "connectkit";
import { isAddress, type Address } from "viem";
import { useConnection } from "wagmi";
import { getWalletClient } from "wagmi/actions";
import { useDebounce } from "./hooks/useDebouncer";
import StringHelper from "./helpers/StringHelper";
import { chainList, wagmiConfig } from "./helpers/Web3Config";
import { checkLiFiTransaction, executeLiFiContractCalls, getTokenBalance } from "./helpers/Web3Helper";
import SelectInput, { type Option } from "./components/SelectInput";
import AmountInput from "./components/AmountInput";
import { AddressInput } from "./components/AddressInput";
import TxInfo, { type TxInfoProps } from "./components/TxInfo";
import data from "./constants/chain-data.json";
import Logo from "./assets/logo.png";
import LogoETHGlobal from "./assets/partner-eth-global.svg";
import LogoLIFI from "./assets/partner-lifi.svg";
import LogoENS from "./assets/partner-ens.svg";
import LogoAave from "./assets/partner-aave.svg";

function App() {
	const { address, chainId, isConnected } = useConnection();
	const [menu, setMenu] = useState<string>("CONFIRM");
	const [sourceChain, setSourceChain] = useState<Option | null>(null);
	const [sourceToken, setSourceToken] = useState<Option | null>(null);
	const [destinationChain, setDestinationChain] = useState<Option | null>(null);
	const [destinationToken, setDestinationToken] = useState<Option | null>(null);
	const [amounts, setAmounts] = useState({ source: "0", destination: "0" });
	const [protocol, setProtocol] = useState<string>("aave");
	const [sameReceiver, setSameReceiver] = useState<boolean>(true);
	const [receiverAddress, setReceiverAddress] = useState<string>("");
	const [sourceBalance, setSourceBalance] = useState<string>("...");
	const [txError, setTxError] = useState<string | null>(null);
	const [searchTxHash, setSearchTxHash] = useState<string>("");
	const [searchTxData, setSearchTxData] = useState<TxInfoProps | null>(null);
	const [searchTxError, setSearchTxError] = useState<string | null>(null);

	const protocolList = () => {
		/* const list = destinationChain ? data[destinationChain as keyof typeof data].protocols : [];
		const newList = list.map((val) => ({
			...val,
			icon: <img src={val.icon} alt="" />,
		}));
		return newList; */
		// Set "Aave Protocol" as default, in the future can make it dynamic if it supports more protocol
		const list = [{ label: "Aave", value: "aave", icon: <img src={"https://cryptologos.cc/logos/aave-aave-logo.png"} alt="" /> }];
		return list;
	};
	const sourceTokenList = () => {
		const list = sourceChain ? data[sourceChain.value as keyof typeof data].tokens : [];
		const newList = list.map((val) => ({
			...val,
			icon: <img src={val.icon} alt="" />,
		}));
		return newList;
	};
	const destinationTokenList = () => {
		const list = destinationChain ? data[destinationChain.value as keyof typeof data].aave.tokens : [];
		const newList = list.map((val) => ({
			...val,
			icon: <img src={val.icon} alt="" />,
		}));
		return newList;
	};
	const handleAmountChange = (key: string, value: string) => {
		setAmounts((prev) => ({
			source: key === "source" ? value : value ? "0" : prev.source,
			destination: key === "destination" ? value : value ? "0" : prev.destination,
		}));
	};
	const switchChain = async () => {
		const client = await getWalletClient(wagmiConfig);
		await client.switchChain({ id: Number(sourceChain?.value) });
	};
	const submitTx = async () => {
		setTxError(null);

		if (!sourceChain || !destinationChain || !sourceToken || !destinationToken) {
			alert("Please choose network & token from source chain and destination chain!");
			return;
		}

		if (Number(amounts.source) <= 0 && Number(amounts.destination) <= 0) {
			alert("Please complete the inputs!");
			return;
		}

		const fromTokenData = data[sourceChain.value as keyof typeof data].tokens.find((item: { label: string; value: string; icon: string; decimals: number }) => item.value === sourceToken.value);
		const toTokenData = data[destinationChain.value as keyof typeof data].aave.tokens.find(
			(item: { label: string; value: string; icon: string; decimals: number; underlying: string }) => item.value === destinationToken.value,
		);
		const fromAmount = Number(amounts.source) * 10 ** Number(fromTokenData?.decimals);
		const toAmount = Number(amounts.destination) * 10 ** Number(toTokenData?.decimals);
		const toAddress = isAddress(receiverAddress) ? receiverAddress : address;

		const result = await executeLiFiContractCalls({
			fromAddress: String(address),
			toAddress: String(toAddress),
			fromChain: String(sourceChain.value),
			toChain: String(destinationChain.value),
			fromToken: String(sourceToken.value),
			toToken: String(toTokenData?.underlying),
			fromAmount: String(fromAmount),
			toAmount: String(toAmount),
			protocol: protocol,
		});

		if (result.status === "error") {
			setTxError(result.message || "Transaction error, please try again later.");
			return;
		}
	};

	useEffect(() => {
		if (!address || !sourceToken || !sourceChain) return;
		getTokenBalance(address, sourceToken.value as Address, Number(sourceChain.value)).then(setSourceBalance);
	}, [address, sourceToken, sourceChain]);

	const debounceSearchTxHash = useDebounce(searchTxHash, 500);
	useEffect(() => {
		if (!/^0x([A-Fa-f0-9]{64})$/.test(debounceSearchTxHash)) return;

		const loadData = async () => {
			try {
				const data = await checkLiFiTransaction({ txHash: debounceSearchTxHash });
				if (data.transactionId) {
					setSearchTxData(data);
					setSearchTxError(null);
				} else {
					setSearchTxData(null);
					setSearchTxError(data.message || "Transaction not found");
				}
			} catch (err) {
				console.error(err);
			}
		};
		loadData();
	}, [debounceSearchTxHash]);

	return (
		<div className="container">
			<header>
				<div className="py-4 flex items-center justify-between gap-x-6">
					<div>
						<a href="#" className="flex items-center">
							<img src={Logo} alt="logo" className="w-28" />
							<div className="ml-1">
								<h1 className="text-xl leading-5 font-semibold">OmniDeposit</h1>
								<p className="text-xs leading-5 font-light">Cross-Chain Deposits, Simplified.</p>
							</div>
						</a>
					</div>
					<div>
						<ConnectKitButton.Custom>
							{({ show, isConnected, address }) => {
								return (
									<button className="border-2 py-2 px-4 rounded-xl text-sm font-semibold bg-black text-white cursor-pointer" onClick={show}>
										{isConnected && address ? StringHelper.shortHex(address) : "Connect Wallet"}
									</button>
								);
							}}
						</ConnectKitButton.Custom>
					</div>
				</div>
			</header>
			<main>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="border rounded-lg p-4 shadow-[.3rem_.3rem_0_0_#000000]">
						<h2 className="text-lg font-semibold">📤 Source Chain</h2>
						<div className="mt-4">
							<div className="mb-2 relative z-20">
								<label className="font-semibold">Source network</label>
								<SelectInput
									placeholder="Choose a network"
									options={chainList}
									value={sourceChain?.value}
									onChange={(option) => {
										setSourceChain(option);
										setSourceToken(null);
									}}
								/>
							</div>
							<div className="mb-2 relative z-10">
								<label className="font-semibold">Source token</label>
								<SelectInput placeholder="Choose a token" options={sourceTokenList()} value={sourceToken?.value} onChange={(option) => setSourceToken(option)} />
							</div>
							<div className="mb-2">
								<label className="font-semibold">You send</label>
								<AmountInput max={sourceBalance} value={amounts.source} onChange={(v) => handleAmountChange("source", v)} />
								<div className="text-sm font-semibold">Wallet Balance: {sourceBalance}</div>
								<p className="text-sm italic">*enter either amount. The other will be calculated automatically.</p>
							</div>
						</div>
					</div>
					<div className="border rounded-lg p-4 shadow-[.3rem_.3rem_0_0_#000000]">
						<h2 className="text-lg font-semibold">📥 Destination Chain</h2>
						<div className="mt-4">
							<div className="mb-2 relative z-20">
								<label className="font-semibold">Destination network</label>
								<SelectInput
									placeholder="Choose a network"
									options={chainList}
									value={destinationChain?.value}
									onChange={(option) => {
										setDestinationChain(option);
										setDestinationToken(null);
									}}
								/>
							</div>
							<div className="mb-2 flex items-center gap-x-2">
								<div className="relative z-10 w-60">
									<label className="font-semibold">DeFi Protocol</label>
									<SelectInput placeholder="Protocol" options={protocolList()} value={protocol} onChange={(option) => setProtocol(option.value)} />
								</div>
								<div className="relative z-10 w-full">
									<label className="font-semibold">Destination token</label>
									<SelectInput placeholder="Choose a token" options={destinationTokenList()} value={destinationToken?.value} onChange={(option) => setDestinationToken(option)} />
								</div>
							</div>
							<div className="mb-2">
								<label className="font-semibold">You receive (estimated)</label>
								<AmountInput value={amounts.destination} onChange={(v) => handleAmountChange("destination", v)} />
								<p className="text-sm italic">*enter either amount. The other will be calculated automatically.</p>
							</div>
							<div className="mb-2">
								<div className="mb-1 flex items-center justify-between">
									<label className="font-semibold">Destination address</label>
									<button
										className={"px-3 py-1 text-sm rounded-lg font-medium transition " + (sameReceiver ? "bg-gray-100 text-gray-700" : "bg-black text-white")}
										onClick={() => {
											setSameReceiver(!sameReceiver);
											setReceiverAddress("");
										}}
									>
										{sameReceiver ? "Use Different Address" : "Use Wallet Address"}
									</button>
								</div>
								{sameReceiver ? (
									<div className="w-full h-10 flex items-center justify-between rounded-xl border border-gray-300 bg-gray-100 px-4 py-2 shadow-sm text-sm hover:border-black focus:outline-none focus:ring-1 focus:ring-black transition">
										{address}
									</div>
								) : (
									<AddressInput network={destinationChain?.value ? Number(destinationChain?.value) : 1} value={receiverAddress} onChange={setReceiverAddress} />
								)}
							</div>
						</div>
					</div>
				</div>
				<div className="mt-4">
					<div className="-mb-px">
						<button
							className={
								"-mr-[0.5px] py-2 px-4 border border-black rounded-xl rounded-b-none rounded-r-none text-sm font-semibold cursor-pointer " +
								(menu === "CONFIRM" ? "bg-black text-white" : "bg-white text-black")
							}
							onClick={() => setMenu("CONFIRM")}
						>
							CONFIRM
						</button>
						<button
							className={
								"-ml-[0.5px] py-2 px-4 border border-black rounded-xl rounded-b-none rounded-l-none text-sm font-semibold cursor-pointer " +
								(menu === "HISTORY" ? "bg-black text-white" : "bg-white text-black")
							}
							onClick={() => setMenu("HISTORY")}
						>
							HISTORY
						</button>
					</div>
					<div className="border rounded-tl-none rounded-lg p-4 shadow-[.3rem_.3rem_0_0_#000000]">
						{!isConnected && (
							<div className="p-8 text-center">
								<div className="text-lg font-semibold">Please connect your wallet</div>
								<ConnectKitButton.Custom>
									{({ show, isConnected, address }) => {
										return (
											<button className="border-2 py-2 px-4 rounded-xl text-sm font-semibold bg-black text-white cursor-pointer" onClick={show}>
												{isConnected && address ? StringHelper.shortHex(address) : "Connect Wallet"}
											</button>
										);
									}}
								</ConnectKitButton.Custom>
							</div>
						)}
						{isConnected && menu === "CONFIRM" && (
							<div>
								<h3 className="mb-2 text-xl font-semibold">Confirm Transaction</h3>
								{!sourceChain || !destinationChain || !sourceToken || !destinationToken || (Number(amounts.source) <= 0 && Number(amounts.destination) <= 0) ? (
									<div className="my-4 text-center font-semibold">Please fill in the input on source chain and destination chain!</div>
								) : (
									<>
										<div className="leading-8">
											You are about to bridge
											<span className="mx-1 px-1 border rounded-lg inline-flex items-center align-middle">
												<div className="w-6 h-6">{sourceToken?.icon}</div>
												{Number(amounts?.source) > 0 && <div className="ml-1 font-bold">{StringHelper.numberFormat(amounts?.source)}</div>}
												<div className="ml-1">{sourceToken?.label}</div>
											</span>
											from
											<span className="mx-1 px-1 border rounded-lg inline-flex items-center align-middle">
												<div className="w-6 h-6">{sourceChain?.icon}</div>
												<div className="ml-1">{sourceChain?.label}</div>
											</span>
											to
											<span className="mx-1 px-1 border rounded-lg inline-flex items-center align-middle">
												<div className="w-6 h-6">{destinationChain?.icon}</div>
												<div className="ml-1">{destinationChain?.label}</div>
											</span>
											and deposit it into
											<span className="mx-1 px-1 border rounded-lg inline-flex items-center align-middle">
												<div className="w-6 h-6">
													<img src="https://cryptologos.cc/logos/aave-aave-logo.png" />
												</div>
												<div className="ml-1">Aave</div>
											</span>
											and receive
											{Number(amounts?.destination) > 0 && <span className="px-1">(estimated)</span>}
											<span className="mx-1 px-1 border rounded-lg inline-flex items-center align-middle">
												<div className="w-6 h-6">{destinationToken?.icon}</div>
												{Number(amounts?.destination) > 0 && <div className="ml-1 font-bold">{StringHelper.numberFormat(amounts?.destination)}</div>}
												<div className="ml-1">{destinationToken?.label}</div>
											</span>
											in return.
										</div>
										<div className="mt-2 flex items-center">
											<div className="font-semibold mr-1">Receiver Address:</div>
											<div className="py-1 px-2 border rounded-lg">{isAddress(receiverAddress) ? receiverAddress : address}</div>
										</div>
										<div className="mt-2 text-center">
											{txError && <p className="text-sm text-red-500 font-medium italic mb-1">{txError}</p>}
											<button
												className="min-w-50 border-2 py-2 px-4 rounded-xl font-semibold bg-black text-white cursor-pointer"
												onClick={Number(sourceChain.value) != Number(chainId) ? switchChain : submitTx}
											>
												{Number(sourceChain.value) != Number(chainId) ? "Switch Chain" : "Submit Transaction"}
											</button>
										</div>
									</>
								)}
							</div>
						)}
						{isConnected && menu === "HISTORY" && (
							<div>
								<div className="mb-2">
									<h3 className="mb-2 text-xl font-semibold">Check Transaction</h3>
									<input
										value={searchTxHash}
										onChange={(e) => setSearchTxHash(e.target.value)}
										placeholder="0x..."
										className="w-full flex items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-2 shadow-sm hover:border-black focus:outline-none focus:ring-1 focus:ring-black transition"
									/>
									{searchTxError && <p className="text-sm text-red-500 font-medium italic">{searchTxError}</p>}
								</div>
								{searchTxData && (
									<div className="fade-in">
										<TxInfo {...searchTxData} />
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</main>
			<footer className="border-t border-gray-200 mt-8">
				<div className="max-w-6xl mx-auto p-6">
					<div className="mb-8">
						<h2 className="text-xl font-semibold">OmniDeposit</h2>
						<p className="mt-3 text-sm text-gray-600 max-w-xl leading-relaxed">
							Seamlessly deposit assets from a source chain into DeFi protocols on a destination chain — abstracting bridging and deposit into a single flow.
						</p>
					</div>
					<div className="mb-8">
						<h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6">Core Integrations</h3>
						<div className="flex items-center gap-10 opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition">
							<img src={LogoLIFI} alt="LI.FI" className="h-8" />
							<img src={LogoENS} alt="ENS" className="h-8" />
							<img src={LogoAave} alt="Aave" className="h-5" />
						</div>
					</div>
					<div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between text-xs text-gray-500">
						<span className="flex items-center">
							<div>Built for</div>
							<img src={LogoETHGlobal} alt="ETH Global" className="h-4 mx-1" />
							<div>- HackMoney 2026</div>
						</span>
						<span>© {new Date().getFullYear()} OmniDeposit</span>
					</div>
				</div>
			</footer>
		</div>
	);
}

export default App;
