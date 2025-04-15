import { useState, memo, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Typography, Grid, Box, CircularProgress, Link } from "@mui/material";
import queryString from "query-string";
import { useLocation } from "react-router-dom";

import { useSnackbar, mapOverviewToMetrics } from "../../utils/index.js";
import CodeViewer from "../../components/CodeViewer.jsx";
import GeneralInfoTile from "../../components/GeneralInfoTile.jsx";
import BorderBox from "../../components/BorderBox.jsx";
import DuplicatesTables from "../../components/DuplicatesTables.jsx";
import BackToFilesButton from "../../components/BackToFilesButton.jsx";
import { loadFileContent, useDuplicates } from "../../api/index.js";

const Duplicates = (props) => {
	const { repository, hash, showDiff } = props;
	const { owner, name, language } = repository || {};
	const { error } = useSnackbar();
	const { search } = useLocation();
	const { clonesInfo = {}, isLoading: isClonesLoading, isError } = useDuplicates(hash, repository || {});
	const [isLoading, setIsLoading] = useState(false);
	const [selectedInstance, setSelectedInstance] = useState("DefaultCloneInstance");
	const [files, setFiles] = useState([]);

	const metrics = useMemo(() => mapOverviewToMetrics(clonesInfo), [clonesInfo]);

	useEffect(() => {
		(async () => {
			setIsLoading(true);
			setFiles([]);
			try {
				if (selectedInstance !== "DefaultCloneInstance") {
					const filesWithClones = clonesInfo?.clones?.current.find((c) => Number.parseInt(c.index) === Number.parseInt(selectedInstance))?.files || [];
					const fileInfo = await Promise.all(filesWithClones.map(async (file) => {
						const { content } = await loadFileContent(owner, name, file.filePath, hash);
						return { path: file.filePath, content, from: file.start_line, to: file.end_line };
					}));
					setFiles(fileInfo);
				}
			} catch {
				error();
			}

			setIsLoading(false);
		})();
	}, [clonesInfo?.clones, error, hash, name, owner, selectedInstance, showDiff]);

	useEffect(() => {
		const parsed = queryString.parse(search);
		if (parsed?.cloneInstance
			&& clonesInfo?.clones?.[showDiff ? "introduced" : "current"]?.length !== 0
			&& parsed?.cloneInstance < clonesInfo?.clones?.current?.length
			&& parsed?.cloneInstance !== selectedInstance
		) {
			setFiles([]);
			setSelectedInstance(parsed.cloneInstance);
		}
	}, [clonesInfo?.clones, search, selectedInstance, showDiff]);

	if (!owner && !name && !hash) return

	return (
		<>
			<Grid container display="flex" direction="column">
				<Grid item direction="column" sx={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
					{Object.entries(metrics).map(([key, metrics]) => 
						<Grid container key={key} sx={{ padding: '16px', display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
							{Object.entries(metrics).map(([key, metric]) => (
								<Grid item key={key} xs={12} sm={6} md={3}
									sx={{
										padding: "1rem",
										display: 'flex',
										justifyContent: 'center',
										alignItems: 'center',
									}}
								>
									<GeneralInfoTile
										key={key}
										content={key}
										number={Number.parseFloat(metric.main)}
										added={metric.added}
										removed={metric.removed}
										percent={metric.percent}
									/>
								</Grid>
							))}
						</Grid>
					)}
				</Grid>
			</Grid>
			<Grid item hidden={selectedInstance === "DefaultCloneInstance"} xs={12}sm="auto"sx={{ flex: "1 1 auto",textAlign: { xs: "center", sm: "left" } }} >
				<BackToFilesButton
					onClick={() => { setSelectedInstance("DefaultCloneInstance") } }
				/>
			</Grid>
			<Grid container item flexDirection="row" alignItems="center" justifyContent="center" gap={1} m={-1}>
				<Grid item>
					<Typography variant="h6" fontWeight="bold" color="primary">{"Review Clone Instance:"}</Typography>
				</Grid>
				{isLoading || isClonesLoading ? 
					<CircularProgress/>
					:
					<Grid item xs={12} hidden={selectedInstance !== "DefaultCloneInstance"}>
						<DuplicatesTables
							clonesData={clonesInfo.clones || {}}
							diff={showDiff}
							isError={isError}
						/>
					</Grid>
				}
			</Grid>
			{files.length > 0 && (
				<Box>
					<Typography fontWeight="bold">{"Involved Files:"}</Typography>
					<Box borderRadius={1} bgcolor="cardBackgroundLight.main" mt={1} mb={2} px={1} pb={1}>
						{files.map((file, ind) => (
							<Typography key={`duplicate_name_${file.path}_${ind}`} pt={1}>
								{`${ind + 1}. `}
								<Link underline="none" href={`#dup-${ind + 1}`}>
									{file.path}
								</Link>
							</Typography>
						))}
					</Box>
				</Box>
			)}
			{files.map((file, ind) => (
				<Grid
					key={`file_editor_${file.path}_${ind}`}
					container
					id={`dup-${ind + 1}`}
					direction="column"
					justifyContent="flex-start"
					spacing={2}
					m={-1}
					mb={1}
					sx={{ "> .MuiGrid-item": { p: 1 } }}
				>
					<Grid item>
						<Typography fontWeight="bold" style={{ display: "inline-flex" }}>
							{"File:"}
							&nbsp;
						</Typography>
						<Typography fontWeight="bold" style={{ display: "inline-flex" }}>
							{file.path}
						</Typography>
					</Grid>
					<Grid item style={{ zIndex: 0, maxWidth: "100%" }}>
						<BorderBox sx={{ p: 0 }}>
							<CodeViewer
								value={file.content}
								language={(language || "Java").toLowerCase()}
								onCreateEditor={(view, state) => {
									view.removeAllFolds();
									view.removeAllMarks();
									const timer = setTimeout(() => {
										try {
											if (file.content !== "You don’t have permission to view this file.") view.addMarks(file.from, file.to);
											view?.fold(1, Math.max(1, Number(file.from) - 5));
											view?.fold(Math.min(Number(file.to) + 5, state.doc.lines), state.doc.lines);
										} catch { /** empty */ }
									}, 1);
									return () => clearTimeout(timer);
								}}
							/>
						</BorderBox>
					</Grid>
				</Grid>
			))}
		</>
	);
};

Duplicates.propTypes = {
	repository: PropTypes.object.isRequired,
	analysis: PropTypes.object.isRequired,
	hash: PropTypes.string.isRequired,
};

export default memo(Duplicates);
