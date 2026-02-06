import { useEffect, useState, useCallback } from "react";

const buildKey = (walletAddress: string) => `txs_${walletAddress?.toLowerCase()}`;

export const useTxStorage = (walletAddress: string) => {
	const [hashes, setHashes] = useState(() => {
		if (!walletAddress) return [];
		const key = buildKey(walletAddress);
		const stored = localStorage.getItem(key);
		if (!stored) return [];
		try {
			return JSON.parse(stored);
		} catch {
			console.warn("Corrupted tx storage");
			return [];
		}
	});

	// Add hash
	const addHash = useCallback(
		(hash: string) => {
			if (!walletAddress || !hash) return;
			setHashes((prev: string[]) => {
				if (prev.includes(hash)) return prev;
				const updated = [hash, ...prev].slice(0, 20);
				localStorage.setItem(buildKey(walletAddress), JSON.stringify(updated));
				return updated;
			});
		},
		[walletAddress],
	);

	// Clear all
	const clear = useCallback(() => {
		if (!walletAddress) return;
		localStorage.removeItem(buildKey(walletAddress));
		setHashes([]);
	}, [walletAddress]);

	useEffect(() => {
		if (!walletAddress) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setHashes([]);
			return;
		}

		const stored = localStorage.getItem(buildKey(walletAddress));

		if (!stored) {
			setHashes([]);
			return;
		}

		try {
			setHashes(JSON.parse(stored));
		} catch {
			console.warn("Corrupted tx storage");
			setHashes([]);
		}
	}, [walletAddress]);

	return {
		hashes,
		addHash,
		clear,
	};
};
