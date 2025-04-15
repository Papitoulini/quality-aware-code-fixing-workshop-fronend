import { useCallback, useMemo, useState, useEffect } from "react";
import {
	Box,
	Typography,
	Button,
	InputAdornment,
	IconButton,
	Switch,
	Grid,
	Stack,
	Rating,
	Divider,
	Container,
	Input,
	ListItemText,
	List,
	ListItem,
	ListItemIcon,
	CircularProgress,
} from "@mui/material";
import {
	Reply,
	LocationOn,
	Email,
	Link as LinkIcon,
	Edit,
	Done,
	Clear,
	Person,
	QueryStats,
} from "@mui/icons-material";
import { useTheme, styled } from "@mui/material/styles";
import { useNavigate, useParams } from "react-router-dom";
import { Image } from "mui-image";
import Measure from "react-measure";
import pluralize from "pluralize";
import PropTypes from "prop-types";
import CommitIcon from '@mui/icons-material/Commit';
import FolderIcon from '@mui/icons-material/Folder';
import MergeTypeIcon from '@mui/icons-material/MergeType';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

import Tooltip from "../components/Tooltip.jsx";
// import Plot from "../components/Plot.jsx";
import { jwt, dayjs, useSnackbar, convertQualityScoreToLetter, levelThresholds } from "../utils/index.js";
import { useDeveloperData, updateDeveloperData, useDeveloperHistoryStatus, updateDeveloperHistory } from "../api/index.js";
import level5 from "../assets/images/developer_characteristics/B-5.png";

const getCharacteristicsProps = (score) => {
	let totalThreshHold = 0;
	for (const { png, threshHold, startingColor, endColor } of levelThresholds) {
		const levelLowerLimit = totalThreshHold;
		const levelUpperLimit = totalThreshHold + threshHold;
		totalThreshHold = levelUpperLimit;
		if (score < totalThreshHold) {
			return {
				png,
				levelPct: (score - levelLowerLimit) / threshHold,
				pointsForNextLevel: (score - levelLowerLimit),
				startingColor,
				endColor,
			};
		}
	}

	return { png: level5, levelPct: 0, pointsForNextLevel: 0, startingColor: "#806954", endColor: "#806954" };
};

// ─── STYLED COMPONENTS FOR DEVELOPER PROFILE ─────────────────────────────
const Header = styled(Box)(({ theme }) => ({
	marginBottom: theme.spacing(2),
	display: "flex",
	flexDirection: "row-reverse",
	gap: theme.spacing(1),
}));

const ViewToggleContainer = styled(Grid)(({ theme }) => ({
	margin: theme.spacing(1),
	justifyContent: "center",
	alignItems: "center",
}));

const RightContent = styled(Box)(({ theme }) => ({
	display: "flex",
	flexDirection: "column",
	gap: theme.spacing(3),
}));

const TimelineBox = styled(Box)(() => ({
	width: "85%",
}));

// ─── EDITABLE TEXT COMPONENT ───────────────────────────────────────────────
const EditableText = ({ label, dense, initialText, variant, onUpdate, isInEditMode }) => {
	const [text, setText] = useState(initialText);
	const [editMode, setEditMode] = useState(false);

	return isInEditMode ? (
		<Stack direction="row" alignItems="center" gap={1} sx={{ mt: 1, mb: 1 }}>
			<Input
				required
				disableUnderline
				type="text"
				placeholder="Title"
				value={text || initialText}
				disabled={!editMode}
				endAdornment={(
					<InputAdornment position="end">
						{!editMode && (
							<IconButton aria-label="edit title" onClick={() => setEditMode(true)}>
								<Edit />
							</IconButton>
						)}
						{editMode && (
							<>
								<IconButton
									aria-label="update"
									onClick={() => {
										onUpdate(text, label);
										setEditMode(false);
									}}
								>
									<Done />
								</IconButton>
								<IconButton
									aria-label="clear"
									onClick={() => {
										setText(initialText);
										setEditMode(false);
									}}
								>
									<Clear />
								</IconButton>
							</>
						)}
					</InputAdornment>
				)}
				sx={{
					backgroundColor: "rgba(255,255,255,0.9)",
					borderRadius: 1,
					px: 1,
				}}
				onChange={(e) => setText(e.target.value)}
			/>
		</Stack>
	) : (label === "role"
		? <RoleText variant="subtitle1"> {initialText} </ RoleText>
		: <Typography variant={variant} sx={{ color: "primary.main", ...(dense && { lineHeight: "1rem", my: 1 }) }}>
			{initialText}
		</Typography>
		
	);
};

EditableText.propTypes = {
	label: PropTypes.string,
	dense: PropTypes.bool,
	initialText: PropTypes.string,
	variant: PropTypes.string,
	onUpdate: PropTypes.func,
	isInEditMode: PropTypes.bool,
};

// ─── DEVELOPER BASIC INFO COMPONENT ─────────────────────────────────────────
const BasicInfoContainer = styled(Box)(({ theme }) => ({
	height: "100%",
	backgroundColor: theme.palette.grey.light,
	display: "flex",
	flexDirection: "column",
	padding: theme.spacing(3),
}));

const AvatarContainer = styled(Box)(({ theme }) => ({
	display: "flex",
	justifyContent: "center",
	margin: theme.spacing(2, 0),
}));

const RoleText = styled(Typography)(({ theme }) => ({
	color: theme.palette.pink ? theme.palette.pink.main : "#e91e63",
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
	fontWeight: 500,
	marginTop: theme.spacing(1),
	color: theme.palette.primary.main,
}));

const CustomDivider = styled(Divider)(({ theme }) => ({
	backgroundColor: theme.palette.primary.main,
	marginBottom: theme.spacing(1),
}));

const ContactStack = styled(Stack)(({ theme }) => ({
	marginBottom: theme.spacing(0),
}));

