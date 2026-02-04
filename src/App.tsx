import { useState } from "react";
import { ConnectKitButton } from "connectkit";
import StringHelper from "./helpers/StringHelper";
import { chainList } from "./helpers/Web3Config";
import SelectInput from "./components/SelectInput";
import AmountInput from "./components/AmountInput";
import data from "./constants/chain-data.json";
import Logo from "./assets/logo.png";

function App() {
	const [sourceChain, setSourceChain] = useState<string | null>(null);
	const [sourceToken, setSourceToken] = useState<string | null>(null);
	const [destinationChain, setDestinationChain] = useState<string | null>(null);
	const [destinationToken, setDestinationToken] = useState<string | null>(null);
	const [amounts, setAmounts] = useState({ source: "0", destination: "0" });
	const [protocol, setProtocol] = useState<string>("aave");
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
		const list = sourceChain ? data[sourceChain as keyof typeof data].tokens : [];
		const newList = list.map((val) => ({
			...val,
			icon: <img src={val.icon} alt="" />,
		}));
		return newList;
	};
	const destinationTokenList = () => {
		const list = destinationChain ? data[destinationChain as keyof typeof data].aave.tokens : [];
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
								<SelectInput placeholder="Choose a network" options={chainList} value={sourceChain} onChange={(option) => setSourceChain(option.value)} />
							</div>
							<div className="mb-2 relative z-10">
								<label className="font-semibold">Source token</label>
								<SelectInput placeholder="Choose a token" options={sourceTokenList()} value={sourceToken} onChange={(option) => setSourceToken(option.value)} />
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
								<SelectInput placeholder="Choose a network" options={chainList} value={destinationChain} onChange={(option) => setDestinationChain(option.value)} />
							</div>
							<div className="mb-2 flex items-center gap-x-2">
								<div className="relative z-10 w-60">
									<label className="font-semibold">DeFi Protocol</label>
									<SelectInput placeholder="Protocol" options={protocolList()} value={protocol} onChange={(option) => setProtocol(option.value)} />
								</div>
								<div className="relative z-10 w-full">
									<label className="font-semibold">Destination token</label>
									<SelectInput placeholder="Choose a token" options={destinationTokenList()} value={destinationToken} onChange={(option) => setDestinationToken(option.value)} />
								</div>
							</div>
							<div className="mb-2">
								<label className="font-semibold">You receive (estimated)</label>
								<AmountInput value={amounts.destination} onChange={(v) => handleAmountChange("destination", v)} />
								<p className="text-sm italic">*enter either amount. The other will be calculated automatically.</p>
							</div>
						</div>
					</div>
				</div>
			</main>
			<footer></footer>
		</div>
	);
}

export default App;
