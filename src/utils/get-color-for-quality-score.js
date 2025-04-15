const getColorForQualityScore = (n) => {
	if (typeof n !== "number" || Number.isNaN(n) || n <= 0) return "secondary.main";
	if (n <= 1) n *= 100;
	if (n < 33) return "red.700";
	if (n < 55) return "deepOrange.700";
	if (n < 80) return "yellow.700";
	return "green.700";
};

export default getColorForQualityScore;
