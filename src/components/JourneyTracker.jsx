import { useEffect, useRef, useMemo } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import queryString from "query-string";

import { registerJourney } from "#api";

const JourneyTracker = ({ decodedToken, children }) => {
	const { search } = useLocation();
	const lastPathnameRef = useRef();
	const parsedQuery = useMemo(() => queryString.parse(search), [search]);

	useEffect(() => {
		if (!decodedToken?.customToken && parsedQuery.tab !== lastPathnameRef.current) {
			try {
				const pageKey = parsedQuery.tab;

				if (pageKey) {
					const group = "companion";
					(async () => {
						try {
							await registerJourney({ pageKey, group });
							lastPathnameRef.current = pageKey; // Update the ref after successful registration
						} catch {
							// Handle error
						}
					})();
				}
			} catch { /* */ }
		}
	}, [decodedToken?.customToken, parsedQuery.tab]);

	return children;
};

JourneyTracker.propTypes = {
	children: PropTypes.node.isRequired,
	decodedToken: PropTypes.object,
};

export default JourneyTracker;
