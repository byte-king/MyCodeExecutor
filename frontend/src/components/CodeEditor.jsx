// src/CodeEditor.jsx
import { useEffect, useRef, useState } from "react";
import { Editor, loader } from "@monaco-editor/react";

// Configure Monaco environment
loader.config({
  paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor/min/vs" },
});

function CodeEditor({ fileContent }) {
  const editorRef = useRef();
  const [newFileContent, setFileContent] = useState(fileContent);

  const onMount = (editor) => {
    editorRef.current = editor;
    editorRef.current.focus();
  };

  useEffect(() => {
    loader.init().then((monaco) => {
      // Enable full TypeScript Language Service
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ESNext,
        allowNonTsExtensions: true,
        noLib: false, // This includes the standard library (e.g., DOM, ESNext, etc.)
        allowJs: true, // Allow JavaScript files to be part of the TypeScript project
      });

      // Enable autocompletion, suggestions, and other language features
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false, // Enable semantic checking
        noSyntaxValidation: false, // Enable syntax checking
      });

      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ESNext,
        allowNonTsExtensions: true,
        noLib: false, // Includes all standard library types
        allowJs: true, // Allow JavaScript files in the project
        jsx: monaco.languages.typescript.JsxEmit.React, // Support JSX/TSX
      });

      // Now, Monaco Editor should provide autocomplete for all possible functions, objects, and types
    });
  }, []);

  useEffect(() => {
    setFileContent(fileContent);
  }, [fileContent]);

  const handleFileChange = (value) => {
    console.log("New file Content", value);
    setFileContent(value);
  };

  return (
    <div style={{ height: "90vh" }}>
      <Editor
        height="100%"
        defaultLanguage="javascript"
        theme="vs-dark"
        value={newFileContent}
        onChange={handleFileChange}
        onMount={onMount}
      />
    </div>
  );
}

export default CodeEditor;
