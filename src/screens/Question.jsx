import { memo, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Grid, Typography, Box } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { SecondaryBackgroundButton, SecondaryBorderButton, ThirdBackgroundButton } from "../components/Buttons.jsx";
import CodeEditor from "../components/CodeEditor.jsx";
import Form from "../components/Form.jsx";
import FindingsTable from "../components/FindingsTable.jsx";
import Popup from "../components/Popup.jsx";
import Spinner from "../components/Spinner.jsx";
import Switch from "../components/Switch.jsx";
import { useSnackbar } from "../utils/index.js";
import useGlobalState from "../use-global-state.js";
import { getQuestion, getSimilarSnippets, postToLLM, postToQuality, explainLLM } from "../api/index.js";

const useStyles = makeStyles((theme) => ({
	root: {
		padding: theme.spacing(2),
		display: "flex",
		flexDirection: "column",
		justifyContent: "center",
		marginLeft: "auto",
		marginRight: "auto",
	},
	card: {
		width: "700px",
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		marginLeft: "auto",
		marginRight: "auto",
		backgroundColor: "white",
		borderRadius: "10px",
	},
	title: {
		textAlign: "left",
		fontWeight: "bold",
		fontSize: "1.5rem",
		lineHeight: "1.2",
	},
	subtitle: {
		textAlign: "justify",
		fontSize: "1rem",
	},
	main: {
		display: "flex",
		alignItems: "center",
		flexDirection: "column",
	},
	buttonArea: {
		display: "flex",
		justifyContent: "flex-end",
		margin: "10px 0px"
	},
	recommendationsButtonArea: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		margin: "10px 0px",
	},
	recommendationsTitle: {
		fontSize: "1.5rem",
		fontWeight: "bold",
		color: theme.palette.secondary.main,
	},
	secondButton: {
		marginLeft: "10px",
	},
}));

const wrapIndex = (i, length) => length > 0 ? ((i % length) + length) % length : 0;

