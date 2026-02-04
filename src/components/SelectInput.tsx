import { useState, type ReactNode } from "react";

interface Option {
	label: string;
	value: string;
	icon: ReactNode;
}

export default function SelectInput({ placeholder, options, value, onChange }: { placeholder: string; options: Option[]; value: string | null; onChange?: (option: Option) => void }) {
	const selected = options.find((o) => o.value === value) || null;
	const [open, setOpen] = useState(false);
	const toggle = () => setOpen((o) => !o);
	const choose = (option: Option) => {
		onChange?.(option);
		setOpen(false);
	};

	return (
		<div className="relative">
			<button
				onClick={toggle}
				className="w-full flex items-center justify-between rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm shadow-sm hover:border-black focus:outline-none focus:ring-1 focus:ring-black"
			>
				{selected ? (
					<div className="flex items-center gap-2">
						{selected.icon && <span className="w-5 h-5 flex items-center justify-center">{selected.icon}</span>}
						<span>{selected.label}</span>
					</div>
				) : (
					<span className="text-gray-400">{placeholder}</span>
				)}
				<svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-500 ${open ? "rotate-180" : "rotate-0"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
					<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
				</svg>
			</button>
			{open && (
				<div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border bg-white shadow-lg">
					{options.map((option) => (
						<button key={option.value} onClick={() => choose(option)} className="flex w-full items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100">
							{option.icon && <span className="w-6 h-6 flex items-center justify-center">{option.icon}</span>}
							<span>{option.label}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
