import { useEffect, memo, useState } from "react";
import { styled } from "@mui/material/styles";
import { Grid, Box, Typography, Fab, Link, Zoom, TextField, Button, MenuItem, Menu, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Autocomplete, Divider } from "@mui/material";
import clsx from "clsx";
import { Send } from "@mui/icons-material";
import ReactGA from "react-ga";
import constructUrl from "@iamnapo/construct-url";
import { useLocation } from "react-router-dom";
import { LoadingButton } from "@mui/lab";
import queryString from "query-string";
import { Image } from "mui-image";
import cookie from "../utils/cookie.js";
import { retrieveSelfHostInfo } from "../api/index.js";
import { useSnackbar } from "../utils/index.js";
import cycloptLogo from "../assets/images/cyclopt.png";
import GitHub from "../assets/images/github.png";
import GitLab from "../assets/images/gitlab.png";
import BitBucket from "../assets/images/bitbucket.png";
import Azure from "../assets/images/azure.png";

const classes = {
	root: "SignIn-root",
	box: "SignIn-box",
	signIn: "SignIn-signIn",
	margin: "SignIn-margin",
	marginCyclopt: "SignIn-margin-cyclopt",
	extendedIcon: "SignIn-extendedIcon",
	boxGrid: "SignIn-boxGrid",
	noPad: "SignIn-noPad",
	subtitle: "SignIn-subtitle",
	subtitleDivider: "SignIn-subtitleDivider",
	link: "SignIn-link",
	paper: "SignIn-paper",
};

const StyledGrid = styled(Grid)(({ theme }) => ({
	[`&.${classes.root}`]: {
		margin: theme.spacing(0, -1),
		overflow: "hidden",
		width: "100vw",
		height: "100vh",
	},
	[`& .${classes.signIn}`]: {
		color: theme.palette.grey[700],
	},
	[`& .${classes.margin}`]: {
		margin: theme.spacing(1, 0),
		borderRadius: theme.shape.borderRadius,
		borderWidth: theme.spacing(0.3),
		borderStyle: "solid",
		borderColor: theme.palette.primary.main,
		backgroundColor: theme.palette.common.white,
		width: "90px",
		height: "90px",
	},
	[`& .${classes.marginCyclopt}`]: {
		margin: theme.spacing(1, 0),
		borderRadius: theme.shape.borderRadius,
		borderWidth: theme.spacing(0.3),
		borderStyle: "solid",
		borderColor: theme.palette.primary.main,
		backgroundColor: theme.palette.common.white,
		width: "270px",
		height: "45px",
	},
	[`& .${classes.extendedIcon}`]: {
		width: "100%",
	},
	[`& .${classes.boxGrid}`]: {
		marginTop: theme.spacing(1),
		marginBottom: theme.spacing(1),
	},

	[`& .${classes.noPad}`]: {
		padding: "0 !important",
	},

	[`& .${classes.subtitle}`]: {
		color: theme.palette.primary.main,
	},

	[`& .${classes.subtitleDivider}`]: {
		color: theme.palette.secondary.main,
	},
	[`& .${classes.link}`]: {
		"&:hover": {
			color: theme.palette.primary.dark,
		},
	},
	[`& .${classes.paper}`]: {
		backgroundColor: theme.palette.secondary.main,
		borderRadius: theme.shape.borderRadius,
		boxShadow: theme.shadows[6],
		margin: theme.spacing(1, 0),
	},
}));

