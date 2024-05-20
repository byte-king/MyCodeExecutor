// src/CodeEditor.jsx
import { useEffect, useRef, useState } from 'react';
import { Editor, loader } from '@monaco-editor/react';
import axios from 'axios'
// Configure Monaco environment
loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor/min/vs' } });

function CodeEditor(){
  const [editorValue,setEditorValue] = useState('');
  const editorRef = useRef();
  const onMount= (editor) => {
    editorRef.current = editor
    editorRef.current.focus();
  }

  async function GetData(){
    console.log("Request sent")
  const response = await axios.post('/api/get-file',{fileKey:'base-react/package.json'});
  console.log('This is response',response);
  setEditorValue(response.data.data);

  const folderResponse = await axios.post('api/list-folder',{folderKey: 'Replit-Clone/base-react/'})
    console.log("This is folder response API",folderResponse);
  }

  useEffect(() => {
    loader.init().then(monaco => {
      // JavaScript/TypeScript Configuration
      monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
      monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
      });
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES6,
        allowNonTsExtensions: true,
      });

      // CSS Configuration
      monaco.languages.css.cssDefaults.setOptions({
        validate: true,
        lint: {
          compatibleVendorPrefixes: 'warning',
          vendorPrefix: 'warning',
          duplicateProperties: 'warning',
          emptyRules: 'warning',
          importStatement: 'ignore',
          boxModel: 'ignore',
          universalSelector: 'ignore',
        },
      });

      // HTML Configuration
      monaco.languages.html.htmlDefaults.setOptions({
        validate: true,
        format: {
          indentInnerHtml: true,
        },
        suggest: {
          html5: true,
          angular1: true,
          ionic: true,
        },
      });

      // JSX Configuration
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        `
        declare module "*.jsx" {
          const value: any;
          export default value;
        }
        `,
        'file:///node_modules/@types/jsx/index.d.ts'
      );

      // Provide custom completion items (autocomplete)
      monaco.languages.registerCompletionItemProvider('javascript', {
        provideCompletionItems: () => {
          const suggestions = [
            {
              label: 'console.log',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'console.log(${1:});',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Log output to console',
            },
          ];
          return { suggestions };
        },
      });
    }
  );
  

  GetData();
  }, []);

  return (
    <div style={{ height: '90vh' }}>
      <Editor
        height="100%"
        defaultLanguage="javascript"
        defaultValue={editorValue}
        theme="vs-dark"
        value={editorValue}
        onChange={() => {}}
        onMount={onMount}
      />
    </div>
  );
}

export default CodeEditor;
