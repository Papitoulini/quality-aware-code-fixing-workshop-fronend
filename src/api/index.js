import ky from "ky";
import queryString from "query-string";
import useSWR from "swr";

const {
	VITE_SERVER_URL,
	VITE_SERVER_USERNAME,
	VITE_SERVER_PASSWORD,
} = import.meta.env;

const rootApi = ky.extend({
	timeout: false,
	prefixUrl: `${VITE_SERVER_URL}/api`,
	retry: {
		statusCodes: [401, 408, 413, 429, 502, 503, 504],
		limit: 2,
		methods: ["get", "post", "put", "head", "delete", "options", "trace"],
	},
	hooks: {
		beforeRequest: [(request) => {
			const token = btoa(`${VITE_SERVER_USERNAME}:${VITE_SERVER_PASSWORD}`);

			console.log(token, 33);
			// set the standard header
			request.headers.set("authorization", `Basic ${token}`);
		}],
		afterResponse: [
			(_req, _opts, res) => {
				const { status } = res;
				if (status === 500) {
					return new Response(JSON.stringify({ success: false }), { status: 200 });
				}
				if ([400, 404, 500].includes(status)) {
					return new Response(JSON.stringify({ success: false }), { status: 200 });
				}

				return res;
			},
		],
	},
});

const api = {
	get: (path, searchParams) => rootApi.get(path, { searchParams: queryString.stringify(searchParams) }).json(),
	post: (path, json) => rootApi.post(path, { json }).json(),
	put: (path, json) => rootApi.put(path, { json }).json(),
	patch: (path, json) => rootApi.patch(path, { json }).json(),
	delete: (path, json) => rootApi.delete(path, { json }).json(),
};

export default api;

const is = (data, error) => ({ isLoading: !error && !data, isError: Boolean(error) });

export const useUser = (id) => {
	const url = `user/${id}`;
	const { data, error, mutate } = useSWR(url);
	return { user: data?.user, ...is(data?.success, error), mutate };
};

export const register = (data) => api.post("user/register", data);
export const getUser = (id) => api.get(`user/${id}`);
export const postQuestionnaire = (data, id) => api.post("questionnaire", { id, ...data });
export const getQuestionnaire = (id) => api.get(`questionnaire/${id}`);
export const getQuestion = (id) => api.get(`question/${id}`);
export const explainLLM = (model, code, query, questionId, userId, description, analysis) => {
	const path = `llms/claude/explain`;
	const formData = new FormData();
	const blob = new Blob([code], { type: 'application/javascript' });
	formData.append('query', query);
	formData.append('questionId', questionId);
	formData.append('userId', userId);
	formData.append('description', description);
	formData.append('analysis', analysis);
	formData.append('file', blob, 'file.js');
	return rootApi.post(path, { body: formData }).json();
};
export const postToLLM = (model, code, query, questionId, userId) => {
	const path = `llms/${model}`;
	const formData = new FormData();
	const blob = new Blob([code], { type: 'application/javascript' });
	formData.append('query', query);
	formData.append('questionId', questionId);
	formData.append('userId', userId);
	formData.append('file', blob, 'file.js');
	return rootApi.post(path, { body: formData }).json();
};
export const postToQuality = (code, questionId, userId) => {
	const formData = new FormData();
	const blob = new Blob([code], { type: 'application/javascript' });
	formData.append('questionId', questionId);
	formData.append('userId', userId);
	formData.append('file', blob, 'file.js');
	return rootApi.post("quality", { body: formData }).json();
};
export const getSimilarSnippets = (code, questionId, userId, model, isBadExample) => {
	const formData = new FormData();
	const blob = new Blob([code], { type: 'application/javascript' });
	formData.append('questionId', questionId);
	formData.append('userId', userId);
	formData.append('model', model);
	formData.append('isBadExample', isBadExample);
	formData.append('file', blob, 'file.js');
	return rootApi.post("quoly", { body: formData }).json();
};