const Question = () => {
	const classes = useStyles();
	const { index } = useParams();
	const navigate = useNavigate();
	const { error } = useSnackbar();
	const [question, setQuestion] = useState({});
	const [code, setCode] = useState("");
	const [quality, setQuality] = useState([]);
	const [hasNext, setHasNext] = useState(false);
	const [step, setStep] = useState(0);
	const [llmPopupOpen, setLlmPopupOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [similarSnippetsFetched, setSimilarSnippetsFetched] = useState(false);
	const [similarSnippets, setSimilarSnippets] = useState([]);
	const [model, setModel] = useState("llama");
	const [recommendationIndex, setRecommendationIndex] = useState(0);
	const id = useGlobalState((state) => state.id);

	// helper for circular index

	const fetchQuestion = async () => {
		setIsLoading(true);
		const { success: fetchSuccess, question, hasNext: hasNextQuestion } = await getQuestion(index);
		if (fetchSuccess) {
			setQuestion(question);
			setCode(question?.code || "");
			setQuality(question?.analysis || []);
			setHasNext(hasNextQuestion);
		} else {
			error("Error while retrieving question");
		}
		setIsLoading(false);
	};

	const fetchSimilarSnippets = async (isBadExample) => {
		setIsLoading(true);
		const { success: fetchSuccess, message, similarSnippets: fetchedSimilarSnippets } = await getSimilarSnippets(question?.code, question?._id, id, model, isBadExample);
		if (fetchSuccess) {
			setSimilarSnippetsFetched(true);
			setSimilarSnippets(fetchedSimilarSnippets);
			setRecommendationIndex(0);
		} else {
			error(message);
		}
		setIsLoading(false);
	};

	useEffect(() => {
		fetchQuestion();
		setStep(1);
		setSimilarSnippetsFetched(false);
		setSimilarSnippets([]);
		setRecommendationIndex(0);
		setLlmPopupOpen(false);
	}, [index]); // eslint-disable-line react-hooks/exhaustive-deps

	const llmFormContent = [
		{
			customType: "input",
			id: "query",
			type: "text",
			multiline: true,
			placeholder: "Your Query",
			minRows: 5,
		},
		{
			customType: "radio",
			id: "llm",
			label: "Select the LLM to use",
			color: "secondary",
			defaultValue: "claude",
			row: true,
			items: [
				{ value: "gpt", label: "GPT" },
				{ value: "claude", label: "Claude" },
			],
		},
		{
			customType: "button",
			id: "submit",
			type: "submit",
			text: "Submit",
			color: "third",
		},
	];

	const onLLMSubmit = async (values) => {
		setIsLoading(true);
		const { llm, query } = values;
		const { success: postSuccess, message, ...response } = await postToLLM(
			llm,
			question?.code,
			query,
			question?._id,
			id
		);
		if (postSuccess) {
			const { code: { new: newCode } = {} } = response;
			if (newCode) setCode(newCode);
			setLlmPopupOpen(false);
		} else {
			error(message);
		}
		setIsLoading(false);
	};

	const onExplainSubmit = async (values) => {
		setIsLoading(true);
		const { llm, query } = values;
		const { success: postSuccess, message, ...response } = await explainLLM(
			llm,
			question?.code,
			query,
			question?._id,
			id,
			question?.description,
			question?.analysis,
		);
		if (postSuccess) {
			const { code: { new: newCode } = {} } = response;
			if (newCode) setCode(newCode);
			setLlmPopupOpen(false);
		} else {
			error(message);
		}
		setIsLoading(false);
	};

	const openLLMPopup = () => setLlmPopupOpen(true);

	const analyzeCode = async () => {
		setIsLoading(true);
		const { success: postSuccess, message, quality: newQuality } = await postToQuality(
			code,
			question?._id,
			id
		);
		if (postSuccess) {
			console.log(newQuality);
			setQuality(newQuality);
		} else {
			error(message);
		}
		setIsLoading(false);
	};

	const nextStep = () => {
		if (step < 3) {
			setStep(step + 1);
		} else if (hasNext) {
			navigate(`/question/${Number.parseInt(index) + 1}`);
		} else {
			navigate("../questionnaire");
		}
	};

	const previousStep = () => {
		if (step > 1) {
			setStep(step - 1);
		} else if (index > 1) {
			navigate(`/question/${Number.parseInt(index) - 1}`);
		} else {
			navigate("../profile");
		}
	};

	const backFromSnippets = () => {
		setSimilarSnippetsFetched(false);
		setRecommendationIndex(0);
	};

	const nextRecommendation = () => {
		if (similarSnippets.length > 0) {
			setRecommendationIndex(prev =>
				wrapIndex(prev + 1, similarSnippets.length)
			);
		}
	};

	const previousRecommendation = () => {
		if (similarSnippets.length > 0) {
			setRecommendationIndex(prev =>
				wrapIndex(prev - 1, similarSnippets.length)
			);
		}
	};

	return (
		<>
			<Spinner open={isLoading} />
			<Grid container item key={index} className={classes.root} xs={12} md={8}>
				{step === 1 && (
					<Grid item width="100%">
						<Typography variant="h6" className={classes.title}>
							{question?.question}
						</Typography>
						<Typography className={classes.subtitle}>
							{question?.description}
						</Typography>
						<Grid item className={classes.main}>
							<CodeEditor
								width="100%"
								height="400px"
								code={code}
								language="javascript"
								editable={false}
							/>
							<FindingsTable findings={quality} />
						</Grid>
					</Grid>
				)}

				{step === 2 && (
					<Grid item width="100%">
						<Typography variant="h6" className={classes.title}>
							{"Use an LLM to fix your code or try to fix it yourself"} 
						</Typography>
						<Typography className={classes.subtitle}>
							{question?.question}
						</Typography>
						<Grid item className={classes.buttonArea}>
							<ThirdBackgroundButton
								title="Understand The Issue"
								onClick={onExplainSubmit}
							/>
							<ThirdBackgroundButton
								title="Use an LLM"
								className={classes.secondButton}
								onClick={openLLMPopup}
							/>
							<ThirdBackgroundButton
								title="Analyze The Code"
								className={classes.secondButton}
								onClick={analyzeCode}
							/>
						</Grid>
						<Grid item className={classes.main}>
							<CodeEditor
								width="100%"
								height="400px"
								code={code}
								language="javascript"
								editable={true}
								setCode={setCode}
							/>
							<FindingsTable findings={quality} />
						</Grid>
						<Popup
							width="auto"
							title="Write your query towards the LLM"
							titleBackgroundColor="primary"
							backgroundColor="white.main"
							open={llmPopupOpen}
							onClose={() => setLlmPopupOpen(false)}
						>
							<Grid item className={classes.card}>
								<Form
									content={llmFormContent}
									validationSchema="llmQuery"
									toResetForm={false}
									onSubmit={onLLMSubmit}
								/>
							</Grid>
						</Popup>
					</Grid>
				)}

				{step === 3 && (
					<Grid item width="100%">
						<Typography variant="h6" className={classes.title}>
							{"Use the BroLine to fix the issue"}
						</Typography>
						<Typography className={classes.subtitle}>
							{question?.question}
						</Typography>

						{!similarSnippetsFetched && (
							<Grid item className={classes.recommendationsButtonArea}>
								<Typography className={classes.recommendationsTitle}>
									{"Initial Code Snippet:"}
								</Typography>
								<Box display="flex" alignItems="center">
									<Typography color="primary">{"Claude"}</Typography>
									<Switch
										color="secondary"
										checked={model === "llama"}
										size="small"
										onChange={() => setModel(m => (m === "claude" ? "llama" : "claude"))}
									/>
									<Typography color="primary">{"Llama"}</Typography>
								</Box>
								<ThirdBackgroundButton
									title="Fetch Fixes"
									width="250px"
									onClick={() => fetchSimilarSnippets(false)}
								/>
							</Grid>
						)}

						{similarSnippetsFetched && (
							<Grid item className={classes.recommendationsButtonArea}>
								<Typography className={classes.recommendationsTitle}>
									{`Fix ${recommendationIndex + 1}`} 
								</Typography>
								<Box>
									<SecondaryBackgroundButton title="Return" onClick={backFromSnippets} className={classes.secondButton} />
									<ThirdBackgroundButton
										title="Previous Suggestion"
										width="250px"
										className={classes.secondButton}
										onClick={previousRecommendation}
									/>
									<ThirdBackgroundButton
										title="Next Suggestion"
										width="200px"
										className={classes.secondButton}
										onClick={nextRecommendation}
									/>
								</Box>
							</Grid>
						)}

						<Grid item className={classes.main}>
							<CodeEditor
								width="100%"
								height="400px"
								code={
									similarSnippetsFetched
										? similarSnippets[recommendationIndex].code
										: question?.code || ""
								}
								language="javascript"
								editable={false}
							/>
							<FindingsTable findings={similarSnippetsFetched
								? similarSnippets[recommendationIndex].quality
								: question?.quality || ""} />
						</Grid>
					</Grid>
				)}

				<Grid item className={classes.buttonArea}>
					<SecondaryBorderButton
						title={
							step === 1 && index === "1"
								? "Profile"
								: step === 1
									? "Previous Question"
									: step === 2
										? "Initial Code Snippet"
										: "Edit"
						}
						onClick={previousStep}
					/>
					<SecondaryBackgroundButton
						title={
							step === 1
								? "Edit"
								: step === 2
									? "BroLine Recommendations"
									: hasNext
										? "Next Question"
										: "Questionnaire"
						}
						className={classes.secondButton}
						onClick={nextStep}
					/>
				</Grid>
			</Grid>
		</>
	);
};

export default memo(Question);
