import * as Yup from "yup";

const fullname = Yup
	.string()
	.required("Το ονοματεπώνυμο είναι υποχρεωτικό");

const email = Yup
	.string()
	.email("Λανθασμένη μορφή email")
	.required("Το email είναι υποχρεωτικό");

const programmingExperience = Yup
	.number()
	.required("Το πεδίο είναι υποχρεωτικό");

const qualityImprovement = Yup
	.number()
	.required("Το πεδίο είναι υποχρεωτικό");

const quolyRecommendations = Yup
	.number()
	.required("Το πεδίο είναι υποχρεωτικό");

const llmExperience = Yup
	.number()
	.required("Το πεδίο είναι υποχρεωτικό");

const quolyLlmExperience = Yup
	.number()
	.required("Το πεδίο είναι υποχρεωτικό");

const quolyLlmQuality = Yup
	.number()
	.required("Το πεδίο είναι υποχρεωτικό");

const susQuestions = Yup
	.number()
	.required("Το πεδίο είναι υποχρεωτικό");

const query = Yup
	.string()
	.required("Το πεδίο είναι υποχρεωτικό");

const code = Yup
	.string()
	.required("Το πεδίο είναι υποχρεωτικό");

const schemas = {
	userRegistration: Yup.object({
		fullname,
		email,
		code,
		programmingExperience,
	}),
	userLogIn: Yup.object({
		email,
		code,
	}),
	questionnaire: Yup.object({
		qualityImprovement,
		quolyRecommendations,
		llmExperience,
		quolyLlmExperience,
		quolyLlmQuality,
		sus1: susQuestions,
		sus2: susQuestions,
		sus3: susQuestions,
		sus4: susQuestions,
		sus5: susQuestions,
		sus6: susQuestions,
		sus7: susQuestions,
		sus8: susQuestions,
		sus9: susQuestions,
		sus10: susQuestions,
	}),
	llmQuery: Yup.object({
		query,
	}),
};

export default schemas;
