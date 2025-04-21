import { Typography, Button } from "@mui/material";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
	secondaryBackgroundButton: {
		backgroundColor: `${theme.palette.secondary.main}!important`,
		color: theme.palette.white.main,
		borderWidth: "2px",
		borderColor: theme.palette.secondary.main,
		cursor: "pointer",
		borderStyle: "solid",

		"&:hover": {
			backgroundColor: `${theme.palette.secondary.dark}!important`,
			borderColor: theme.palette.secondary.dark,
			color: theme.palette.white.main,
		},

		"&:disabled": {
			backgroundColor: `${theme.palette.secondary.dark}!important`,
			borderColor: theme.palette.secondary.dark,
			color: theme.palette.grey.main,
			cursor: "not-allowed",
		},
	},
	secondaryBorderButton: {
		backgroundColor: `transparent!important`,
		color: theme.palette.secondary.main,
		borderWidth: "2px",
		borderColor: theme.palette.secondary.main,
		borderStyle: "solid",

		"&:hover": {
			backgroundColor: `transparent!important`,
			borderColor: theme.palette.secondary.dark,
			color: theme.palette.secondary.dark,
		},

		"&:disabled": {
			backgroundColor: `transparent!important`,
			borderColor: theme.palette.secondary.dark,
			color: theme.palette.secondary.dark,
			cursor: "not-allowed",
		},
	},
	thirdBackgroundButton: {
		backgroundColor: `${theme.palette.third.main}!important`,
		color: theme.palette.white.main,
		borderWidth: "2px",
		borderColor: theme.palette.third.main,
		borderStyle: "solid",

		"&:hover": {
			backgroundColor: `${theme.palette.third.dark}!important`,
			borderColor: theme.palette.third.dark,
			color: theme.palette.white.main,
		},

		"&:disabled": {
			backgroundColor: `${theme.palette.third.dark}!important`,
			borderColor: theme.palette.third.dark,
			color: theme.palette.grey.main,
			cursor: "not-allowed",
		},
	},
	thirdBorderButton: {
		backgroundColor: `transparent!important`,
		color: theme.palette.third.main,
		borderWidth: "2px",
		borderColor: theme.palette.third.main,
		borderStyle: "solid",

		"&:hover": {
			backgroundColor: `transparent!important`,
			borderColor: theme.palette.third.dark,
			color: theme.palette.third.dark,
		},

		"&:disabled": {
			backgroundColor: `transparent!important`,
			borderColor: theme.palette.third.dark,
			color: theme.palette.third.dark,
			cursor: "not-allowed",
		},
	},
	whiteBorderButton: {
		backgroundColor: `transparent!important`,
		color: theme.palette.white.main,
		borderWidth: "2px",
		borderColor: theme.palette.white.main,
		borderStyle: "solid",

		"&:hover": {
			backgroundColor: `transparent!important`,
			borderColor: theme.palette.grey.dark,
			color: `${theme.palette.grey.dark}!important`,
			borderWidth: "2px",
			borderStyle: "solid",
		},

		"&:disabled": {
			backgroundColor: `transparent!important`,
			borderColor: theme.palette.grey.dark,
			color: theme.palette.grey.dark,
			cursor: "not-allowed",
		},
	},
}));

export const PrimaryBackgroundButton = ({
	id = "primary-background-button",
	type = "button",
	disabled = false,
	className = "",
	titleClassName = "",
	titleColor = "white",
	size = "",
	width = "200px",
	title = "Button",
	onClick,
}) => (
	<Button
		key={id}
		id={id}
		type={type}
		disabled={disabled}
		className={className}
		variant="contained"
		color="primary"
		size={(size || "")}
		style={{ ...(width && { width }) }}
		onClick={onClick}
	>
		<Typography className={titleClassName} sx={{ color: `${titleColor}!important` }} style={{ textTransform: "none" }}>
			<b>
				{title}
			</b>
		</Typography>
	</Button>
);

export const PrimaryBorderButton = ({
	id = "primary-border-button",
	type = "button",
	disabled = false,
	className = "",
	titleClassName = "",
	titleColor = "primary",
	size = "",
	width = "200px",
	title = "Button",
	backgroundColor = "white",
	onClick,
}) => (
	<Button
		key={id}
		id={id}
		type={type}
		disabled={disabled}
		className={className}
		variant="outlined"
		color="primary"
		size={(size || "")}
		style={{ ...(width && { width }), backgroundColor: (backgroundColor || "white"), borderWidth: "3px", borderColor: titleColor }}
		onClick={onClick}
	>
		<Typography className={titleClassName} sx={{ color: `${titleColor}!important` }} style={{ textTransform: "none" }}>
			<b>
				{title}
			</b>
		</Typography>
	</Button>
);

export const SecondaryBackgroundButton = ({
	id = "secondary-background-button",
	type = "button",
	disabled = false,
	className = "",
	titleClassName = "",
	titleColor = "white",
	size = "",
	width = "200px",
	title = "Button",
	onClick,
}) => {
	const classes = useStyles();

	return (
		<Button
			key={id}
			id={id}
			type={type}
			disabled={disabled}
			className={`${classes.secondaryBackgroundButton} ${className}`}
			variant="contained"
			color="secondary"
			size={(size || "")}
			style={{ ...(width && { width }) }}
			onClick={onClick}
		>
			<Typography className={titleClassName} sx={{ color: `${titleColor}!important` }} style={{ textTransform: "none" }}>
				<b>
					{title}
				</b>
			</Typography>
		</Button>
	);
};

