import { useEffect, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView } from 'codemirror';
import { lintGutter } from "@codemirror/lint";
import { dracula } from '@uiw/codemirror-theme-dracula';

const CodeEditor = ({ code: propCode, setCode: propsSetCode, width = "100%", height = "100%", editable = true }) => {
	const [code, setCode] = useState(propCode);

	useEffect(() => {
		setCode(propCode);
	}, [propCode]);

	const codeChange = (newCode) => {
		propsSetCode(newCode);
	};

	return (
		<div
			style={{ position: "relative", width, height, margin: "0px" }}
		>
			<CodeMirror
				value={code}
				theme={dracula}
				width={width}
				height={height}
				style={{ fontSize: "0.9rem" }}
				readOnly={!editable}
				extensions={[
					javascript({ jsx: true }),
					EditorView.lineWrapping,
					lintGutter(),
				]}
				onChange={codeChange}
			/>
		</div>
	);
};

export default CodeEditor;