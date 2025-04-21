import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { shallow } from "zustand/shallow";

import useGlobalState from "../use-global-state.js";
import { useUser } from "#api";

const Protected = ({ c }) => {
	const { id } = useGlobalState((e) => ({
		id: e.id,
	}), shallow);

	const { user = {} } = useUser(id);
	
	console.log(user, 11)
	return user ? c : <Navigate replace to="/login" state={{ from: location }} />;
};

Protected.propTypes = { c: PropTypes.node.isRequired };

export default Protected;
