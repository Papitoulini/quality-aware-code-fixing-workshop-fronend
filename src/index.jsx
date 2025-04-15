import './sentry'; // Ensure this is the first import
import { lazy, StrictMode, Suspense, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Route, useLocation, Routes, BrowserRouter as Router } from "react-router-dom";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import ReactGA from "react-ga";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { SWRConfig } from "swr";
import { ErrorBoundary } from "react-error-boundary";
import { Box, CircularProgress, CssBaseline, Grid } from "@mui/material";

import "./index.scss";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Protected from "./components/Protected.jsx";
import GuestOnly from "./components/GuestOnly.jsx";
import ErrorFallback from "./components/ErrorFallback.jsx";
import Snackbar from "./components/Snackbar.jsx";
import theme from "./theme.js";
import JourneyTracker from "./components/JourneyTracker.jsx";

import api from "#api";
import { jwt, useDocumentTitle } from "#utils";

const DeveloperProfile = lazy(() => import("./screens/DeveloperProfile.jsx"));
const Auth = lazy(() => import("./screens/Auth.jsx"));
const NotFound = lazy(() => import("./screens/NotFound.jsx"));
const SignIn = lazy(() => import("./screens/SignIn.jsx"));
const Repositories = lazy(() => import("./screens/Repositories/index.jsx"));
const InternalId = lazy(() => import("./screens/InternalId/index.jsx"));

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

ReactGA.initialize("UA-146478265-3", { testMode: !(import.meta.env.PROD ?? true) });
const swrConfig = { revalidateOnFocus: false, shouldRetryOnError: false, fetcher: (url) => api.get(url) };

const App = () => {
	useDocumentTitle("Cyclopt");
	const { pathname } = useLocation();
	const token = jwt.getToken();

	useEffect(() => {
		window.scrollTo(0, 0);
		ReactGA.set({ page: pathname, anonymizeIp: true });
		ReactGA.pageview(pathname);
	}, [pathname]);

	useEffect(() => {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.ready.then((registration) => {
				registration.unregister();

				if (caches) {
					caches.keys().then(async (names) => {
						await Promise.all(names.map((name) => caches.delete(name)));
					});
				}
			});
		}
	}, []);

	return (
		<JourneyTracker decodedToken={token ? jwt.decode(token) : null}>
			<StyledEngineProvider injectFirst>
				<CssBaseline />
				<ThemeProvider theme={theme}>
					<ErrorBoundary resetKeys={[globalThis.location.pathname]} FallbackComponent={ErrorFallback}>
						<SWRConfig value={swrConfig}>
							<LocalizationProvider dateAdapter={AdapterDayjs}>
								<Grid style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
									{((jwt.isAuthenticated() || pathname !== "/") && !pathname.includes("microsoft-marketplace")) && (<Header />)}
									<main style={{ zIndex: 0, flexGrow: 1, display: "flex", flexDirection: "column" }}>
										<Suspense
											fallback={(
												<Box sx={{ m: 1, display: "flex", justifyContent: "center" }}>
													<CircularProgress color="secondary" />
												</Box>
											)}
										>
											<Routes>
												<Route path="/developer/:developerId" element={<DeveloperProfile />} />
												<Route index element={<GuestOnly c={<SignIn />} />} />
												<Route path="overview" element={<Protected c={<Repositories />} />} />
												<Route path="/:owner/:name/:hash?" element={<Protected c={<Repositories />} />} />
												<Route path="/:internalId" element={<InternalId />} />
												<Route path="auth" element={<GuestOnly c={<Auth />} />} />
												<Route path="*" element={<Protected c={<NotFound />} />} />
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
		</JourneyTracker>
	);
};

const container = document.querySelector("#root");
const root = createRoot(container);
root.render(<StrictMode><Router><App /></Router></StrictMode>);