const DeveloperBasicInfo = ({ info, updateInfo, isInEditMode = false }) => {
	const { username, avatar, role, shortBio, address, email, website, fullName } = info;

	return (
		<BasicInfoContainer>
			<AvatarContainer>
				<Image
					src={avatar}
					alt={username}
					title={username}
					width="160px"
					height="160px"
					style={{
						margin: "auto",
						borderRadius: "50%",
						border: "1px solid #f50057",
					}}
				/>
			</AvatarContainer>
			<Typography variant="h5">{username}</Typography>
			<ContactStack direction="row" alignItems="center" gap={1}>
				<RoleText variant="subtitle1">
					<EditableText label="role" isInEditMode={isInEditMode} initialText={role} variant="caption" onUpdate={updateInfo} />
				</RoleText>
			</ContactStack>
			<EditableText dense label="shortBio" isInEditMode={isInEditMode} initialText={shortBio} variant="body2" onUpdate={updateInfo} />

			<SectionTitle variant="h6">{"Info"}</SectionTitle>
			<CustomDivider />
			<Box >
				<ContactStack direction="row" alignItems="center" gap={1}>
					<Person />
					<EditableText label="fullName" isInEditMode={isInEditMode} initialText={fullName} variant="caption" onUpdate={updateInfo} />
				</ContactStack>
				<ContactStack direction="row" alignItems="center" gap={1}>
					<LocationOn />
					<EditableText label="address" isInEditMode={isInEditMode} initialText={address} variant="caption" onUpdate={updateInfo} />
				</ContactStack>
				<ContactStack direction="row" alignItems="center" gap={1}>
					<Email />
					<EditableText label="email" isInEditMode={isInEditMode} initialText={email} variant="caption" onUpdate={updateInfo} />
				</ContactStack>
				<ContactStack direction="row" alignItems="center" gap={1}>
					<LinkIcon />
					<EditableText label="website" isInEditMode={isInEditMode} initialText={website} variant="caption" onUpdate={updateInfo} />
				</ContactStack>
			</Box>
		</BasicInfoContainer>
	);
};

DeveloperBasicInfo.propTypes = {
	info: PropTypes.shape({
		username: PropTypes.string,
		avatar: PropTypes.string,
		role: PropTypes.string,
		shortBio: PropTypes.string,
		persona: PropTypes.string,
		address: PropTypes.string,
		email: PropTypes.string,
		website: PropTypes.string,
	}),
	updateInfo: PropTypes.func,
	isInEditMode: PropTypes.bool,
};

// ─── LANGUAGES & FRAMEWORKS COMPONENT ─────────────────────────────────────────
const LanguagesContainer = styled(Box)(({ theme }) => ({
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
}));

const NoDataFound = ({ value }) => (
	<Typography gutterBottom textAlign="center" width="100%">
		{"No"}
		{" "}
		<Box component="span" sx={{ color: "primary.main" }}>
			{value}
		</Box>
		{" "}
		{"found yet"}
	</Typography>
);

NoDataFound.propTypes = {
	value: PropTypes.string,
};

const LanguagesAndFrameworks = ({
	keysToExclude = {},
	languages = [],
	frameworks = [],
	isInEditMode = false,
	updateInfo,
}) => {
	const filteredLanguages = isInEditMode
		? languages
		: languages?.filter(([language]) => !keysToExclude.languages?.includes(language));

	const filteredFrameworks = isInEditMode
		? frameworks
		: frameworks?.filter(([framework]) => !keysToExclude.frameworks?.includes(framework));

	return (
		<LanguagesContainer>
			<SectionTitle variant="h6">{"Languages & Frameworks"}</SectionTitle>
			<CustomDivider />
			<Box sx={{ mt: 1 }}>
				{ filteredLanguages.length === 0
					? <NoDataFound value="languages" />
					: (
						<Grid container>
							{filteredLanguages.map(([language, metaData], index) => (
								<Grid key={index} item xs={12} sm={6} sx={{ p: 1 }}>
									{isInEditMode && (
										<Stack direction="row-reverse">
											<Typography variant="caption">{"Public"}</Typography>
											<Switch
												size="small"
												checked={!keysToExclude.languages.includes(language)}
												name={language}
												color="primary"
												onChange={(e) => updateInfo(e, "languages", language)}
											/>
										</Stack>
									)}
									<Box
										sx={
											isInEditMode
												? { p: 1, boxShadow: 1, borderRadius: 1, border: "1px solid #ccc" }
												: {}
										}
									>
										<Stack direction="row" gap={1}>
											<Typography fontWeight="bold">{language}</Typography>
											<Rating
												readOnly
												name={`${language}-rating`}
												sx={{ color: "secondary.main" }}
												value={metaData.score * 5} 
											/>
										</Stack>
										<Box m={1}>
											<Typography variant="body2">
												{"• Lines of code: "}
												<b>{metaData.linesOfCode}</b>
											</Typography>
											<Typography variant="body2">
												{"• Average Code Quality: "}
												<b>{convertQualityScoreToLetter(metaData.averageQuality)}</b>
											</Typography>
											<Typography variant="body2">
												{"• Repositories: "}
												<b>{metaData.numOfRepositories}</b>
											</Typography>
										</Box>
									</Box>
								</Grid>
							))}
						</Grid>
					)}
				<Divider sx={{ my: 1 }} />
				{ filteredFrameworks.length === 0
					? <NoDataFound value="frameworks" />
					: (
						<Grid container>
							{filteredFrameworks.map(([framework, metaData], index) => (
								<Grid key={index} item xs={12} sm={6} sx={{ p: 1 }}>
									{isInEditMode && (
										<Stack direction="row-reverse">
											<Typography variant="caption">{"Public"}</Typography>
											<Switch
												size="small"
												checked={!keysToExclude.frameworks.includes(framework)}
												name={framework}
												color="primary"
												onChange={(e) => updateInfo(e, "frameworks", framework)}
											/>
										</Stack>
									)}
									<Box
										sx={
											isInEditMode
												? { p: 1, boxShadow: 1, borderRadius: 1, border: "1px solid #ccc" }
												: {}
										}
									>
										<Stack direction="row" gap={1}>
											<Typography fontWeight="bold">{framework}</Typography>
											<Rating
												readOnly
												name={`${framework}-rating`}
												sx={{ color: "secondary.main" }}
												value={metaData.score}
											/>
										</Stack>
										<Box m={1}>
											<Typography variant="body2">
												{"• Lines of code: "}
												<b>{metaData.linesOfCode}</b>
											</Typography>
											<Typography variant="body2">
												{"• Average Code Quality: "}
												<b>{convertQualityScoreToLetter(metaData.averageQuality)}</b>
											</Typography>
											<Typography variant="body2">
												{"• Repositories: "}
												<b>{metaData.numOfRepositories}</b>
											</Typography>
										</Box>
									</Box>
								</Grid>
							))}
						</Grid>
					)}
			</Box>
		</LanguagesContainer>
	);
};

