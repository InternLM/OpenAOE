import * as React from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import assembly from 'react-syntax-highlighter/dist/esm/languages/hljs/armasm.js';
import python from 'react-syntax-highlighter/dist/esm/languages/hljs/python';
import c from 'react-syntax-highlighter/dist/esm/languages/hljs/c';
import cLike from 'react-syntax-highlighter/dist/esm/languages/hljs/c-like';
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import csharp from 'react-syntax-highlighter/dist/esm/languages/hljs/csharp';
import vbnet from 'react-syntax-highlighter/dist/esm/languages/hljs/vbnet';
import javascript from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css';
import less from 'react-syntax-highlighter/dist/esm/languages/hljs/less';
import php from 'react-syntax-highlighter/dist/esm/languages/hljs/php';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import go from 'react-syntax-highlighter/dist/esm/languages/hljs/go';
import r from 'react-syntax-highlighter/dist/esm/languages/hljs/r';
import objectivec from 'react-syntax-highlighter/dist/esm/languages/hljs/objectivec';
import matlab from 'react-syntax-highlighter/dist/esm/languages/hljs/matlab';
import swift from 'react-syntax-highlighter/dist/esm/languages/hljs/swift';
import ruby from 'react-syntax-highlighter/dist/esm/languages/hljs/ruby';
import lua from 'react-syntax-highlighter/dist/esm/languages/hljs/lua';
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import yaml from 'react-syntax-highlighter/dist/esm/languages/hljs/yaml';
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml';
import markdown from 'react-syntax-highlighter/dist/esm/languages/hljs/markdown';
import makefile from 'react-syntax-highlighter/dist/esm/languages/hljs/makefile';
import latex from 'react-syntax-highlighter/dist/esm/languages/hljs/latex';
import dockerfile from 'react-syntax-highlighter/dist/esm/languages/hljs/dockerfile';
import llvm from 'react-syntax-highlighter/dist/esm/languages/hljs/llvm';
import shell from 'react-syntax-highlighter/dist/esm/languages/hljs/shell';
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash';
import { githubGist as codeStyle, monokai as darkCodeStyle } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { useConfigStore } from '@/store/config.ts';

const CodeBlock: React.FC<any> = ({
    children, inline, className, ...rest
}) => {
    /**
     * className (string?) — set to language-js or so when using ```js
     * https://github.com/remarkjs/react-markdown#appendix-b-components
     */
    const match = /language-(\w+)/.exec(className || '') || [];
    const configStore = useConfigStore();

    SyntaxHighlighter.registerLanguage('assembly', assembly);
    SyntaxHighlighter.registerLanguage('python', python);
    SyntaxHighlighter.registerLanguage('c', c);
    SyntaxHighlighter.registerLanguage('c/c++', cLike);
    SyntaxHighlighter.registerLanguage('clike', cLike);
    SyntaxHighlighter.registerLanguage('c++', cpp);
    SyntaxHighlighter.registerLanguage('cpp', cpp);
    SyntaxHighlighter.registerLanguage('java', java);
    SyntaxHighlighter.registerLanguage('csharp', csharp);
    SyntaxHighlighter.registerLanguage('c#', csharp);
    SyntaxHighlighter.registerLanguage('vb', vbnet);
    SyntaxHighlighter.registerLanguage('visual basic', vbnet);
    SyntaxHighlighter.registerLanguage('javascript', javascript);
    SyntaxHighlighter.registerLanguage('typescript', typescript);
    SyntaxHighlighter.registerLanguage('css', css);
    SyntaxHighlighter.registerLanguage('less', less);
    SyntaxHighlighter.registerLanguage('js', javascript);
    SyntaxHighlighter.registerLanguage('sql', sql);
    SyntaxHighlighter.registerLanguage('php', php);
    SyntaxHighlighter.registerLanguage('go', go);
    SyntaxHighlighter.registerLanguage('r', r);
    SyntaxHighlighter.registerLanguage('objective-c', objectivec);
    SyntaxHighlighter.registerLanguage('objc', objectivec);
    SyntaxHighlighter.registerLanguage('matlab', matlab);
    SyntaxHighlighter.registerLanguage('swift', swift);
    SyntaxHighlighter.registerLanguage('ruby', ruby);
    SyntaxHighlighter.registerLanguage('lua', lua);
    SyntaxHighlighter.registerLanguage('json', json);
    SyntaxHighlighter.registerLanguage('yaml', yaml);
    SyntaxHighlighter.registerLanguage('xml', xml);
    SyntaxHighlighter.registerLanguage('dDockerfile', dockerfile);
    SyntaxHighlighter.registerLanguage('markdown', markdown);
    SyntaxHighlighter.registerLanguage('md', markdown);
    SyntaxHighlighter.registerLanguage('makefile', makefile);
    SyntaxHighlighter.registerLanguage('latex', latex);
    SyntaxHighlighter.registerLanguage('llvm', llvm);
    SyntaxHighlighter.registerLanguage('shell', shell);
    SyntaxHighlighter.registerLanguage('sh', shell);
    SyntaxHighlighter.registerLanguage('bash', bash);

    return !inline && match ? (
        <SyntaxHighlighter
            language={(match[1] || 'Python').toLowerCase()} // 默认语言Python
            style={configStore.theme === 'light' ? codeStyle : darkCodeStyle}
            customStyle={{
                borderRadius: '10px',
            }}
            PreTag="div"
            {...rest}
        >
            {children}
        </SyntaxHighlighter>
    ) : (
        <code className={className} {...rest}>
            {children}
        </code>
    );
};
export default React.memo(CodeBlock);
