const shortHex = (str: string) => {
	return str.slice(0, 6) + "..." + str.slice(-4);
};

const numberFormat = (val: string) => {
	if (!val) return "";
	const [int, dec] = val.split(".");
	const intFormatted = Number(int).toLocaleString();
	return dec !== undefined ? `${intFormatted}.${dec}` : intFormatted;
};

const StringHelper = {
	shortHex,
	numberFormat,
};

export default StringHelper;
