import { memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { AppBar, Toolbar, Paper, Breadcrumbs, Box } from "@mui/material";

import { Home as HomeIcon } from "@mui/icons-material";
// import cycloptLogo from "../assets/images/cyclopt_logo_with_text_white.svg";
import IsselLogo from "../assets/images/Issel_Blue_Horizontal.svg";

import { Image } from "mui-image";

import { capitalize } from "#utils";

const styles = {
	grow: {
		flexBasis: "auto",
		elevation: 0,
	},
	sectionDesktop: {
		display: {
			xs: "none",
			md: "flex",
		},
	},
	sectionMobile: {
		display: {
			xs: "flex",
			md: "none",
		},
	},
	root: {
		width: "100%",
		px: 0,
		py: 1,
		borderRadius: "0px",
		bgcolor: "#ccd9e2",
	},
	icon: {
		mr: 0.5,
		width: 20,
		height: 20,
	},
	expanded: {
		bgcolor: "transparent",
	},
	innerSmallAvatar: {
		color: "common.black",
		fontSize: "inherit",
	},
	anchorOriginBottomRightCircular: {
		".MuiBadge-anchorOriginBottomRightCircular": {
			right: 0,
			bottom: 0,
		},
	},
	avatar: {
		width: "30px",
		height: "30px",
		background: "white",
	},
	iconButton: {
		p: "3px 6px",
	},
	menuItemButton: {
		width: "100%",
		bgcolor: "grey.light",
		"&:hover": {
			bgcolor: "grey.dark",
		},
	},
	menuItemCreateButton: {
		width: "100%",
		bgcolor: "secondary.main",
		"&:hover": {
			bgcolor: "secondary.main",
		},
	},
	grey: {
		color: "grey.500",
	},
};

const Header = () => {
	const location = useLocation();
	const CrumpLink = styled(Link)(({ theme }) => ({ display: "flex", color: theme.palette.primary.main }));

	const pathnames = location.pathname.split("/").filter(Boolean).map((res) => decodeURIComponent(res));
	const crumps = [];
	crumps.push(
		<CrumpLink to="/">
			<HomeIcon sx={styles.icon} />
			{"Home"}
		</CrumpLink>,
	);

	for (const [ind, path] of pathnames.entries()) {
		let text = "...";

		if ([
			"login",
			"question",
		].includes(path)) text = capitalize(path);
		else {
			switch (path) {

			case "getting-started": {
				text = "Getting Started";
				break;
			}

			default:
				// Do nothing
			}
		}

		const num = Number.parseInt(path, 10);
		if (!Number.isNaN(num)) { text = `#${num}`; }

		crumps.push(<CrumpLink to={`/${pathnames.slice(0, ind + 1).join("/")}`}>{text}</CrumpLink>);
	}

	return (
		<AppBar position="static" sx={styles.grow}>
			<Toolbar className="header-container" sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
				<Box component={Link} to="/">
					<Image src={IsselLogo} alt="Cyclopt" width="10rem" sx={{ my: 1, minWidth: "130px" }} />
				</Box>
				<Box sx={{ flexGrow: 1, flexBasis: "auto" }} />
				{/* <Tooltip  title="Log Out">
					<IconButton color="inherit" onClick={() => {
						// handleMenuClose();
						jwt.destroyTokens();
						cookie.remove("_cyclopt_selfhosted");
						navigate("/");
					}}
					><Logout /></IconButton>
				</Tooltip> */}
			</Toolbar>
			<Paper elevation={0} sx={styles.root}>
				<Box className="header-container" display="flex" flexDirection="row" alignItems="center" justifyContent="space-between">
					<Breadcrumbs>{crumps.map((e, ind) => <div key={`crump_${ind}`}>{e}</div>)}</Breadcrumbs>
				</Box>
			</Paper>
		</AppBar>
	);
};

export default memo(Header);