LanguagesAndFrameworks.propTypes = {
	keysToExclude: PropTypes.shape({
		languages: PropTypes.array,
		frameworks: PropTypes.array,
	}),
	languages: PropTypes.array,
	frameworks: PropTypes.array,
	isInEditMode: PropTypes.bool,
	updateInfo: PropTypes.func,
};

const BasicTrendsContainer = styled(Box)(({ theme }) => ({
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
}));

// const ContributionActivity = ({ trends }) =>{
// 	return (
// 		<Box>
// 			{trends.map((block, i) => (
// 				<Box key={i} mb={4}>
// 					{/* Date header */}
// 					<Typography variant="h6" gutterBottom>
// 						{block.date}
// 					</Typography>

// 					{/* Events for this date */}
// 					{block.events.map((event, j) => (
// 						<Box key={j} ml={2} mb={0}>
// 							<Typography variant="subtitle1" gutterBottom>
// 								{event.title}
// 							</Typography>

// 							{/* Render details differently based on the event type */}
// 							{event.type === "commits" && (
// 								<List dense disablePadding sx={{ ml: 2 }}>
// 									{event.details.map((repo, k) => (
// 										<ListItem key={k} disableGutters>
// 											<ListItemIcon sx={{ minWidth: 32 }}>
// 												<CommitIcon color="secondary" />
// 											</ListItemIcon>
// 											<ListItemText
// 												primary={`${repo.name} — ${repo.commits} commits`}
// 											/>
// 										</ListItem>
// 									))}
// 								</List>
// 							)}

// 							{event.type === "repo" && (
// 								<List dense disablePadding sx={{ ml: 2 }}>
// 									{event.details.map((repo, k) => (
// 										<ListItem key={k} disableGutters>
// 											<ListItemIcon sx={{ minWidth: 32 }}>
// 												<RepoIcon color="secondary" />
// 											</ListItemIcon>
// 											<ListItemText primary={repo.name} />
// 										</ListItem>
// 									))}
// 								</List>
// 							)}

// 							{event.type === "pullRequest" && (
// 								<List dense disablePadding sx={{ ml: 2 }}>
// 									{event.details.map((detail, k) => (
// 										<ListItem key={k} disableGutters>
// 											<ListItemIcon sx={{ minWidth: 32 }}>
// 												<MergeTypeIcon color="secondary" />
// 											</ListItemIcon>
// 											<ListItemText primary={detail} />
// 										</ListItem>
// 									))}
// 								</List>
// 							)}
// 						</Box>
// 					))}
// 				</Box>
// 			))}
// 		</Box>
// 	);
// }

// const BasicTrends = ({ isInEditMode, updateInfo, keysToExclude }) => {
const BasicTrends = ({ trends = [] }) => {
	// // Dummy data for monthly trends
	// const months = [
	// 	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
	// 	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
	// ];
	// const dummyLanguagesTrend = [5, 8, 6, 10, 7, 9, 4, 11, 8, 7, 6, 9];
	// const dummyFrameworksTrend = [3, 7, 4, 9, 5, 8, 6, 10, 7, 5, 6, 8];
	// const dummyReposTrend = [2, 4, 3, 5, 3, 4, 2, 6, 3, 4, 2, 5];

	// Create traces for each trend category
	// const traceLanguages = {
	// 	x: months,
	// 	y: dummyLanguagesTrend,
	// 	type: "bar",
	// 	name: "Languages",
	// 	marker: { color: "rgb(66, 133, 244)" }, // primary color
	// };
	
	// const traceFrameworks = {
	// 	x: months,
	// 	y: dummyFrameworksTrend,
	// 	type: "bar",
	// 	name: "Frameworks",
	// 	marker: { color: "rgb(219, 68, 55)" }, // error color
	// };
	
	// const traceRepos = {
	// 	x: months,
	// 	y: dummyReposTrend,
	// 	type: "bar",
	// 	name: "Repositories",
	// 	marker: { color: "rgb(15, 157, 88)" }, // a green tone
	// };
	
	// // Common layout settings for each chart
	// const commonLayout = {
	// 	xaxis: { title: "Month" },
	// 	yaxis: { title: "Count" },
	// 	margin: { t: 30, r: 20, b: 40, l: 50 },
	// 	autosize: true,
	// };
	
	return (
		<BasicTrendsContainer>
			<SectionTitle variant="h6">Trends</SectionTitle>
			<CustomDivider />

			<ContributionActivity	trends={trends} />
	
			{/* Languages Trend Plot */}
			{/* <Box sx={{ mt: 2 }}>
				<Typography variant="subtitle1" gutterBottom>
			Languages Trend
				</Typography>
				<Plot
					data={[traceLanguages]}
					layout={{ ...commonLayout, title: "Languages Trend" }}
				/>
			</Box> */}
	
			{/* Frameworks Trend Plot */}
			{/* <Box sx={{ mt: 4 }}>
				<Typography variant="subtitle1" gutterBottom>
			Frameworks Trend
				</Typography>
				<Plot
					data={[traceFrameworks]}
					layout={{ ...commonLayout, title: "Frameworks Trend" }}
				/>
			</Box> */}
	
			{/* Repositories Trend Plot */}
			{/* <Box sx={{ mt: 4 }}>
				<Typography variant="subtitle1" gutterBottom>
			Repositories Trend
				</Typography>
				<Plot
					data={[traceRepos]}
					layout={{ ...commonLayout, title: "Repositories Trend" }}
				/>
			</Box> */}
		</BasicTrendsContainer>
	);
};

