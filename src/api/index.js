import useSWR from "swr";
// import useSWRImmutable from "swr/immutable";
import ky from "ky";
import queryString from "query-string";
import constructUrl from "@iamnapo/construct-url";

import { cookie, jwt } from "#utils";

const kyInstance = ky.extend({
	timeout: false,
	prefixUrl: constructUrl(import.meta.env.VITE_MAIN_SERVER_URL),
	retry: {
		statusCodes: [401, 408, 413, 429, 502, 503, 504],
		limit: 2,
		methods: ["get", "post", "put", "head", "delete", "options", "trace"],
	},
	hooks: {
		beforeRequest: [(request) => {
			const token = jwt.getToken();
			const refreshToken = jwt.getRToken();
			if (token) request.headers.set("x-access-token", token);
			if (refreshToken) request.headers.set("x-refresh-token", refreshToken);
		}],
	},
	...(import.meta.env.VITE_SENTRY_ENVIRONMENT === "develop" ? { cache: "no-store" } : {}), // This disables caching
});

const rootApi = kyInstance.extend({
	hooks: {
		beforeRetry: [
			async ({ request: { method }, error }) => {
				if (error?.response?.status === 401) {
					const res = await kyInstance.extend({ throwHttpErrors: false, retry: 0 }).get("api/refresh");
					if (res.status === 401) {
						jwt.destroyTokens();
						cookie.remove("_cyclopt_selfhosted");
						globalThis.location.href = "/";
					} else {
						const { token } = await res.json();
						jwt.setToken(token);
					}
				} else if (method === "POST") {
					throw error;
				}
			},
		],
	},
});

const api = {
	get: (path, searchParams) => rootApi.get(path, { searchParams: queryString.stringify(searchParams) }).json(),
	post: (path, json, searchParams) => rootApi.post(path, { json, searchParams }).json(),
	put: (path, json, searchParams) => rootApi.put(path, { json, searchParams }).json(),
	patch: (path, json, searchParams) => rootApi.patch(path, { json, searchParams }).json(),
	delete: (path, json, searchParams) => rootApi.delete(path, { json, searchParams }).json(),
};

export default api;

const is = (data, error) => ({ isLoading: !error && !data, isError: Boolean(error) });

export const useBackendVersion = () => {
	const url = "api/version/";
	const { data, error, mutate } = useSWR(url);
	return { version: data, ...is(data, error), mutate };
};

export const useRepositories = () => {
	const url = "api/companion/repositories/";
	const { data, error, mutate } = useSWR(url);
	return { repositories: data, ...is(data, error), mutate };
};

export const useVulnerabilities = (hash, repository = {}) => {
	const url = `api/companion/repositories/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/vulnerabilities`;
	const { data, error, mutate } = useSWR(repository.name && repository.name && hash ? [url, JSON.stringify(repository), hash] : null, () => api.get(url, { hash, ...repository }));
	return { vulnerabilitiesInfo: data, ...is(data, error), mutate };
};

export const useCoverage = (hash, repository = {}) => {
	const url = `api/companion/repositories/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/coverage`;
	const { data, error, mutate } = useSWR(repository.name && repository.name && hash ? [url, JSON.stringify(repository), hash] : null, () => api.get(url, { hash, ...repository }));
	return { coverage: data, ...is(data, error), mutate };
};

export const useViolations = (hash, repository = {}) => {
	const url = `api/companion/repositories/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/violations`;
	const { data, error, mutate } = useSWR(repository.name && repository.name && hash? [url, JSON.stringify(repository), hash] : null, () => api.get(url, { hash, ...repository }));
	return { violationsInfo: data, ...is(data, error), mutate };
};

export const useDuplicates = (hash, repository = {}) => {
	const url = `api/companion/repositories/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/duplicates`;
	const { data, error, mutate } = useSWR(repository.name && repository.name && hash ? [url, JSON.stringify(repository), hash] : null, () => api.get(url, { hash, ...repository }));
	return { clonesInfo: data, ...is(data, error), mutate };
};

