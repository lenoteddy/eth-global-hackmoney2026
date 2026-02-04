import Logo from "./assets/logo.png";

function App() {
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
						<button className="border-2 py-2 px-4 rounded-xl text-sm font-semibold bg-black text-white cursor-pointer">Connect Wallet</button>
					</div>
				</div>
			</header>
			<main></main>
			<footer></footer>
		</div>
	);
}

export default App;