BasicTrends.propTypes = {
	keysToExclude: PropTypes.shape({
		languages: PropTypes.array,
		frameworks: PropTypes.array,
	}),
	languages: PropTypes.array,
	frameworks: PropTypes.array,
	isInEditMode: PropTypes.bool,
	updateInfo: PropTypes.func,
};

// const languageOrFrameworkDummyData = (label, level) => {
// 	return (
// 		<Typography textAlign={"start"}>
// 			<Typography color="primary">
// 				{label}
// 			</Typography>
// 			<Box sx={{ position: 'relative', border: "" }}>
// 				{"level up"}
// 				<ArrowUpward fontSize="small" />
// 				<Box
// 					sx={{
// 						position: 'absolute',
// 						top: -5,
// 						left: '90%',
// 						transform: 'translateX(-50%)',
// 						// bgcolor: 'primary.main',
// 						// color: 'white',
// 						px: 0.5,
// 						borderRadius: '50%',
// 						fontSize: '0.75rem',
// 					}}
// 				>
// 					{level}
// 				</Box>
// 			</Box>
// 		</Typography>
// 	)
// };

// const timeLineDummyData = [
// 	[languageOrFrameworkDummyData("Javascript", 1), dayjs().subtract(1, "month").format("MMM DD, YYYY")],
// ];

// const SideTimeLine = () => {
// 	return (
// 		<Timeline position="alternate">
// 			{timeLineDummyData.map((data, index) => (
// 				<TimelineItem key={index}>
// 					<TimelineSeparator>
// 						<TimelineDot color="secondary" />
// 						<TimelineConnector />
// 					</TimelineSeparator>
// 					<TimelineContent>{data}</TimelineContent>
// 				</TimelineItem>

// 			))}
// 		</Timeline>
// 	)
// }

// ─── PERSONAS CHARACTERISTICS COMPONENT ─────────────────────────────────────
const CharacteristicsContainer = styled(Box)(({ theme }) => ({
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
}));

const filter = new Set([
	"efficiency",
	"focus",
	"innovation",
	"speed",
])

const PersonasCharacteristics = ({ characteristics = {}, isInEditMode, keysToExclude, updateInfo }) => {
	const filteredCharacteristics = Object.entries(characteristics)
		.filter(([label]) => (isInEditMode || !keysToExclude?.characteristics?.includes(label) && !filter.has(label)));

	const hasFilteredCharacteristics = filteredCharacteristics.every(([
		_, value]) => (value === 0));	

	return (
		<CharacteristicsContainer>
			<SectionTitle variant="h6">{"Characteristics"}</SectionTitle>
			<CustomDivider />
			<Grid container display="flex" flexDirection="row">
				{hasFilteredCharacteristics
					? <NoDataFound value="characteristics" />
					: (
						<>
							{filteredCharacteristics
								.map(([label, points], index) => {
									const { png, levelPct, pointsForNextLevel, startingColor, endColor } = getCharacteristicsProps(points.total);

									return (
										<Grid key={index} item xs={12} sm={6} mb={1} pl={1}>
											<Box
												sx={{
													display: "flex",
													flexDirection: "column",
													alignItems: "left",
													justifyContent: "space-between",
													...(isInEditMode
														? { p: 1, boxShadow: 1, borderRadius: 1, border: "1px solid #ccc" }
														: {}),
												}}
											>
												{isInEditMode && (
													<Stack direction="row-reverse">
														<Typography variant="caption">{"Public"}</Typography>
														<Switch
															size="small"
															checked={!keysToExclude.characteristics.includes(label)}
															name={label}
															color="primary"
															onChange={(e) => updateInfo(e, "characteristics", label)}
														/>
													</Stack>
												)}
												<Grid container alignItems="center">
													<Grid item xs={12} sm={4} display="flex" alignItems="center">
														<Typography variant="body2" fontWeight="bold">
															{`${label[0].toUpperCase() + label.slice(1)}:`}
														</Typography>
													</Grid>
													<Grid item xs={12} sm={8} display="flex" textAlign="center">
														<Tooltip disabled title={(
															<>
																<Typography variant="body2">
																	<b>{"! "}</b>
																	{"Security issues Solved: "}
																	<b>{"400"}</b>
																</Typography>
																<Typography variant="body2">
																	<b>{"! "}</b>
																	{"Time Spent "}
																	<b>{"130 hours"}</b>
																</Typography>
															</>
														)}
														>
															<Box display="flex">
																<Image
																	src={png}
																	alt="username"
																	title="username"
																	width="32px"
																	height="32px"
																	style={{
																		margin: "5px",
																	}}
																/>
																<Typography sx={{ fontSize: "1.1rem", ml: 1 }}>{`${Math.ceil(points.total)} `}</Typography>
																<Typography alignSelf="self-end" sx={{ fontSize: "0.7rem", color: "text.secondary" }}>{"points "}</Typography>
																{isInEditMode && (
																	<>
																		<Typography sx={{ fontSize: "1.1rem" }}>{`/ ${Math.ceil(points.week)} `}</Typography>
																		<Typography alignSelf="self-end" sx={{ fontSize: "0.7rem", color: "text.secondary" }}>{"this week"}</Typography>
																	</>
																)}
															</Box>
														</Tooltip>
													</Grid>
												</Grid>

												{isInEditMode
													&& (
														<>
															<RatingBar
																value={levelPct}
																width="60%"
																color={`linear-gradient(90deg, ${startingColor} 0%, ${endColor} 100%)`}
															/>
															<Typography variant="caption" sx={{ color: "text.secondary" }}>
																{"Points remaining for next level"}
																{" "}
																<b>
																	{pointsForNextLevel}
																</b>
															</Typography>
														</>
													)}
												{/* {isInEditMode && (
														<Stack direction="row-reverse">
															<Typography variant="caption">{"Public"}</Typography>
															<Switch
																size="small"
																checked={!keysToExclude.characteristics.includes(label)}
																name={label}
																color="primary"
																onChange={(e) => updateInfo(e, "characteristics", label)}
															/>
														</Stack>
													)} */}
												{/* </Box> */}
											</Box>
										</Grid>
									);
								})}
						</>
					)}

			</Grid>
		</CharacteristicsContainer>
	);
};

