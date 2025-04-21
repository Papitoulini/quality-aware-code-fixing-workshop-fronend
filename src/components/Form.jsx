import { memo, useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react";
import { makeStyles } from "@mui/styles";
import { Grid, Typography } from "@mui/material";
import { Formik } from "formik";

import { validations } from "#utils";

import Input from "./Input.jsx";
import { ThirdBackgroundButton, SecondaryBackgroundButton } from "./Buttons.jsx";
import Dropdown from "./Dropdown.jsx";
import Checkbox from "./Checkbox.jsx";
import RadioButtons from "./RadioButtons.jsx";
import Slider from "./Slider.jsx";
import Switch from "./Switch.jsx";
import DatePicker from "./DatePicker.jsx";

const useStyles = makeStyles((theme) => ({
	form: {
		width: "100%",
		display: "flex",
		justifyContent: "space-evenly",
		flexDirection: "column",
		alignItems: "center",
		textAlign: "center",
	},
	input: {
		color: "black",
		width: "100%",
		backgroundColor: "white",
		opacity: 0.7,
		borderRadius: "4px",
		"&:hover": {
			opacity: 0.8,
		},
	},
	inputGrid: {
		width: "100%",
		marginBottom: "10px",
		display: "flex",
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "flex-start",
		color: theme.palette.primary.main,
	},
	label: {
		width: "100%",
	},
	dropdown: {
		width: "100%",
		maxWidth: "300px",
		marginBottom: "10px",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		color: "white",
	},
	checkboxBox: {
		width: "100%",
		maxWidth: "300px",
		marginBottom: "10px",
		display: "flex",
	},
	checkbox: {
		width: "100%",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		color: theme.palette.primary.main,
	},
	checkboxesBox: {
		width: "100%",
		marginBottom: "10px",
		display: "flex",
		flexDirection: "column",
		color: theme.palette.primary.main,
	},
	checkboxesGrid: {
		width: "100%",
		display: "flex",
		flexDirection: "row",
		alignItems: "flex-start",
		justifyContent: "space-evenly",
		color: theme.palette.primary.main,
	},
	checkboxes: {
		width: "auto",
		display: "flex",
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		color: theme.palette.primary.main,
	},
	radioBox: {
		width: "100%",
		marginBottom: "10px",
		display: "flex",
		flexDirection: "column",
		color: theme.palette.primary.main,
	},
	sliderBox: {
		width: "100%",
		maxWidth: "300px",
		marginBottom: "10px",
		display: "flex",
		flexDirection: "column",
		color: "white",
	},
	datepickerBox: {
		width: "100%",
		maxWidth: "300px",
		marginBottom: "10px",
		display: "flex",
		flexDirection: "column",
		color: "white",
	},
	switchBox: {
		width: "100%",
		maxWidth: "300px",
		marginTop: "10px",
		marginBottom: "10px",
		display: "flex",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		color: "white",
	},
	buttonTitle: {
		color: "white",
		letterSpacing: theme.spacing(0.1),
	},
	markLabel: {
		color: "white",
	},
	button: {
		width: "100%",
		maxWidth: "300px",
	},
}));

const Form = forwardRef(({ disabled: dsb, content, validationSchema, onSubmit, onSubmitProps, toResetForm = true }, ref) => {
	const classes = useStyles();
	const [formContent, setFormContent] = useState(content);
	const [disabled, setDisabled] = useState(dsb);
	const formRef = useRef();

	// useEffect(() => {
	// 	setFormContent(content);
	// }, [content]);

	// useEffect(() => {
	// 	setDisabled(dsb);
	// }, [dsb]);

	// useImperativeHandle(ref, () => ({
	// 	getFormValues() {
	// 		return formRef.current.values;
	// 	},
	// }));

	return (
		<Formik
			enableReinitialize
			innerRef={formRef}
			initialValues={formContent.reduce((a, v) => (
				v.customType === "input"
					? { ...a, [v.id]: v.defaultValue || "" }
					: (v.customType === "dropdown"
					|| v.customType === "checkbox"
					|| v.customType === "radio"
					|| v.customType === "slider"
					|| v.customType === "switch"
						? { ...a, [v.id]: v.defaultValue }
						: (v.customType === "date-picker"
							? { ...a, [v.id]: v.value || null }
							: (v.customType === "checkboxes"
								? v.items.reduce((b, w) => ({ ...b, [w.id]: w.defaultValue || false }), a)
								: a
							)
						)
					)
			), {})}
			validationSchema={validations?.[validationSchema] || null}
			validateOnChange={false}
			onSubmit={(...formikArgs) => {
				onSubmit(...formikArgs, onSubmitProps);
				const [, { resetForm, setSubmitting }] = formikArgs;
				if (toResetForm) resetForm();
				setSubmitting(false);
			}}
		>
			{(formikProps) => (
				<form className={classes.form} onSubmit={formikProps.handleSubmit}>
					{formContent.map((comp) => (
						<div
							key={comp.id}
							style={{ width: "100%", display: "flex", justifyContent: "center" }}
						>
							{comp.customType === "input"
							&& (
								<Grid item className={classes.inputGrid}>
									{comp.label && (
										<Grid item className={classes.label}>
											<Typography textAlign="left">{comp.label}</Typography>
										</Grid>
									)}
									<Input
										key={comp.id}
										id={comp.id}
										type={comp.type}
										multiline={comp.multiline}
										minRows={comp.minRows}
										maxRows={comp.maxRows}
										className={classes.input}
										placeholder={comp.placeholder}
										variant="filled"
										color="secondary"
										InputProps={comp.inputProps}
										value={formikProps.values[comp.id]}
										defaultValue={comp.defaultValue}
										error={Boolean(formikProps.errors[comp.id])}
										helperText={formikProps.errors[comp.id]}
										disabled={disabled || comp.disabled}
										onChange={(event) => {
											formikProps.handleChange(event);
											if (comp.onChange) {
												comp.onChange(event);
											}
										}}
									/>
								</Grid>
							)}
							{comp.customType === "dropdown"
							&& (
								<Grid item className={classes.dropdown}>
									<Typography>{comp.label}</Typography>
									<Dropdown
										id={comp.id}
										items={comp.items}
										value={formikProps.values[comp.id]}
										disabled={disabled || comp.disabled}
										size="medium"
										width="200px"
										filled={false}
										background="secondary"
										onChange={(event) => {
											formikProps.handleChange({
												target: {
													name: comp.id,
													value: event.target.value,
												},
											});
											if (comp.onChange) {
												comp.onChange(event);
											}
										}}
									/>
								</Grid>
							)}
							{comp.customType === "checkbox"
							&& (
								<Grid container item className={classes.checkboxBox}>
									<Grid item className={classes.checkbox}>
										<Typography>{comp.label}</Typography>
										<Checkbox
											key={comp.id}
											id={comp.id}
											checked={formikProps.values[comp.id]}
											size={comp.size}
											color={comp.color}
											sx={{
												color: `${comp.color}.main`,
												"&.Mui-checked": {
													color: `${comp.color}.main`,
												},
											}}
											icon={comp.icon}
											checkedIcon={comp.checkedIcon}
											disabled={disabled || comp.disabled}
											onChange={(event) => {
												formikProps.handleChange({
													target: {
														name: comp.id,
														value: !formikProps.values[comp.id],
													},
												});
												if (comp.onChange) {
													comp.onChange(event);
												}
											}}
										/>
									</Grid>
									{Boolean(formikProps.errors[comp.id])
									&& (
										<Typography color="error" fontSize="small">{formikProps.errors[comp.id]}</Typography>
									)}
								</Grid>
							)}
							{comp.customType === "checkboxes"
							&& (
								<Grid key={comp.id} container item className={classes.checkboxesBox}>
									<Typography textAlign="left">{comp.label}</Typography>
									<Grid container item className={classes.checkboxesGrid}>
										{comp.items.map((item) => (
											<Grid key={item.id} container item className={classes.checkboxes}>
												<Checkbox
													key={item.id}
													id={item.id}
													checked={formikProps.values[item.id]}
													defaultValue={item.defaultValue}
													defa
													size={comp.size}
													color={comp.color}
													sx={{
														color: `${comp.color}.main`,
														"&.Mui-checked": {
															color: `${comp.color}.main`,
														},
													}}
													icon={comp.icon}
													checkedIcon={comp.checkedIcon}
													disabled={disabled || comp.disabled}
													onChange={(event) => {
														formikProps.handleChange({
															target: {
																name: item.id,
																value: !formikProps.values[item.id],
															},
														});
														if (comp.onChange) {
															comp.onChange(event);
														}
													}}
												/>
												<Typography>{item.label}</Typography>
											</Grid>
										))}
									</Grid>
									{Boolean(formikProps.errors[comp.id])
									&& (
										<Typography color="error" fontSize="small">{formikProps.errors[comp.id]}</Typography>
									)}
								</Grid>
							)}
							{comp.customType === "radio"
							&& (
								<Grid key={comp.id} container item className={classes.radioBox}>
									<Typography textAlign="left">{comp.label}</Typography>
									<RadioButtons
										id={comp.label}
										value={formikProps.values[comp.id]}
										row={comp.row}
										color={comp.color}
										labelPlacement={comp.labelPlacement}
										disabled={disabled || comp.disabled}
										items={comp.items}
										onChange={(event) => {
											formikProps.handleChange({
												target: {
													name: comp.id,
													value: event.target.value,
												},
											});
											if (comp.onChange) {
												comp.onChange(event);
											}
										}}
									/>
									{Boolean(formikProps.errors[comp.id])
									&& (
										<Typography textAlign="left" color="error" fontSize="small">{formikProps.errors[comp.id]}</Typography>
									)}
								</Grid>
							)}
							{comp.customType === "slider"
							&& (
								<Grid key={comp.id} container item className={classes.sliderBox}>
									<Typography textAlign="left">{comp.label}</Typography>
									<Slider
										iconBefore={comp.iconBefore}
										iconAfter={comp.iconAfter}
										color={comp.color || "secondary"}
										value={formikProps.values[comp.id]}
										min={comp.min}
										max={comp.max}
										marks={comp.marks}
										step={comp.step}
										size={comp.size}
										track={comp.track}
										valueLabelDisplay={comp.displayLabel}
										disabled={disabled || comp.disabled}
										onChange={(event) => {
											formikProps.handleChange({
												target: {
													name: comp.id,
													value: event.target.value,
												},
											});
											if (comp.onChange) {
												comp.onChange(event);
											}
										}}
									/>
									{Boolean(formikProps.errors[comp.id])
									&& (
										<Typography textAlign="left" color="error" fontSize="small">{formikProps.errors[comp.id]}</Typography>
									)}
								</Grid>
							)}
							{comp.customType === "switch"
							&& (
								<Grid key={comp.id} container item className={classes.switchBox}>
									<Typography textAlign="left">{comp.label}</Typography>
									<Switch
										color={comp.color || "secondary"}
										checked={formikProps.values[comp.id]}
										size={comp.size}
										disabled={disabled || comp.disabled}
										onChange={(event) => {
											formikProps.handleChange({
												target: {
													name: comp.id,
													value: !formikProps.values[comp.id],
												},
											});
											if (comp.onChange) {
												comp.onChange(event);
											}
										}}
									/>
									{Boolean(formikProps.errors[comp.id])
									&& (
										<Typography textAlign="left" color="error" fontSize="small">{formikProps.errors[comp.id]}</Typography>
									)}
								</Grid>
							)}
							{comp.customType === "date-picker"
							&& (
								<Grid key={comp.id} container item className={classes.datepickerBox}>
									<Typography textAlign="left">{comp.label}</Typography>
									<DatePicker
										type={comp.type || "desktop"} // desktop, mobile, time, datetime
										value={formikProps.values[comp.id]}
										disabled={disabled || comp.disabled}
										label={comp.sublabel || ""}
										views={comp.views || ["day", "month", "year"]}
										background="secondary"
										color="white"
										onChange={(value) => {
											formikProps.handleChange({
												target: {
													name: comp.id,
													value,
												},
											});
											if (comp.onChange) {
												comp.onChange(event);
											}
										}}
									/>
									{Boolean(formikProps.errors[comp.id])
									&& (
										<Typography textAlign="left" color="error" fontSize="small">{formikProps.errors[comp.id]}</Typography>
									)}
								</Grid>
							)}
							{comp.customType === "component"
							&& (
								comp.component
							)}
							{comp.customType === "button"
							&& (
								comp.color === "third"
									? (
										<ThirdBackgroundButton
											id={comp.id}
											type={comp.type}
											disabled={formikProps.isSubmitting || disabled}
											className={classes.button}
											size="large"
											width="100%"
											title={comp.text}
										/>
									)
									: (
										<SecondaryBackgroundButton
											id={comp.id}
											type={comp.type}
											disabled={formikProps.isSubmitting || disabled}
											className={classes.button}
											size="large"
											width="100%"
											title={comp.text}
										/>
									)
							)}
						</div>
					))}
				</form>
			)}
		</Formik>
	);
});

export default memo(Form);
