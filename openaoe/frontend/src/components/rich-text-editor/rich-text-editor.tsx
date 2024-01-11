import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({ className = undefined, placeholder = '' }) => {
    return (
        <ReactQuill
            theme="snow"
            className={className}
            onChange={(content, delta, source, editor) => {
                console.log(editor.getText());
            }}
            placeholder={placeholder}
            modules={{
                toolbar: ['image', 'code-block']
            }}
        />
    );
};

export default RichTextEditor;