PersonasCharacteristics.propTypes = {
	characteristics: PropTypes.object,
	updateInfo: PropTypes.func,
	isInEditMode: PropTypes.bool,
	keysToExclude: PropTypes.shape({
		characteristics: PropTypes.array,
	}),
};

// ─── INVOLVED REPOSITORIES COMPONENT ─────────────────────────────────────────
const RepositoriesContainer = styled(Box)(({ theme }) => ({
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
}));

const groupRepositories = (repositories) => {
	const repos = [];
	return Object.entries(repositories?.reduce((acc, { _id, owner, name }) => {
		const key = `${owner}/${name}`;
		if (!acc[key]) {
			acc[key] = [];
		}

		acc[key].push(_id);
		return acc;
	}, {}) || {});
	// for (const [group] of Object.entries(groups)) {
	// 	// repos.push(`${group} (${roots.join(", ")})`);
	// 	repos.push(`${group}`);
	// }

	return repos;
};

const InvolvedRepositories = ({
	repositories = [],
	keysToExclude,
	isInEditMode = false,
	updateInfo,
	privateRepos,
}) => {
	// Get the ids from keysToExclude once
	const excludedRepoIds = useMemo(
		() => keysToExclude?.repositories || [],
		[keysToExclude]
	);
  
	// Compute grouped repositories for Edit mode (all repos)
	const allGroupedRepos = useMemo(() => groupRepositories(repositories), [repositories]);
  
	// Filter and group public repositories that are not excluded
	const groupedPublicRepos = useMemo(() => {
		const publicRepos = repositories.filter(
			(repo) =>
				!repo.isPrivate && !excludedRepoIds.includes(repo._id.toString())
		);
		return groupRepositories(publicRepos);
	}, [repositories, excludedRepoIds]);
  
	// Filter and group private repositories that are not excluded
	const groupedPrivateRepos = useMemo(() => {
		const privateReposFiltered = repositories.filter(
			(repo) =>
				repo.isPrivate && !excludedRepoIds.includes(repo._id.toString())
		);
		return groupRepositories(privateReposFiltered);
	}, [repositories, excludedRepoIds]);
  
	return (
		<RepositoriesContainer>
			<SectionTitle variant="h6">{"Repositories Involved"}</SectionTitle>
			<CustomDivider />
  
			{isInEditMode ? (
				<Box>
					{allGroupedRepos.map(([repo, currentIds], index) => {
						const isGroupChecked = currentIds.every((id) =>
							excludedRepoIds.includes(id)
						);
						const disableSwitch =
				!isGroupChecked &&
				repositories.length === excludedRepoIds.length + 1;
						return (
							<Box
								key={index}
								sx={{
									p: 1,
									boxShadow: 1,
									borderRadius: 0.5,
									border: '1px solid #ccc',
									my: 1,
									display: 'flex',
									justifyContent: 'space-between',
								}}
							>
								<Typography>{repo}</Typography>
								<Stack direction="row-reverse">
									<Typography variant="caption">{"Public"}</Typography>
									<Tooltip
										title={
											disableSwitch ? 'You must have at least one repository' : ''
										}
									>
										<span>
											<Switch
												size="small"
												checked={!isGroupChecked}
												disabled={disableSwitch}
												name={repo._id}
												color="primary"
												onChange={(e) =>
													updateInfo(e, 'repositories', currentIds)
												}
											/>
										</span>
									</Tooltip>
								</Stack>
							</Box>
						);
					})}
				</Box>
			) : (
				<Grid container spacing={2}>
					<Grid item xs={12} sm={6}>
						<Typography fontWeight="bold">
							{`Public Repositories (${groupedPublicRepos.length})`}
						</Typography>
						<Box pl={1}>
							{groupedPublicRepos.map(([repo], index) => (
								<Typography key={index} color="secondary">
									{"• "}{repo}
								</Typography>
							))}
						</Box>
					</Grid>
					<Grid item xs={12} sm={6}>
						<Typography fontWeight="bold">
							{`Private Repositories (${groupedPrivateRepos.length})`}
						</Typography>
						<Box
							sx={{
								position: 'relative',
								px: 2,
								my: 2,
								'&::before': {
									content: '""',
									position: 'absolute',
									top: 0,
									bottom: 0,
									left: 0,
									width: '5px',
									background: (t) =>
										`linear-gradient(to right, ${t.palette.secondary.main}, ${t.palette.primary.main})`,
								},
							}}
						>
							<Typography variant="caption" fontStyle="italic">
								{`This page also displays information sourced from ${privateRepos} private repositories.`}
							</Typography>
						</Box>
					</Grid>
				</Grid>
			)}
		</RepositoriesContainer>
	);
};

InvolvedRepositories.propTypes = {
	repositories: PropTypes.array,
	keysToExclude: PropTypes.shape({
		repositories: PropTypes.array,
	}),
	isInEditMode: PropTypes.bool,
	updateInfo: PropTypes.func,
};

// ─── RATING BAR COMPONENT ───────────────────────────────────────────────────
const RatingBar = ({ value, width, color }) => {
	const minBar = 0.7;
	return (
		<div
			style={{
				width,
				minWidth: `${minBar}rem`,
				height: `${minBar}rem`,
				position: "relative",
				margin: "2.5px",
				marginTop: "1px",
			}}
		>
			<div
				style={{
					width: "100%",
					height: "100%",
					borderRadius: "1rem",
					backgroundColor: "#f5f5f5",
					opacity: 1,
				}}
			/>
			<div
				style={{
					width: `${value * 100}%`,
					height: "100%",
					borderRadius: "1rem",
					background: color,
					position: "absolute",
					top: 0,
					left: 0,
				}}
			/>
		</div>
	);
};

RatingBar.propTypes = {
	value: PropTypes.number,
	width: PropTypes.string,
	color: PropTypes.string,
};

// ─── Activity COMPONENT ────────────────────────────────────────────────────
const ActivityContainer = styled(Box)(({ theme }) => ({
	paddingLeft: theme.spacing(1),
	paddingRight: theme.spacing(1),
}));