export const useSast = (hash, repository = {}) => {
	const url = `api/companion/repositories/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/weekly-overview`;
	const { data, error, mutate } = useSWR(repository.name && repository.name && hash ? [url, JSON.stringify(repository), hash] : null, () => api.get(url, { hash, ...repository }));
	return { overview: data, ...is(data, error), mutate };
};

export const useOverview = (hash, repository = {}) => {
	const url = `api/companion/repositories/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/overview`;
	const { data, error, mutate } = useSWR(repository.name && repository.name && hash? [url, JSON.stringify(repository), hash] : null, () => api.get(url, { hash, ...repository }));
	return { overview: data, ...is(data, error), mutate };
};

export const useFileContent = (owner, name, filename, hash) => {
	const url = `api/companion/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/file`;
	const { data, error, mutate } = useSWR(
		owner && name && filename && hash ? [url, filename, hash] : null,
		() => api.get(url, { filename, hash }),
	);
	return { fileContent: data?.content, ...is(data, error), mutate };
};

export const useCommit = (hash, repository = {}) => {
	const url = `api/companion/repositories/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.name)}/commit`;
	const { data, error, mutate } = useSWR(
		repository.name && repository.name ? [hash, url, JSON.stringify(repository)] : null,
		() => api.get(url, { hash, ...repository }),
	);
	return { commit: data, ...is(data, error), mutate };
};

export const useTddFilename = (internalId, token) => {
	const url = `api/tdd/?internalId=${internalId}&token=${token}`;
	const { data, error, mutate } = useSWR(url);
	return { response: data, ...is(data, error), mutate };
};

export const useTddMetrics = (internalId, token) => {
	const url = `api/tdd/metrics/?internalId=${internalId}&token=${token}`;
	const { data, error, mutate } = useSWR(url);
	return { data, ...is(data, error), mutate };
};

export const useTddViolations = (internalId, token) => {
	const url = `api/tdd/violations/?internalId=${internalId}&token=${token}`;
	const { data, error, mutate } = useSWR(url);
	return { data, ...is(data, error), mutate };
};

export const useTddDuplicates = (internalId, token) => {
	const url = `api/tdd/duplicates/?internalId=${internalId}&token=${token}`;
	const { data, error, mutate } = useSWR(url);
	return { data, ...is(data, error), mutate };
};

export const useTddVulnerabilities = (internalId, token) => {
	const url = `api/tdd/vulnerabilities/?internalId=${internalId}&token=${token}`;
	const { data, error, mutate } = useSWR(url);
	return { data, ...is(data, error), mutate };
};

export const useTddSast = (internalId, token) => {
	const url = `api/tdd/sast/?internalId=${internalId}&token=${token}`;
	const { data, error, mutate } = useSWR(url);
	return { data, ...is(data, error), mutate };
};

export const useDeveloperData = (userId, isInEditMode) => {
	const url = `api/companion/developer/${userId}`;
	const { data, error, mutate, isValidating } = useSWR([url, isInEditMode], () => api.get(url, { isInEditMode }));// useSWR(url, { isInEditMode });
	return { developerData: data, ...is(data, error, isValidating), mutate };
};

export const useDeveloperHistoryStatus = () => {
	const url = `api/companion/developer/button/is_calculating`;
	const { data, error, mutate, isValidating } = useSWR(url);// useSWR(url, { isInEditMode });
	return { status: data, ...is(data, error, isValidating), mutate };
};

export const updateDeveloperData = (userId, dataToUpdate) => api.put(`api/companion/developer/${userId}`, { dataToUpdate });
export const updateDeveloperHistory = () => api.post(`api/companion/developer/button/calculate_stats`);

export const retrieveSelfHostInfo = (url) => api.post("api/self-host-info", { url });
export const loadFileContent = (owner, name, filename, hash) => api.get(`api/companion/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/file`, { filename, hash });
export const loadCommit = (owner, name, hash) => api.get(`api/companion/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/commit`, { hash });

export const registerJourney = ({ pageKey, group }) => api.post("api/panorama/users/register-journey", { pageKey, group });
