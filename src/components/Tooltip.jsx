import React from 'react';
import PropTypes from "prop-types";
import { Tooltip as MUITooltip, Zoom, Typography } from "@mui/material";

const Tooltip = ({ children, title, titleVariant = "caption", placement = "top", sx = {}, disabled, ...rest }) => {
	const isDisabled = !!disabled;
	const isChildDisabled = () => {
		if (React.isValidElement(children)) {
			return children.props.disabled;
		}
		return false;
	};
	
	const childDisabled = isChildDisabled();
	return (
		isDisabled ? (
			<>
				{children}
			</>
		) : (
			<MUITooltip
				arrow
				title={typeof title === "string" ? (<Typography variant={titleVariant} color="inherit">{title}</Typography>) : title || ""}
				placement={placement}
				TransitionComponent={Zoom}
				componentsProps={{
					tooltip: {
						style: {
							whiteSpace: "normal",
							wordWrap: "break-word",
							textAlign: "center",
							...sx,
						},
					},
				}}
				{...rest}
			>
				{childDisabled ? (
				// Wrap in a span to capture events for disabled elements
					<span style={{ display: "inline-block" }}>
						{children}
					</span>
				) : (
					children
				)}
			</MUITooltip>
		)
	);
};

Tooltip.propTypes = {
	children: PropTypes.node,
	disabled: PropTypes.any,
	title: PropTypes.oneOfType([PropTypes.string, PropTypes.element, PropTypes.bool]).isRequired,
	titleVariant: PropTypes.string,
	placement: PropTypes.string,
	sx: PropTypes.object,
};

export default Tooltip;
