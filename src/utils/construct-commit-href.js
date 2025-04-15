import cookie from "./cookie.js";

// check TFVC here

const constructCommitHref = (type, { owner, name, vcType }, hash) => {
	if (vcType === "tfvc") return `https://dev.azure.com/${owner}/_versionControl/changeset/${hash}`;
	if (type === "azure") return `https://dev.azure.com/${owner}/_git/${name}/commit/${hash}`;
	if (type === "tfs-prosvasis") return `http://tfs.prosvasis.net:8080/tfs/${owner}/_git/${name}/commit/${hash}`;

	let endPoint = `/${owner}/${name}/commits/${hash}`;
	if (type === "bitbucket") return `https://bitbucket.org${endPoint}`;

	endPoint = `/${owner}/${name}/commit/${hash}`;
	if (type === "github") return `https://github.com${endPoint}`;
	if (type === "gitlab") return `https://gitlab.com${endPoint}`;
	return `${cookie.get("_cyclopt_selfhosted")?.url || "https://gitlab.example.com"}${endPoint}`;
};

export default constructCommitHref;
