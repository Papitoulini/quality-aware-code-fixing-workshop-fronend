export default {
	apps: [ {
		name: "client",
		script: "npm",
		args: ["run", "dev"], // Updated to match "dev" script in your package.json
		instances: 2,
		exec_mode: "cluster",
	},],
};
