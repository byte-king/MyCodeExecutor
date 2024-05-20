import React, { useRef, useState } from 'react'
import Editor, { DiffEditor, useMonaco, loader } from '@monaco-editor/react';

const CodeEditor = () => {
    const EditorRef = useRef();
    const [value, setvalue] = useState('')

    const onMount = (editor) => {
        EditorRef.current = editor;
        editor.focus();
    }
  return (
    <Editor 
    height="90vh" 
    theme='vs-dark'
    defaultLanguage="javascript" 
    defaultValue="// some comment" 
    value={value}
    onChange={(newValue)=>setvalue(newValue)}
    onMount={onMount}
    
    />

  )
}

export default CodeEditor