import { useState } from "react";

type Props = {
	value?: string;
	onChange?: (raw: string) => void;
	placeholder?: string;
};

export default function AmountInput({ value = "", onChange, placeholder }: Props) {
	const [display, setDisplay] = useState(format(value));

	function format(val: string) {
		if (!val) return "";
		const [int, dec] = val.split(".");
		const intFormatted = Number(int).toLocaleString();
		return dec !== undefined ? `${intFormatted}.${dec}` : intFormatted;
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const input = e.target.value;

		// allow only digits + optional decimal
		const cleaned = input.replace(/[^0-9.]/g, "");
		const parts = cleaned.split(".");

		// prevent multiple decimals
		if (parts.length > 2) return;

		setDisplay(format(cleaned));
		onChange?.(cleaned);
	}

	return (
		<input
			type="text"
			inputMode="decimal"
			value={display}
			onChange={handleChange}
			placeholder={placeholder ?? "0.00"}
			className="w-full flex items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-2 shadow-sm hover:border-black focus:outline-none focus:ring-1 focus:ring-black text-right"
		/>
	);
}
