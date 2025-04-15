import level1 from "../assets/images/developer_characteristics/B-1.png";
import level2 from "../assets/images/developer_characteristics/B-2.png";
import level3 from "../assets/images/developer_characteristics/B-3.png";
import level4 from "../assets/images/developer_characteristics/B-4.png";
import level5 from "../assets/images/developer_characteristics/B-5.png";

const levelThresholds = [
	{ png: level1, threshHold: 10_000, startingColor: "#806954", endColor: "#4878A1" },
	{ png: level2, threshHold: 10_000, startingColor: "#4878A1", endColor: "#DE3E70" },
	{ png: level3, threshHold: 10_000, startingColor: "#DE3E70", endColor: "#6B7F8A" },
	{ png: level4, threshHold: 10_000, startingColor: "#6B7F8A", endColor: "#FCC200" },
	{ png: level5, threshHold: 10_000, startingColor: "#FCC200", endColor: "#FCC200" },
];

export default levelThresholds;