export const SecondaryBorderButton = ({
	id = "secondary-border-button",
	type = "button",
	disabled = false,
	className = "",
	titleClassName = "",
	titleColor = "secondary",
	size = "",
	width = "200px",
	title = "Button",
	backgroundColor = "white",
	onClick,
}) => {
	const classes = useStyles();

	return (
		<Button
			key={id}
			id={id}
			type={type}
			disabled={disabled}
			className={`${classes.secondaryBorderButton} ${className}`}
			variant="outlined"
			color="secondary"
			size={(size || "")}
			style={{ ...(width && { width }), backgroundColor: (backgroundColor || "white") }}
			onClick={onClick}
		>
			<Typography className={titleClassName} sx={{ color: `${titleColor}!important` }} style={{ textTransform: "none" }}>
				<b>
					{title}
				</b>
			</Typography>
		</Button>
	);
};

export const ThirdBackgroundButton = ({
	id = "third-background-button",
	type = "button",
	disabled = false,
	className = "",
	titleClassName = "",
	titleColor = "white",
	size = "",
	width = "200px",
	title = "Button",
	onClick,
}) => {
	const classes = useStyles();

	return (
		<Button
			key={id}
			id={id}
			type={type}
			disabled={disabled}
			className={`${classes.thirdBackgroundButton} ${className}`}
			variant="contained"
			color="third"
			size={(size || "")}
			style={{ ...(width && { width }) }}
			onClick={onClick}
		>
			<Typography className={titleClassName} sx={{ color: `${titleColor}!important` }} style={{ textTransform: "none" }}>
				<b>
					{title}
				</b>
			</Typography>
		</Button>
	);
};

export const ThirdBorderButton = ({
	id = "third-border-button",
	type = "button",
	disabled = false,
	className = "",
	titleClassName = "",
	titleColor = "third",
	size = "",
	width = "200px",
	title = "Button",
	backgroundColor = "white",
	onClick,
}) => {
	const classes = useStyles();

	return (
		<Button
			key={id}
			id={id}
			type={type}
			disabled={disabled}
			className={`${classes.thirdBorderButton} ${className}`}
			variant="outlined"
			color="third"
			size={(size || "")}
			style={{ ...(width && { width }), backgroundColor: (backgroundColor || "white") }}
			onClick={onClick}
		>
			<Typography className={titleClassName} sx={{ color: `${titleColor}!important` }} style={{ textTransform: "none" }}>
				<b>
					{title}
				</b>
			</Typography>
		</Button>
	);
};

export const SuccessBackgroundButton = ({
	id = "success-background-button",
	type = "button",
	disabled = false,
	className = "",
	titleClassName = "",
	titleColor = "white",
	size = "",
	width = "200px",
	title = "Button",
	onClick,
}) => (
	<Button
		key={id}
		id={id}
		type={type}
		disabled={disabled}
		className={className}
		variant="contained"
		color="success"
		size={(size || "")}
		style={{ ...(width && { width }) }}
		onClick={onClick}
	>
		<Typography className={titleClassName} sx={{ color: `${titleColor}!important` }} style={{ textTransform: "none" }}>
			<b>
				{title}
			</b>
		</Typography>
	</Button>
);

export const ErrorBackgroundButton = ({
	id = "error-background-button",
	type = "button",
	disabled = false,
	className = "",
	titleClassName = "",
	titleColor = "white",
	size = "",
	width = "200px",
	title = "Button",
	onClick,
}) => (
	<Button
		key={id}
		id={id}
		type={type}
		disabled={disabled}
		className={className}
		variant="contained"
		color="error"
		size={(size || "")}
		style={{ ...(width && { width }) }}
		onClick={onClick}
	>
		<Typography className={titleClassName} sx={{ color: `${titleColor}!important` }} style={{ textTransform: "none" }}>
			<b>
				{title}
			</b>
		</Typography>
	</Button>
);

export const InfoBackgroundButton = ({
	id = "info-background-button",
	type = "button",
	disabled = false,
	className = "",
	titleClassName = "",
	titleColor = "white",
	size = "",
	width = "200px",
	title = "Button",
	onClick,
}) => (
	<Button
		key={id}
		id={id}
		type={type}
		disabled={disabled}
		className={className}
		variant="contained"
		color="info"
		size={(size || "")}
		style={{ ...(width && { width }) }}
		onClick={onClick}
	>
		<Typography className={titleClassName} sx={{ color: `${titleColor}!important` }} style={{ textTransform: "none" }}>
			<b>
				{title}
			</b>
		</Typography>
	</Button>
);

export const WhiteBorderButton = ({
	id = "white-border-button",
	type = "button",
	disabled = false,
	className = "",
	titleClassName = "",
	titleColor = "",
	size = "",
	width = "200px",
	title = "Button",
	onClick,
}) => {
	const classes = useStyles();

	return (
		<Button
			key={id}
			id={id}
			type={type}
			disabled={disabled}
			className={`${classes.whiteBorderButton} ${className}`}
			variant="outlined"
			color="white"
			size={(size || "")}
			style={{ ...(width && { width }) }}
			onClick={onClick}
		>
			<Typography className={titleClassName} sx={{ color: `${titleColor}!important` }} style={{ textTransform: "none" }}>
				<b>
					{title}
				</b>
			</Typography>
		</Button>
	);
};
