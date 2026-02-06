import { useState, useEffect } from "react";
import { isAddress, getAddress } from "viem";
import { usePublicClient } from "wagmi";
import { getEnsAddress, getENSName } from "../helpers/Web3Helper";

type Props = {
	network: number;
	value: string;
	onChange: (value: string) => void;
};

export function AddressInput({ network = 1, value, onChange }: Props) {
	const publicClient = usePublicClient({ chainId: network });
	const [inputValue, setInputValue] = useState(value);
	const [resolvedAddress, setResolvedAddress] = useState<string | null>(null);
	const [ensName, setEnsName] = useState<string | null>(null);
	const [avatar, setAvatar] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// Debounce input
	useEffect(() => {
		async function resolveInput(val: string) {
			if (!val) {
				setResolvedAddress(null);
				setEnsName(null);
				setAvatar(null);
				setError("");
				return;
			}
			setLoading(true);
			setError("");
			setAvatar(null);
			setEnsName(null);
			setResolvedAddress(null);
			try {
				// 1️⃣ Direct address
				if (isAddress(val)) {
					const checksummed = getAddress(val);
					setResolvedAddress(checksummed);
					onChange(checksummed);
					// ENS reverse resolution
					const ensData = await getENSName(network, checksummed);
					if (ensData) {
						setEnsName(ensData.name);
						setAvatar(ensData.avatarUrl);
					}
					return;
				}
				// 2️⃣ ENS name
				if (val.endsWith(".eth")) {
					// ENS forward resolution
					const ensData = await getEnsAddress(network, val);
					if (!ensData || !ensData.address) {
						setError("ENS not found");
						return;
					}
					const checksummed = getAddress(ensData.address);
					setResolvedAddress(checksummed);
					setEnsName(val);
					onChange(checksummed);
					if (ensData.avatarUrl) setAvatar(ensData.avatarUrl);
					return;
				}
				setError("Invalid address or ENS");
			} catch {
				setError("Failed to resolve ENS name. Make sure it exists on the selected network.");
			} finally {
				setLoading(false);
			}
		}
		const timeout = setTimeout(() => {
			resolveInput(inputValue);
		}, 400);
		return () => clearTimeout(timeout);
	}, [network, inputValue, publicClient, onChange]);

	return (
		<div className="space-y-2">
			<div className="relative">
				<input
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value.trim())}
					placeholder="0x... or vitalik.eth"
					className={`w-full flex items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-2 shadow-sm text-sm hover:border-black focus:outline-none focus:ring-1 focus:ring-black transition ${error ? "border-red-500" : "border-gray-300"}`}
				/>
				{avatar && <img src={avatar} alt="ENS avatar" className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full" />}
			</div>
			<p className="-mt-2 text-sm italic">*supports wallet addresses and ENS names.</p>
			{loading && <p className="text-xs text-gray-500">Resolving...</p>}
			{resolvedAddress && !error && (
				<div className="text-xs text-green-600">
					{ensName && (
						<>
							<div>{ensName}</div>
							<div>{resolvedAddress}</div>
						</>
					)}
				</div>
			)}
			{error && <p className="text-xs text-red-500">{error}</p>}
		</div>
	);
}
