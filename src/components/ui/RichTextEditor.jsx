'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import {
    FiBold,
    FiItalic,
    FiUnderline,
    FiList,
    FiHash,
    FiAlignLeft,
    FiAlignCenter,
    FiAlignRight,
    FiLink,
    FiRotateCcw,
    FiRotateCw,
    FiType
} from 'react-icons/fi';

const RichTextEditor = ({
    content = '',
    onChange,
    placeholder = 'Nhập mô tả sản phẩm...',
    className = '',
    editable = true
}) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            Highlight.configure({
                multicolor: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-orange-500 hover:text-orange-600 underline cursor-pointer',
                },
            }),
        ],
        content: content,
        editable: editable,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            onChange?.(html);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-orange dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const addLink = () => {
        const url = window.prompt('Nhập URL:');
        if (url) {
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }
    };

    const ToolbarButton = ({ onClick, isActive, children, title }) => (
        <button
            type="button"
            onClick={onClick}
            className={`p-2 rounded-md transition-colors ${isActive
                    ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
            title={title}
        >
            {children}
        </button>
    );

    const ToolbarDivider = () => (
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
    );

    if (!editable) {
        return (
            <div className={`prose prose-orange dark:prose-invert max-w-none ${className}`}>
                <EditorContent editor={editor} />
            </div>
        );
    }

    return (
        <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 flex-wrap">
                {/* Text Formatting */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    isActive={editor.isActive('bold')}
                    title="Đậm"
                >
                    <FiBold size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    isActive={editor.isActive('italic')}
                    title="Nghiêng"
                >
                    <FiItalic size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    isActive={editor.isActive('strike')}
                    title="Gạch ngang"
                >
                    <FiUnderline size={16} />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Headings */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    isActive={editor.isActive('heading', { level: 1 })}
                    title="Tiêu đề 1"
                >
                    <span className="text-sm font-bold">H1</span>
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    isActive={editor.isActive('heading', { level: 2 })}
                    title="Tiêu đề 2"
                >
                    <span className="text-sm font-bold">H2</span>
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    isActive={editor.isActive('heading', { level: 3 })}
                    title="Tiêu đề 3"
                >
                    <span className="text-sm font-bold">H3</span>
                </ToolbarButton>

                <ToolbarDivider />

                {/* Lists */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    isActive={editor.isActive('bulletList')}
                    title="Danh sách dấu chấm"
                >
                    <FiList size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    isActive={editor.isActive('orderedList')}
                    title="Danh sách đánh số"
                >
                    <FiHash size={16} />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Text Alignment */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    isActive={editor.isActive({ textAlign: 'left' })}
                    title="Căn trái"
                >
                    <FiAlignLeft size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    isActive={editor.isActive({ textAlign: 'center' })}
                    title="Căn giữa"
                >
                    <FiAlignCenter size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    isActive={editor.isActive({ textAlign: 'right' })}
                    title="Căn phải"
                >
                    <FiAlignRight size={16} />
                </ToolbarButton>

                <ToolbarDivider />

                {/* Link */}
                <ToolbarButton
                    onClick={addLink}
                    isActive={editor.isActive('link')}
                    title="Thêm liên kết"
                >
                    <FiLink size={16} />
                </ToolbarButton>

                {/* Color Picker */}
                <div className="flex items-center gap-1">
                    <label className="flex items-center gap-1 cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700" title="Màu chữ">
                        <FiType size={16} />
                        <input
                            type="color"
                            className="w-4 h-4 border-none cursor-pointer"
                            onInput={(e) => editor.chain().focus().setColor(e.target.value).run()}
                            value={editor.getAttributes('textStyle').color || '#000000'}
                        />
                    </label>
                </div>

                <ToolbarDivider />

                {/* Undo/Redo */}
                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    isActive={false}
                    title="Hoàn tác"
                >
                    <FiRotateCcw size={16} />
                </ToolbarButton>

                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    isActive={false}
                    title="Làm lại"
                >
                    <FiRotateCw size={16} />
                </ToolbarButton>
            </div>

            {/* Editor Content */}
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <EditorContent
                    editor={editor}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
};

export default RichTextEditor;