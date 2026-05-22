import React, { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

type Props = {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
    readOnly?: boolean;
};

const RichTextEditor: React.FC<Props> = ({
    value,
    onChange,
    placeholder = "Write something...",
    readOnly = false,
}) => {
    const [editorValue, setEditorValue] = useState(value || "");
    const [mounted, setMounted] = useState(false);
    const quillRef = useRef<ReactQuill | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Sync external value
    useEffect(() => {
        if (value !== editorValue) {
            setEditorValue(value || "");
        }
    }, [value]);

    const handleEditorChange = (content: string) => {
        setEditorValue(content);
        onChange(content);
    };

    // Toolbar config (you control it here instead of removing manually)
    const modules = {
        toolbar: readOnly
            ? false
            : [
                [{ header: [1, 2, 3, false] }],
                ["bold", "italic", "underline", "strike"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "image"],
                ["clean"],
            ],
    };

    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "list",
        "link",
        "image",
    ];

    if (!mounted) {
        return (
            <div className="w-full h-[200px] bg-slate-50 border border-slate-100 rounded-xl animate-pulse flex items-center justify-center text-slate-300 text-xs font-medium">
                Loading editor...
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* @ts-ignore */}
            <ReactQuill
                ref={quillRef}
                theme="snow"
                value={editorValue}
                onChange={handleEditorChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                readOnly={readOnly}
                className="bg-white"
            />
        </div>
    );
};

export default RichTextEditor;