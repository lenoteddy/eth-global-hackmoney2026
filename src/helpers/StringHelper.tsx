const shortHex = (str: string) => {
	return str.slice(0, 6) + "..." + str.slice(-4);
};

const numberFormat = (val: string) => {
	if (!val) return "";
	const [int, dec] = val.split(".");
	const intFormatted = Number(int).toLocaleString();
	return dec !== undefined ? `${intFormatted}.${dec}` : intFormatted;
};

function timestampFormat(timestamp: number) {
	const date = new Date(timestamp * 1000);
	const datePart = new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		timeZone: "UTC",
	}).format(date);
	const timePart = new Intl.DateTimeFormat("en-GB", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
		timeZone: "UTC",
	}).format(date);
	return `${datePart} (${timePart} UTC)`;
}

const StringHelper = {
	shortHex,
	numberFormat,
	timestampFormat,
};

export default StringHelper;