const Activity = ({ contributionsPerDay = [], isInEditMode, updateInfo, keysToExclude }) => {
	const values = useMemo(() => {
		const contributions = contributionsPerDay?.map((e) => e[1]) || [];
		return {
			values: contributionsPerDay?.reduce(
				(acc, cur) => ({
					...acc,
					[cur[0]]: 1 + 6 * (cur[1] / Math.max(...contributions)),
				}),
				{},
			) || {},
			scale: Math.max(...contributions) / 6,
		};
	}, [contributionsPerDay]);

	return (
		<ActivityContainer>
			<SectionTitle variant="h6">{"Activity"}</SectionTitle>
			<CustomDivider />
			{(keysToExclude?.activity?.includes("commitsPerWeak") && keysToExclude?.activity?.includes("commitsPerDay") && !isInEditMode)
				? <NoDataFound value="commits" />
				: (
					<Box
						sx={{
							mt: 2,
							// backgroundColor: "#f5f5f5",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexDirection: "column",
						}}
					>
						{
							(isInEditMode || !keysToExclude?.activity?.includes("commitsPerDay"))
							&&								(
								<Box
									sx={{
										display: "flex",
										width: "100%",
										flexDirection: "column",
										mt: 1,
										...(isInEditMode
											? { p: 1, boxShadow: 1, borderRadius: 1, border: "1px solid #ccc" }
											: {}),
									}}
								>
									{isInEditMode && (
										<Stack direction="row-reverse">
											<Typography variant="caption">{"Public"}</Typography>
											<Switch
												size="small"
												checked={!keysToExclude?.activity.includes("commitsPerDay")}
												name="commitsPerDay"
												color="primary"
												onChange={(e) => updateInfo(e, "activity", "commitsPerDay")}
											/>
										</Stack>
									)}
									<Box
										sx={{ display: "flex",
											alignItems: "center",
											justifyContent: "center",
											flexDirection: "column",
											width: "100%" }}
									>
										<TimelineBox>
											<TimeLine {...values} />
										</TimelineBox>
									</Box>
								</Box>
							)
						}
					</Box>
				)}

		</ActivityContainer>
	);
};

Activity.propTypes = {
	commitsPerWeek: PropTypes.array,
	contributionsPerDay: PropTypes.array,
	keysToExclude: PropTypes.shape({
		activity: PropTypes.array,
	}),
	isInEditMode: PropTypes.bool,
	updateInfo: PropTypes.func,
};

// ─── TIMELINE COMPONENT ───────────────────────────────────────────────────────
const TimeLineContainer = styled("div")({
	width: "100%",
});

