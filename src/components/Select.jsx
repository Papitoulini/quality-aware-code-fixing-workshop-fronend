import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import { Select as Select_, InputBase } from "@mui/material";

const BootstrapInput = styled(InputBase)(({ theme }) => ({
	width: "100%",
	"& .MuiInputBase-input": {
		padding: theme.spacing(1),
		position: "relative",
	},
}));

const BootStrapSelect = styled(Select_)(({ theme }) => ({
	"& .MuiSelect-select": {
		borderColor: theme.palette.primary.main,
		borderWidth: theme.spacing(0.2),
		borderStyle: "solid",
		borderRadius: theme.shape.borderRadius,
		"&:focus": {
			backgroundColor: `${theme.palette.common.white} !important`,
			borderRadius: theme.shape.borderRadius,
		},
	},
}));

const Select = ({ children, ...rest }) => (
	<BootStrapSelect
		displayEmpty
		input={<BootstrapInput />}
		variant="filled"
		{...rest}
	>
		{children}
	</BootStrapSelect>
);

Select.propTypes = { children: PropTypes.node };

export default Select;
