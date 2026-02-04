import { ConnectKitButton } from "connectkit";
import { chainList } from "./helpers/Web3Config";
import StringHelper from "./helpers/StringHelper";
import SelectInput from "./components/SelectInput";
import Logo from "./assets/logo.png";
import { useState } from "react";

function App() {
	const [sourceChain, setSourceChain] = useState<string | null>(null);
	const [destinationChain, setDestinationChain] = useState<string | null>(null);

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
							<div className="mb-2">
								<SelectInput placeholder="Choose a network" options={chainList} value={sourceChain} onChange={(option) => setSourceChain(option.value)} />
							</div>
						</div>
					</div>
					<div className="border rounded-lg p-4 shadow-[.3rem_.3rem_0_0_#000000]">
						<h2 className="text-lg font-semibold">📥 Destination Chain</h2>
						<div className="mt-4">
							<div className="mb-2">
								<SelectInput placeholder="Choose a network" options={chainList} value={destinationChain} onChange={(option) => setDestinationChain(option.value)} />
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