const TimeLine = ({ values = {}, scale = 1 }) => {
	const [columns, setColumns] = useState(53);
	const { palette: { grey, green } } = useTheme();

	const contributions = [];
	for (let i = 0; i < columns; i++) {
		contributions[i] = [];
		for (let j = 0; j < 7; j++) {
			const date = dayjs().endOf("week").subtract((columns - i - 1) * 7 + (6 - j), "days");
			contributions[i][j] = date.isSameOrBefore(dayjs().endOf("d"))
				? { value: values[date.format("YYYY-MM-DD")] || 0, month: date.month() }
				: null;
		}
	}

	const innerDom = [];
	for (let i = 0; i < columns; i++) {
		for (let j = 0; j < 7; j++) {
			const contribution = contributions[i][j];
			if (contribution) {
				innerDom.push(
					<Tooltip
						key={`panel_key_${i}_${j}`}
						title={`${pluralize("contribution", contribution.value === 0 ? contribution.value : Math.round((contribution.value - 1) * scale), true)}.`}
						PopperProps={{ disablePortal: false }}
					>
						<rect
							x={15 + 13 * i}
							y={15 + 13 * j}
							width={11}
							height={11}
							fill={[
								grey[300],
								grey[300],
								green[200],
								green[300],
								green[400],
								green[500],
								green[700],
								green[900],
							][Math.ceil(contribution.value)]}
						/>
					</Tooltip>,
				);
			}
		}
	}

	for (let i = 0; i < 7; i++) {
		innerDom.push(
			<text
				key={`week_key_${i}`}
				style={{ fontSize: 9, alignmentBaseline: "central", fill: "#AAA" }}
				x={7.5}
				y={20.5 + 13 * i}
				textAnchor="middle"
			>
				{["S", "M", "T", "W", "T", "F", "S"][i]}
			</text>,
		);
	}

	let prevMonth = -1;
	for (let i = 0; i < columns; i++) {
		const c = contributions[i][0];
		if (c && c.month !== prevMonth) {
			innerDom.push(
				<text
					key={`month_key_${i}`}
					style={{ fontSize: 10, alignmentBaseline: "central", fill: "#AAA" }}
					x={20.5 + 13 * i}
					y={7.5}
					textAnchor="middle"
				>
					{["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][c.month]}
				</text>,
			);
			prevMonth = c.month;
		}
	}

	return (
		<TimeLineContainer>
			<Measure
				bounds
				onResize={(rect) => {
					if (!rect.bounds) return;
					const visibleWeeks = Math.floor((rect.bounds.width - 15) / 13);
					setColumns(Math.min(visibleWeeks, 53));
				}}
			>
				{({ measureRef }) => (
					<div ref={measureRef} style={{ width: "100%" }}>
						<svg style={{ width: "100%" }} height="110">
							{innerDom}
						</svg>
					</div>
				)}
			</Measure>
		</TimeLineContainer>
	);
};

TimeLine.propTypes = {
	values: PropTypes.object,
	scale: PropTypes.number,
};

// const defaultProps = {
// 	developerInfo: {
// 		role: "This is your role",
// 		persona: "This is your persona",
// 		shortBio: "Here you can provide a small bio",
// 		address: "1234 Elm Street",
// 		website: "https://www.example.com",
// 		email: "panpapgeorgios@gmail.com",
// 		username: "Papitoulini",
// 		avatar: "https://avatars.githubusercontent.com/u/113286556?v=4",
// 	},
// 	languages: [
// 		[
// 			"JavaScript",
// 			{
// 				linesOfCode: 23,
// 				score: 3,
// 				numOfRepositories: 2,
// 				averageQuality: 2,
// 			},
// 		],
// 		[
// 			"Python",
// 			{
// 				linesOfCode: 23,
// 				score: 3,
// 				numOfRepositories: 2,
// 				averageQuality: 2,
// 			},
// 		],
// 	],
// 	frameworks: [
// 		[
// 			"Backend",
// 			{
// 				linesOfCode: 23,
// 				score: 3,
// 				numOfRepositories: 2,
// 				averageQuality: 2,
// 			},
// 		],
// 		[
// 			"FrontEnd",
// 			{
// 				linesOfCode: 23,
// 				score: 3,
// 				numOfRepositories: 2,
// 				averageQuality: 2,
// 			},
// 		],
// 	],
// 	characteristics: {
// 		debugging: {
// 			week: 1,
// 			total: 3,
// 		},
// 		security: {
// 			week: 1,
// 			total: 3,
// 		},
// 		code: {
// 			week: 1,
// 			total: 3,
// 		},
// 		refactoring: {
// 			week: 1,
// 			total: 3,
// 		},
// 		focus: {
// 			week: 1,
// 			total: 3,
// 		},
// 		speed: {
// 			week: 1,
// 			total: 33,
// 		},
// 		efficiency: {
// 			week: 1,
// 			total: 24,
// 		},
// 		innovation: {
// 			week: 1,
// 			total: 3,
// 		},
// 	},
// 	repositories: [
// 		{
// 			_id: "6790fce9774a2e5390a69692",
// 			name: "juice-shop",
// 			owner: "Papitoulini",
// 			root: ".",
// 		},
// 		{
// 			_id: "6790fced774a2e5390a6974d",
// 			name: "thesis",
// 			owner: "Papitoulini",
// 			root: ".",
// 		},
// 	],
// 	commitsPerWeek: [
// 		[
// 			0,
// 			1,
// 		],
// 		[
// 			1,
// 			2,
// 		],
// 		[
// 			2,
// 			33,
// 		],
// 		[
// 			3,
// 			4,
// 		],
// 		[
// 			4,
// 			5,
// 		],
// 		[
// 			6,
// 			7,
// 		],
// 	],
// 	contributionsPerDay: [["2025-01-09", 10], ["2025-01-19", 4]],
// 	additions: 0,
// 	deletions: 0,
// };

const ContributionActivity = ({ trends }) => {
	return (
		<Box>
			{trends.map((block, i) => (
				<Box key={i} mb={4}>
					{/* Date header */}
					<Typography variant="h6" gutterBottom>
						{block.date}
					</Typography>
	
					{/* Events for this date */}
					{block.events.map((event, j) => (
						<Box key={j} ml={2} mb={1}>
							<Typography variant="subtitle1" gutterBottom>
								{event.title}
							</Typography>
	
							{/* Render details differently based on the event type */}
							{event.type === "commits" && (
								<List dense disablePadding sx={{ ml: 2 }}>
									{event.details.map((repo, k) => (
										<ListItem key={k} disableGutters>
											<ListItemIcon sx={{ minWidth: 32 }}>
												<CommitIcon color="secondary" />
											</ListItemIcon>
											<ListItemText primary={`${repo.name} — ${repo.commits} commit${repo.commits > 1 ? 's' : ''}`} />
										</ListItem>
									))}
								</List>
							)}
	
							{event.type === "issues" && (
								<List dense disablePadding sx={{ ml: 2 }}>
									{event.details.map((repo, k) => (
										<ListItem key={k} disableGutters>
											<ListItemIcon sx={{ minWidth: 32 }}>
												<FolderIcon color="secondary" />
											</ListItemIcon>
											<ListItemText primary={repo.name} />
										</ListItem>
									))}
								</List>
							)}
	
							{event.type === "pullRequests" && (
								<List dense disablePadding sx={{ ml: 2 }}>
									{event.details.map((repo, k) => (
										<ListItem key={k} disableGutters>
											<ListItemIcon sx={{ minWidth: 32 }}>
												<MergeTypeIcon color="secondary" />
											</ListItemIcon>
											<ListItemText primary={`${repo.name} — ${repo.pullRequests} commit${repo.pullRequests > 1 ? 's' : ''}`} />
										</ListItem>
									))}
								</List>
							)}
							{event.type === "characteristics" && (
								<List dense disablePadding sx={{ ml: 2 }}>
									{event.details.map((repo, k) => (
										<ListItem key={k} disableGutters>
											<ListItemIcon sx={{ minWidth: 32 }}>
												<UpgradeIcon color="secondary" />
											</ListItemIcon>
											<ListItemText primary={`${repo.name} — ${repo.count} level${repo.count > 1 ? 's' : ''}`} />
										</ListItem>
									))}
								</List>
							)}
						</Box>
					))}
				</Box>
			))}
		</Box>
	);
};

const CalculateStatsButton = ({isViewerTheOwner}) => {
	const navigate = useNavigate();
	const { status = {}, mutate } = useDeveloperHistoryStatus();

	useEffect(() => {
		const intervalId = setInterval(() => {
			mutate();
		}, 10_000);
		return () => clearInterval(intervalId);
	}, [mutate]);

	const getStatusIndicator = () => {
		if (status === "inprogress") {
			return (
				<>
					<CircularProgress size={16} sx={{ marginRight: 0.5 }} /><Typography variant="body2" color="textSecondary">
					In Progress
					</Typography>
				</>
			);
		} else if (status === "synced") {
			return (
				<>
					<CheckCircleIcon color="success" sx={{ marginRight: 0.5 }} /><Typography variant="body2" color="success.main">
					Synced
					</Typography>
				</>
			);
		} else {
			return (
				<>
					<CancelIcon color="error" sx={{ marginRight: 0.5 }} /><Typography variant="body2" color="error.main">
					Not Synced
					</Typography>
				</>
			);
		}
	};
	
	return (
		<Header sx={{ alignItems: "flex-start" }}>
			<Button variant="contained" size="medium" startIcon={<Reply />} onClick={() => navigate("/")}>
				{"back to companion"}
			</Button>
			{
				isViewerTheOwner && <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
					<Button
						variant="contained"
						size="medium"
						sx={{ backgroundColor: (t) => t.palette.pink.main }}
						startIcon={<QueryStats />}
						onClick={async () => await updateDeveloperHistory()}
					>
				calculate stats
					</Button>
					<Box sx={{ display: "flex", alignItems: "center"}}>
						{getStatusIndicator()}
					</Box>
				</Box>}
		</Header>
	);
}
// ─── MAIN DEVELOPER PROFILE COMPONENT ─────────────────────────────────────────
const DeveloperProfile = () => {
	const currentUser = jwt.maybeDecode();
	const { developerId } = useParams();
	const isViewerTheOwner = developerId === currentUser?.id;
	const [isInEditMode, setIsInEditMode] = useState(false);
	const { error } = useSnackbar();

	const { developerData: member = {}, mutate } = useDeveloperData(developerId);

	// const member = useMemo(() => {
	// 	if (Object.keys(unFilteredMember).length > 0) {
	// 		return { ...unFilteredMember,
	// 			repositories: isInEditMode
	// 				? (unFilteredMember?.repositories || [])
	// 				: (unFilteredMember?.repositories?.filter((repo) => !repo.isPrivate) || [])
	// 		}
	// 	}

	// 	return unFilteredMember;
	// }, [isInEditMode, unFilteredMember]);

	// Filter the repositories on the client side using useMemo
	// const member = useMemo(() => {
	// 	if (Object.keys(unfilteredMember).length > 0) {
	// 		return {
	// 			...unfilteredMember,
	// 			repositories: isInEditMode
	// 				? unfilteredMember.repositories || []
	// 				: (unfilteredMember.repositories || []).filter((repo) => !repo.isPrivate),
	// 		};
	// 	}
	// 	return unfilteredMember;
	// }, [isInEditMode, unfilteredMember]);

	const handlePrivateViewToggle = useCallback(() => {
		if (!isViewerTheOwner) return;
		
		setIsInEditMode((prev) => {
			const nextValue = !prev;
			// mutate((prevData) => {
			// 	if (nextValue) {
			// 		return {
			// 			...prevData,
			// 			repositories: prevData.repositories,
			// 		};
			// 	}
			// 	return {
			// 		...prevData,
			// 		repositories: prevData.repositories.filter((repo) => !repo.isPrivate),
			// 	};
			// });
			return nextValue;
		});
	}, [isViewerTheOwner]);

	const updateDeveloperStats = useCallback(
		async (text, label, frameworkOrLanguage) => {
			try {
				if (isViewerTheOwner) {
					const body = {
						developerInfo: { ...member.developerInfo },
						keysToExclude: {
							frameworks: member.keysToExclude?.frameworks || [],
							languages: member.keysToExclude?.languages || [],
							repositories: member.keysToExclude?.repositories || [],
							characteristics: member.keysToExclude?.characteristics || [],
							activity: member.keysToExclude?.activity || [],
						},
					};

					if (label && frameworkOrLanguage) {
						if (label === "repositories") {
							for (const repo of frameworkOrLanguage) {
								const index = body.keysToExclude.repositories.indexOf(repo);
								if (index === -1) {
									body.keysToExclude.repositories.push(repo);
								} else {
									body.keysToExclude.repositories.splice(index, 1);
								}
							}
						} else {
							const index = body.keysToExclude[label].indexOf(frameworkOrLanguage);
							if (index === -1) {
								body.keysToExclude[label].push(frameworkOrLanguage);
							} else {
								body.keysToExclude[label].splice(index, 1);
							}
						}
					} else {
						body.developerInfo[label] = text;
					}

					mutate((prevData) => ({ ...prevData, ...body }), false);
					await updateDeveloperData(developerId, body);
					await mutate();
				}
			} catch {
				error();
			}
		},
		[error, isViewerTheOwner, member.keysToExclude, member.developerInfo, mutate, developerId],
	);

	return (
		<Container sx={{ py: 4 }}>
			<CalculateStatsButton isViewerTheOwner={isViewerTheOwner}/>
			<Grid container spacing={3}>
				<Grid item xs={6} md={3}>
					<DeveloperBasicInfo info={member.developerInfo || {}} isInEditMode={isInEditMode} updateInfo={updateDeveloperStats} />
				</Grid>

				<Grid item xs={12} md={9} order={{ xs: 3, md: 2 }}>
					{isViewerTheOwner && (
						<ViewToggleContainer container sx={{ justifyContent: "right" }}>
							<Typography variant="caption">{"Show Public"}</Typography>
							<Switch size="small" checked={isInEditMode} name="privateViewToggle" color="secondary" onChange={handlePrivateViewToggle} />
							<Typography variant="caption">{"Edit Page"}</Typography>
						</ViewToggleContainer>
					)}
					<RightContent>
						<LanguagesAndFrameworks
							keysToExclude={member.keysToExclude}
							languages={member.languages}
							frameworks={member.frameworks}
							isInEditMode={isInEditMode}
							updateInfo={updateDeveloperStats}
						/>
						<PersonasCharacteristics
							characteristics={member.characteristics}
							keysToExclude={member.keysToExclude}
							isInEditMode={isInEditMode}
							updateInfo={updateDeveloperStats}
						/>
						<InvolvedRepositories
							analyses={member.enhancedRepositories}
							githubRepositories={member.gitHubRepos}
							privateRepos={member.privateRepositories}
							githubPrivateRepositories={member.githubPrivateRepositories}
							repositories={member.repositories}
							keysToExclude={member.keysToExclude}
							isInEditMode={isInEditMode}
							updateInfo={updateDeveloperStats}
						/>
						<Activity
							commitsPerWeek={member.commitsPerWeek}
							contributionsPerDay={member.contributionsPerDay}
							isInEditMode={isInEditMode}
							keysToExclude={member.keysToExclude}
							updateInfo={updateDeveloperStats}
						/>
						<BasicTrends
							trends={member.trends}
						/>
						{/* <TimelineContainer item>
							<TimelineBox>
								<TimeLine {...values} />
							</TimelineBox>
						</TimelineContainer> */}
					</RightContent>
				</Grid>
			</Grid>
		</Container>
	);
};

export default DeveloperProfile;