const SignIn = () => {
	const { state, search } = useLocation();
	const [gitlabAnchorEl, setGitlabAnchorEl] = useState(null);
	const [selfGitlabDialogOpen, setSelfGitlabDialogOpen] = useState(false);
	const authURL = constructUrl(import.meta.env.VITE_MAIN_SERVER_URL, "api/oauth/login", { redirectTo: globalThis.location.href });
	const [url, setUrl] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const { error } = useSnackbar();

	useEffect(() => {
		try {
			sessionStorage.setItem("redirectTo", JSON.stringify(state?.from || { pathname: "/overview" }));
		} catch { /** */ }
	}, [state]);

	useEffect(() => {
		const { selfhost } = queryString.parse(search);
		if (selfhost) {
			setSelfGitlabDialogOpen(true);
			setUrl(selfhost);
		}
	}, [search]);

	return (
		<StyledGrid container direction="row" justifyContent="center" align="center" className={classes.root}>
			<Grid item md={3} />
			<Grid item container direction="column" justifyContent="center" align="center" md={6} spacing={4} m={-2} sx={{ "> .MuiGrid-item": { p: 2 } }}>
				<Grid item container alignItems="center" justifyContent="center" mt={4}>
					<Box sx={{ minWidth: "130px", width: "10%" }}>
						<Image src={cycloptLogo} alt="Cyclopt" />
					</Box>
					<Typography variant="h1" fontWeight="bold" color="common.black" ml={2}>{"cyclopt"}</Typography>
				</Grid>
				<Grid item><Typography variant="h4" className={classes.subtitle}>{"Software & Quality Management Tool"}</Typography></Grid>
				<Grid item container direction="row" justifyContent="center" align="center" className={classes.boxGrid}>
					<Grid item className={classes.noPad} xs={10} md={10}>
						<Grid container direction="column" justifyContent="center" alignItems="center">
							<Grid item py={2} bgcolor="white" width="fit-content" display="flex" alignItems="center"><Typography variant="h4" className={classes.signIn}>{"Sign In with:"}</Typography></Grid>
							<Grid item align="center" width="100%">
								<Grid container direction="row" justifyContent="space-around" maxWidth={600}>

									<Grid item>
										<Zoom in unmountOnExit timeout={700}>
											<Fab
												variant="extended"
												size="large"
												aria-label="Sign in with GitHub"
												title="Sign in with GitHub"
												className={classes.margin}
												component="a"
												href={`${authURL}&type=github`}
												target="_self"
												onClick={() => ReactGA.event({ category: "User", action: "Clicked \"Sign In\"" })}
											>
												<Box>
													<Image src={GitHub} alt="GitHub" width="100%" />
												</Box>
											</Fab>
										</Zoom>
										<Typography variant="h6" className={classes.subtitle}>{"GitHub"}</Typography>
									</Grid>
									<Grid item>
										<Zoom in unmountOnExit timeout={700}>
											<Fab
												variant="extended"
												size="large"
												aria-label="Sign in with Gitlab"
												title="Sign in with Gitlab"
												className={classes.margin}
												onClick={(e) => setGitlabAnchorEl(e.currentTarget)}
											>
												<Box>
													<Image src={GitLab} alt="GitLab" />
												</Box>
											</Fab>
										</Zoom>
										<Typography variant="h6" className={classes.subtitle}>{"GitLab"}</Typography>
										<Menu
											anchorEl={gitlabAnchorEl}
											open={Boolean(gitlabAnchorEl)}
											elevation={0}
											classes={{ paper: classes.paper }}
											anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
											transformOrigin={{ vertical: "top", horizontal: "center" }}
											onClose={() => setGitlabAnchorEl(null)}
										>
											<MenuItem onClick={() => setGitlabAnchorEl(null)}>
												<Typography
													component="a"
													href={`${authURL}&type=gitlab`}
													target="_self"
													sx={{ color: "common.black" }}
													onClick={() => ReactGA.event({ category: "User", action: "Clicked \"Sign In\"" })}
												>
													{"GitLab.com"}
												</Typography>
											</MenuItem>
											<MenuItem onClick={() => setGitlabAnchorEl(null)}>
												<Typography
													sx={{ color: "common.black" }}
													onClick={() => {
														setSelfGitlabDialogOpen(true);
														ReactGA.event({ category: "User", action: "Clicked \"Sign In\"" });
													}}
												>
													{"Self-hosted instance"}
												</Typography>
											</MenuItem>
										</Menu>
										<Dialog
											keepMounted
											open={selfGitlabDialogOpen}
											TransitionComponent={Zoom}
											onClose={() => {
												if (!isSubmitting) {
													setUrl("");
													setSelfGitlabDialogOpen(false);
												}
											}}
										>
											<form onSubmit={async (e) => {
												e.preventDefault();
												setIsSubmitting(true);
												try {
													const info = await retrieveSelfHostInfo(url);
													cookie.set("_cyclopt_selfhosted", info);
													setIsSubmitting(false);
													setSelfGitlabDialogOpen(false);
													localStorage.setItem(
														"recent-selfhosted-urls",
														JSON.stringify([...new Set([
															...(localStorage.getItem("recent-selfhosted-urls") || []),
															url,
														])]),
													);
													globalThis.location = `${authURL}&type=${info.type}`;
												} catch (error_) {
													setIsSubmitting(false);
													const { message } = await error_.response.json();
													error(message);
												}
											}}
											>
												<DialogTitle>
													{"Self-hosted GitLab Instance"}
												</DialogTitle>
												<DialogContent dividers>
													<DialogContentText>
														{"If you have a self-hosted GitLab instance that you know we support, enter it’s URL below:"}
													</DialogContentText>
													<Autocomplete
														selectOnFocus
														clearOnBlur
														freeSolo
														handleHomeEndKeys
														value={url}
														size="small"
														renderInput={(params) => (
															<TextField
																{...params}
																autoFocus
																fullWidth
																required
																margin="dense"
																id="url"
																label="Self-Hosted GitLab URL"
																placeholder="https://gitlab.example.com"
																type="url"
																value={url}
																onChange={((e) => setUrl(e.target.value))}
															/>
														)}
														options={
															(() => {
																try {
																	return JSON.parse(localStorage.getItem("recent-selfhosted-urls")) || [];
																} catch {
																	return [];
																}
															})()
														}
														onChange={(_, val) => setUrl(val || "")}
													/>
												</DialogContent>
												<DialogActions>
													<Button
														variant="outlined"
														type="reset"
														disabled={isSubmitting}
														onClick={() => {
															setSelfGitlabDialogOpen(false);
															setUrl("");
														}}
													>
														{"Cancel"}
													</Button>
													<LoadingButton
														autoFocus
														type="submit"
														disabled={!url}
														endIcon={<Send />}
														loading={isSubmitting}
														loadingPosition="end"
														variant="contained"
													>
														{"Submit"}
													</LoadingButton>
												</DialogActions>
											</form>
										</Dialog>
									</Grid>
									<Grid item>
										<Zoom in unmountOnExit timeout={700}>
											<Fab
												variant="extended"
												size="large"
												aria-label="Sign in with Azure"
												title="Sign in with Azure"
												className={classes.margin}
												component="a"
												href={`${authURL}&type=azure`}
												target="_self"
												onClick={() => ReactGA.event({ category: "User", action: "Clicked \"Sign In\"" })}
											>
												<Box>
													<Image src={Azure} alt="Azure" />
												</Box>
											</Fab>
										</Zoom>
										<Typography variant="h6" className={classes.subtitle}>{"Azure"}</Typography>
									</Grid>
									<Grid item>
										<Zoom in unmountOnExit timeout={700}>
											<Fab
												variant="extended"
												size="large"
												aria-label="Sign in with BitBucket"
												title="Sign in with BitBucket"
												className={classes.margin}
												component="a"
												href={`${authURL}&type=bitbucket`}
												target="_self"
												onClick={() => ReactGA.event({ category: "User", action: "Clicked \"Sign In\"" })}
											>
												<Box className={classes.logos}>
													<Image src={BitBucket} alt="BitBucket" />
												</Box>
											</Fab>
										</Zoom>
										<Typography variant="h6" className={classes.subtitle}>{"BitBucket"}</Typography>
									</Grid>
								</Grid>
								<Divider
									className={classes.signIn}
									sx={{
										m: 1.5,
										fontSize: (t) => t.spacing(2),
										width: 270,
										color: (t) => t.palette.grey[700],
										"&.MuiDivider-root": {
											"&::after": {
												borderColor: (t) => t.palette.grey[700],
											},
											"&::before": {
												borderColor: (t) => t.palette.grey[700],
											},
										},
									}}
								>
									{"OR"}

								</Divider>
								<Grid item>
									<Zoom in unmountOnExit timeout={700}>
										<Fab
											variant="extended"
											aria-label="Sign in with Cyclopt"
											title="Sign in with Cyclopt"
											className={classes.margin}
											component="a"
											href={`${authURL}&type=cyclopt`}
											target="_self"
											sx={{ width: "270px !important", height: "45px !important" }}
											onClick={() => ReactGA.event({ category: "User", action: "Clicked \"Sign In\"" })}
										>
											<Grid container direction="row" justifyContent="center" sx={{ alignItems: "center", textTransform: "none" }}>
												<Typography variant="h6" className={classes.signIn} mr={1}>{"Sign In with:"}</Typography>
												<Image src={cycloptLogo} alt="Cyclopt" width="10%" />
												<Typography variant="h6" fontWeight="bold" color="common.black" sx={{ fontSize: (t) => t.spacing(2.2) }} ml={1}>{"cyclopt"}</Typography>
											</Grid>
										</Fab>
									</Zoom>
								</Grid>
							</Grid>
						</Grid>
					</Grid>
				</Grid>
				<Grid item container direction="row" justifyContent="center" spacing={1} m={-0.5} sx={{ "> .MuiGrid-item": { p: 0.5 } }}>
					<Grid item>
						<Link
							variant="h6"
							className={clsx(classes.subtitle, classes.link)}
							href="https://cyclopt.com"
							target="_blank"
							rel="noopener noreferrer"
							underline="none"
						>
							{"About"}
						</Link>
					</Grid>
					<Grid item><Typography className={classes.subtitleDivider}>{"|"}</Typography></Grid>
					<Grid item>
						<Link
							variant="h6"
							href="https://cyclopt.com/blog"
							target="_blank"
							rel="noopener noreferrer"
							className={clsx(classes.subtitle, classes.link)}
							underline="none"
						>
							{"Blog"}
						</Link>
					</Grid>
					<Grid item><Typography className={classes.subtitleDivider}>{"|"}</Typography></Grid>
					<Grid item>
						<Link
							variant="h6"
							href="https://cyclopt.com/tos"
							target="_blank"
							rel="noopener noreferrer"
							className={clsx(classes.subtitle, classes.link)}
							underline="none"
						>
							{"ToS"}
						</Link>
					</Grid>
					<Grid item><Typography className={classes.subtitleDivider}>{"|"}</Typography></Grid>
					<Grid item>
						<Link
							variant="h6"
							href="https://cyclopt.com/privacy"
							target="_blank"
							rel="noopener noreferrer"
							className={clsx(classes.subtitle, classes.link)}
							underline="none"
						>
							{"Privacy"}
						</Link>
					</Grid>
				</Grid>
			</Grid>
			<Grid item md={3} />
		</StyledGrid>
	);
};

export default memo(SignIn);
