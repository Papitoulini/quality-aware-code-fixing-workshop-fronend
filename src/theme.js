import { createTheme } from "@mui/material/styles";
import { red, green, deepOrange, yellow } from "@mui/material/colors";

import colors from './colors.module.scss';

import { adjustColors, colorSuggestions } from "#utils";

const theme = createTheme({
	palette: {
		primary: {
			main: colors.primary,
			light: adjustColors(colors.primary, 100),
			dark: adjustColors(colors.primary, -80),
		},
		secondary: {
			main: colors.secondary || colorSuggestions.secondary,
			light: adjustColors(colors.secondary || colorSuggestions.secondary, 100),
			dark: adjustColors(colors.secondary || colorSuggestions.secondary, -80),
		},
		third: {
			main: colors.third || colorSuggestions.third,
			light: adjustColors(colors.third || colorSuggestions.third, 100),
			dark: adjustColors(colors.third || colorSuggestions.third, -80),
		},

		success: { main: colors.success },
		error: { main: colors.error },
		warning: { main: colors.warning },
		info: { main: colors.info },

		dark: { main: colors.dark },
		light: { main: colors.light },
		grey: {
			main: colors.grey,
			light: colors.greyLight,
			dark: colors.greyDark,
		},
		green: { main: colors.green },
		white: { main: "#ffffff" },

		epic: { main: "#ff484e" },
		red,
		green,
		deepOrange,
		yellow,
		grey: {
			dark: "#ccd9e2",
			light: "#dfeaf1",
			transparent: "#f2f7f9",
		},

		lowVulnerabilityWarning: { main: "#F8C706" },
		moderateVulnerabilityWarning: { main: "#FE8300" },
		highVulnerabilityWarning: { main: "#F8956C" },
		criticalVulnerabilityWarning: { main: "#C23400" },

	},
	tileShadow: "0px 0px 4px -1px rgba(0,0,0,0.2), 0px 0px 5px 0px rgba(0,0,0,0.14), 0px 0px 10px 0px rgba(0,0,0,0.12)",
	popUpsShadows: "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)",
	typography: {
		h6: {
			fontSize: "1.125rem",
		},
		fontFamily: "Commissioner, Helvetica, Arial, sans-serif",
	},
	shape: {
		borderRadius: 10,
	},
	components: {
		MuiButton: {
			defaultProps: {
				disableElevation: true,
			},
			styleOverrides: {
				outlined: {
					border: "1px solid",
				},
			},
		},
		MuiAutocomplete: {
			styleOverrides: {
				popper: {
					boxShadow: "0px 5px 5px -3px rgba(0,0,0,0.2), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)",
					borderRadius: "0.5rem",
				},
			},
		},
		MuiPaper: {
			defaultProps: {
				elevation: 0,
			},
		},
		MuiAppBar: {
			defaultProps: {
				elevation: 0,
			},
		},
	},
});

export default theme;
