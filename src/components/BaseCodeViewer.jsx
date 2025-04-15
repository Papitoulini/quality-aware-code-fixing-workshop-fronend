import { useEffect, useRef, forwardRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import CodeMirror from "@uiw/react-codemirror";
import { linter, lintGutter } from "@codemirror/lint";
import { StateField, StateEffect } from "@codemirror/state";
import { EditorView, Decoration } from "@codemirror/view";
import { unfoldAll, foldEffect, StreamLanguage } from "@codemirror/language";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { php } from "@codemirror/lang-php";
import { java } from "@codemirror/lang-java";
import { csharp, dart, kotlin } from "@codemirror/legacy-modes/mode/clike";

const languageModes = {
	javascript: javascript({ jsx: true }),
	typescript: javascript({ typescript: true, jsx: true }),
	java: java(),
	"c#": StreamLanguage.define(csharp),
	kotlin: StreamLanguage.define(kotlin),
	dart: StreamLanguage.define(dart),
	python: python(),
	php: php(),
};

const addMarks = StateEffect.define();
const filterMarks = StateEffect.define();

const markField = StateField.define({
	create() { return Decoration.none; },
	update(value, tr) {
		value = value.map(tr.changes);
		for (const effect of tr.effects) {
			if (effect.is(addMarks)) value = value.update({ add: effect.value, sort: true });
			else if (effect.is(filterMarks)) value = value.update({ filter: effect.value });
		}

		return value;
	},
	provide: (f) => EditorView.decorations.from(f),
});
const mark = Decoration.mark({
	class: "marked-text",
});

const BaseCodeViewer = forwardRef(({
	language = "javascript",
	getAnnotations = () => [],
	getDecorations = () => Decoration.none,
	onCreateEditor = () => {},
	handleQueryParams = true,
	value = "",
	...props
}, ref) => {
	const { search } = useLocation();
	const scrolledRef = useRef(false);

	// Memoize the handleScrollAndHighlight function to prevent re-creations
	const handleScrollAndHighlight = useCallback((view, state, LS, LE) => {
		if (LS || LE) {
			const SLNum = LS || LE;
			const ELNum = LE || LS;

			const docLineCount = state.doc.lines;
			const validSL = Math.min(Math.max(SLNum, 1), docLineCount);
			const validEL = Math.min(Math.max(ELNum, 1), docLineCount);

			const startPos = state.doc.line(validSL).from;
			const endPos = state.doc.line(validEL).to;

			// Dispatch selection and scroll into view
			view.dispatch({
				selection: { anchor: startPos, head: endPos },
				scrollIntoView: true,
			});

			// Add mark
			view.dispatch({
				effects: addMarks.of([mark.range(startPos, endPos)]),
			});
		}
	}, []);

	// Effect to handle scrolling and highlighting after the editor value changes
	useEffect(() => {
		if (!handleQueryParams) return; // Skip if not handling query params

		if (ref?.current && !scrolledRef.current && ref.current.view?.state && value) {
			const parsed = queryString.parse(search);
			const LS = parsed.LS ? Number(parsed.LS) : null;
			const LE = parsed.LE ? Number(parsed.LE) : null;

			if (LS || LE) {
				scrolledRef.current = true;
				const view = ref.current.view;
				const state = view.state;
				handleScrollAndHighlight(view, state, LS, LE);
			}
		}
	}, [search, ref, handleQueryParams, value, handleScrollAndHighlight]);

	return (
		<div style={{ position: "relative" }}>
			<CodeMirror
				ref={ref}
				value={value}
				extensions={[
					languageModes[language],
					linter(getAnnotations),
					lintGutter(),
					markField,
					EditorView.decorations.compute([], (state) => getDecorations(state)),
				]}
				editable={false}
				onCreateEditor={(view, state) => {
					// Define custom methods on the editor view
					view.addMarks = (from, to) => {
						if (from !== to) {
							view.dispatch({ effects: addMarks.of([mark.range(state.doc.line(from).from, state.doc.line(to).to)]) });
						}
					};

					view.fold = (from, to) => {
						if (from !== to) {
							view.dispatch({ effects: foldEffect.of({ from: state.doc.line(from).from, to: state.doc.line(to).to }) });
						}
					};

					view.removeAllMarks = () => view.dispatch({ effects: filterMarks.of(() => false) });
					view.removeAllFolds = () => unfoldAll(view);

					// Call the passed onCreateEditor callback
					onCreateEditor(view, state);

					// Handle scroll and highlight if value is already set
					if (handleQueryParams && !scrolledRef.current && value) {
						const parsed = queryString.parse(search);
						const LS = parsed.LS ? Number(parsed.LS) : null;
						const LE = parsed.LE ? Number(parsed.LE) : null;

						if (LS || LE) {
							scrolledRef.current = true;
							handleScrollAndHighlight(view, state, LS, LE);
						}
					}
				}}
				{...props}
			/>
		</div>
	);
});

export default BaseCodeViewer;
