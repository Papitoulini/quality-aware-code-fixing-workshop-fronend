import { get, set, del } from "idb-keyval";
import { createWithEqualityFn } from "zustand/traditional";
import { createJSONStorage, persist } from "zustand/middleware";

export default createWithEqualityFn(persist((setState) => ({
	defaultPageOptions: { page: 0, pageSize: 10 },
	setDefaultPageOptions: (defaultPageOptions) => setState({ defaultPageOptions }),
}), { name: "cyclopt", storage: createJSONStorage(() => ({ getItem: get, setItem: set, removeItem: del })) }));
