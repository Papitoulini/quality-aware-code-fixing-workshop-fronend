import Cookie from "js-cookie";

const cookie = Cookie
	.withAttributes({
		sameSite: "lax",
		secure: import.meta.env.PROD ?? true,
		path: "/",
	})
	.withConverter({
		read(value, name) {
			if (name === "_cyclopt_selfhosted") return JSON.parse(value || null);
			return Cookie.converter.read(value, name);
		},
		write(value, name) {
			if (name === "_cyclopt_selfhosted") return JSON.stringify(value || null);
			return Cookie.converter.write(value, name);
		},
	});

export default cookie;
