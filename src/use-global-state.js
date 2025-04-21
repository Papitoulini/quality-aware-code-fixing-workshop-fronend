import { create } from "zustand";
import { persist } from "zustand/middleware";

export default create(persist(
	(setState) => ({
		id: null,
		setId: (id) => setState({ id }),
	}),
	{
		name: "workshop",
	},
));
