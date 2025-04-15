import url from "node:url";

export default {
	webpack: {
		configure: {
			ignoreWarnings: [
				/Failed to parse source map/,
				{ module: /power-assert/ },
			],
			resolve: {
				fallback: {
					url:url,
				},
			},
		},
	},
	eslint: {
		enable: false,
	},
	devServer: {
		port: 3002,
	},
};
