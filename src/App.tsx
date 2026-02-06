import { useState } from "react";
import { ConnectKitButton } from "connectkit";
import { isAddress } from "viem";
import { useConnection } from "wagmi";
import StringHelper from "./helpers/StringHelper";
import { chainList, wagmiConfig } from "./helpers/Web3Config";
import { executeLiFiContractCalls } from "./helpers/Web3Helper";
import SelectInput, { type Option } from "./components/SelectInput";
import AmountInput from "./components/AmountInput";
import { AddressInput } from "./components/AddressInput";
import data from "./constants/chain-data.json";
import Logo from "./assets/logo.png";
import { getWalletClient } from "wagmi/actions";

function App() {
	const { address, chainId } = useConnection();
	const [menu, setMenu] = useState<string>("CONFIRM");
	const [sourceChain, setSourceChain] = useState<Option | null>(null);
	const [sourceToken, setSourceToken] = useState<Option | null>(null);
	const [destinationChain, setDestinationChain] = useState<Option | null>(null);
	const [destinationToken, setDestinationToken] = useState<Option | null>(null);
	const [amounts, setAmounts] = useState({ source: "0", destination: "0" });
	const [protocol, setProtocol] = useState<string>("aave");
	const [sameReceiver, setSameReceiver] = useState<boolean>(true);
	const [receiverAddress, setReceiverAddress] = useState<string>("");
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

		await executeLiFiContractCalls({
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
	};

	return (
		<div className="container">
			<header>
				<div className="py-4 flex items-center justify-between gap-x-6">
					<div>
						<a href="#" className="flex items-center">
							<img src={Logo} alt="logo" className="w-28" />
							<div className="ml-1">
								<h1 className="text-xl leading-5 font-semibold">Omni Deposit</h1>
								<p className="text-xs leading-5 font-light">Seamless Cross-Chain Asset Deposits</p>
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
								<SelectInput placeholder="Choose a network" options={chainList} value={sourceChain?.value} onChange={(option) => setSourceChain(option)} />
							</div>
							<div className="mb-2 relative z-10">
								<label className="font-semibold">Source token</label>
								<SelectInput placeholder="Choose a token" options={sourceTokenList()} value={sourceToken?.value} onChange={(option) => setSourceToken(option)} />
							</div>
							<div className="mb-2">
								<label className="font-semibold">You send</label>
								<AmountInput value={amounts.source} onChange={(v) => handleAmountChange("source", v)} />
								<p className="text-sm italic">*enter either amount. The other will be calculated automatically.</p>
							</div>
						</div>
					</div>
					<div className="border rounded-lg p-4 shadow-[.3rem_.3rem_0_0_#000000]">
						<h2 className="text-lg font-semibold">📥 Destination Chain</h2>
						<div className="mt-4">
							<div className="mb-2 relative z-20">
								<label className="font-semibold">Destination network</label>
								<SelectInput placeholder="Choose a network" options={chainList} value={destinationChain?.value} onChange={(option) => setDestinationChain(option)} />
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
										className={"border-2 px-4 rounded-xl font-semibold cursor-pointer " + (sameReceiver ? "bg-white text-black" : "bg-black text-white")}
										onClick={() => {
											setSameReceiver(!sameReceiver);
											setReceiverAddress("");
										}}
									>
										Change
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
						{menu === "CONFIRM" && (
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
						{menu === "HISTORY" && (
							<div>
								<div></div>
							</div>
						)}
					</div>
				</div>
			</main>
			<footer></footer>
		</div>
	);
}

export default App;
