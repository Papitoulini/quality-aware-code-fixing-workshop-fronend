import './sentry'; // Ensure this is the first import
import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { SWRConfig } from "swr";
import { ErrorBoundary } from "react-error-boundary";
import { Box, CircularProgress, CssBaseline, Grid } from "@mui/material";

import "./index.scss";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
// import Protected from "./components/Protected.jsx";
// import GuestOnly from "./components/GuestOnly.jsx";
import ErrorFallback from "./components/ErrorFallback.jsx";
import Snackbar from "./components/Snackbar.jsx";
import theme from "./theme.js";

import api from "#api";
import { useDocumentTitle } from "#utils";

// const Auth = lazy(() => import("./screens/Auth.jsx"));
const Question = lazy(() => import("./screens/Question.jsx"));
const Login = lazy(() => import("./screens/Login.jsx"));
// const Tabs = lazy(() => import("./screens/Tabs/index.jsx"));
const Home = lazy(() => import("./screens/Home.jsx"));

function at(n) {
	n = Math.trunc(n) || 0;
	if (n < 0) n += this.length;
	return n >= 0 && n < this.length ? this[n] : undefined;
}

const TypedArray = Reflect.getPrototypeOf(Int8Array);
for (const C of [Array, String, TypedArray]) {
	Object.defineProperty(C.prototype, "at", {
		value: at,
		writable: true,
		enumerable: false,
		configurable: true,
	});
}

globalThis.global = globalThis;

const swrConfig = { revalidateOnFocus: false, shouldRetryOnError: false, fetcher: (url) => api.get(url) };

const App = () => {
	useDocumentTitle("Workshop");

	return (
		<StyledEngineProvider injectFirst>
			<CssBaseline />
			<ThemeProvider theme={theme}>
				<ErrorBoundary resetKeys={[globalThis.location.pathname]} FallbackComponent={ErrorFallback}>
					<SWRConfig value={swrConfig}>
						<LocalizationProvider dateAdapter={AdapterDayjs}>
							<Grid style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
								<Header />
								<main style={{ zIndex: 0, flexGrow: 1, display: "flex", flexDirection: "column" }}>
									<Suspense
										fallback={(
											<Box sx={{ m: 1, display: "flex", justifyContent: "center" }}>
												<CircularProgress color="secondary" />
											</Box>
										)}
									>
										<Routes>
											{/* <Route index element={<GuestOnly c={<SignIn />} />} /> */}
											<Route index element={<Home /> } />
											<Route path="/login" element={<Login />} />
											<Route path="question/:index" element={<Question />} />
											{/* <Route path="/login" element={<Protected c={<Tabs />} />} />
											<Route path="auth" element={<GuestOnly c={<Auth />} />} />
											<Route path="*" element={<Protected c={<NotFound />} />} /> */}
										</Routes>
									</Suspense>
								</main>
								<Footer />
								<Snackbar />
							</Grid>
						</LocalizationProvider>
					</SWRConfig>
				</ErrorBoundary>
			</ThemeProvider>
		</StyledEngineProvider>
	);
};

const container = document.querySelector("#root");
const root = createRoot(container);
root.render(<StrictMode><Router><App /></Router></StrictMode>);
