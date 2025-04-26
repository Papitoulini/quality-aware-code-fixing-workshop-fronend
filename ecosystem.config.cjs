module.exports = {
  apps : [{
    name   : "workshop-frontend",
		script: "npm",
		args: ["run", "serve"],
		instances: 1,
		exec_mode: "cluster",
  }]
}
