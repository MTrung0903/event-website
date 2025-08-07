import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  FaBold,
  FaItalic,
  FaLink,
  FaListUl,
  FaTrashAlt,
  FaImage,
  FaVideo,
  FaUnderline 
} from "react-icons/fa";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';

const Overview = ({ setShowOverview, content, setContent, isReadOnly }) => {
  const { t } = useTranslation();
  const [media, setMedia] = useState(content.media);
  const [pasteError, setPasteError] = useState('');

  // Khởi tạo Tiptap editor
  const editor = useEditor({
    editable: !isReadOnly,
    extensions: [
      StarterKit.configure({
        history: true,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'underline text-blue-600',
        },
      }),
    ],
    content: content.text || '',
    onUpdate: ({ editor }) => {
      if (isReadOnly) return;
      const html = editor.getHTML();
      const plainText = editor.getText().replace(/\n/g, '');
      if (plainText.length <= 2000) {
        setContent({ text: html, media });
        setPasteError('');
      } else {
        const truncatedText = plainText.slice(0, 2000);
        const newHtml = `<p>${truncatedText}</p>`;
        editor.commands.setContent(newHtml);
        setContent({ text: newHtml, media });
        setPasteError(t('overviewSection.pasteError'));
      }
    },
    editorProps: {
      handlePaste: (view, event) => {
        if (isReadOnly) return;
        const clipboardData = event.clipboardData.getData('text/plain');
        if (clipboardData) {
          const currentText = view.state.doc.textContent.replace(/\n/g, '');
          const newText = currentText + clipboardData.replace(/\n/g, '');
          if (newText.length > 2000) {
            const allowedText = clipboardData.slice(0, 2000 - currentText.length);
            view.dispatch(
              view.state.tr.insertText(allowedText, view.state.selection.from)
            );
            setPasteError(t('overviewSection.pasteError'));
            return true;
          }
        }
        return false;
      },
    },
  });

  // Đồng bộ editor với content.text khi content thay đổi
  useEffect(() => {
    if (editor && content.text !== editor.getHTML()) {
      editor.commands.setContent(content.text || '');
    }
  }, [editor, content.text]);

  // Đếm ký tự (loại bỏ thẻ HTML)
  const getCharacterCount = () => {
    const plainText = content.text.replace(/<[^>]+>/g, '').replace(/\n/g, '');
    return plainText.length;
  };

  // Kiểm tra xem text có hợp lệ không
  const isFormValid = () => {
    const hasText = content.text && content.text.replace(/<[^>]+>/g, '').trim() !== '';
    return hasText;
  };

  const handleMediaUpload = (event, type) => {
    const files = Array.from(event.target.files);
    const newMedia = files.map((file) => ({
      type,
      file, // Lưu file gốc
      url: URL.createObjectURL(file), // URL tạm thời để hiển thị
    }));
    setMedia((prev) => {
      const updatedMedia = [...prev, ...newMedia];
      setContent({ text: content.text, media: updatedMedia });
      return updatedMedia;
    });
  };

  const handleDeleteMedia = (index) => {
    setMedia((prev) => {
      const updatedMedia = prev.filter((_, i) => i !== index);
      setContent({ text: content.text, media: updatedMedia });
      return updatedMedia;
    });
  };

  const handleComplete = () => {
    if (isFormValid()) {
      setContent({ text: editor.getHTML(), media });
      setShowOverview(false);
    }
  };

  const handleCancel = () => {
    editor.commands.setContent(content.text); // Khôi phục nội dung cũ
    setMedia(content.media);
    setShowOverview(false);
  };

  return (
    <div className="bg-white border border-blue-500 rounded-lg p-6 w-full max-w-[710px] mb-4">
      <h1 className="mb-2 text-2xl font-bold">{t('overviewSection.overview')}</h1>
      <p className="mb-4 text-gray-600">{t('overviewSection.addDetails')}</p>
      <div className="p-4 mb-4 border rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span>{t('overviewSection.textFormatting')}</span>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleBold().run()}
              disabled={isReadOnly}
              className={`p-2 rounded ${editor?.isActive('bold') ? 'bg-blue-600 text-white' : 'bg-gray-100'} ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaBold />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={isReadOnly}
              className={`p-2 rounded ${editor?.isActive('italic') ? 'bg-blue-600 text-white' : 'bg-gray-100'} ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaItalic />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              disabled={isReadOnly}
              className={`p-2 rounded ${editor?.isActive('underline') ? 'bg-blue-600 text-white' : 'bg-gray-100'} ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaUnderline />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().toggleLink({ href: prompt('Enter URL') }).run()}
              disabled={isReadOnly}
              className={`p-2 rounded ${editor?.isActive('link') ? 'bg-blue-600 text-white' : 'bg-gray-100'} ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaLink />
            </button>
          </div>
        </div>
        <EditorContent
          editor={editor}
          className="w-full min-h-[100px] border rounded-lg p-2 outline-none focus:ring-0"
        />
        <div className="flex justify-between mt-2">
          <div className="text-gray-600">{t('overviewSection.characterCount', { count: getCharacterCount() })}</div>
          <FaTrashAlt
            className="text-gray-500 cursor-pointer"
            onClick={() => {
              editor.commands.clearContent();
              setContent({ text: '', media });
            }}
          />
        </div>
        {pasteError && (
          <div className="mt-1 text-red-500">{pasteError}</div>
        )}
        {(!content.text || content.text.replace(/<[^>]+>/g, '').trim() === '') && (
          <div className="mt-1 text-red-500">{t('overviewSection.eventDetailsRequired')}</div>
        )}
      </div>
      <div className="flex mb-4 space-x-4">
        <label className="flex items-center px-4 py-2 border rounded cursor-pointer">
          <FaImage className="mr-2" /> {t('overviewSection.addImage')}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={isReadOnly}
            onChange={(e) => handleMediaUpload(e, "image")}
          />
        </label>
        
      </div>
      <div className="mb-4">
        {media.map((item, index) => (
          <div key={index} className="relative inline-block mx-4">
            {item.type === "image" ? (
              <img
                src={item.url}
                alt="Uploaded"
                className="w-full max-w-xs mt-2 rounded-lg"
              />
            ) : (
              <video
                src={item.url}
                controls
                className="w-full max-w-xs mt-2 rounded-lg"
              />
            )}
            <FaTrashAlt
              className="absolute p-1 bg-white rounded-full cursor-pointer top-2 right-2"
              onClick={() => handleDeleteMedia(index)}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end space-x-4">
        <button
          className="px-4 py-2 text-gray-700 bg-gray-300 rounded"
          onClick={handleCancel}
        >
          {t('overviewSection.cancel')}
        </button>
        <button
          className={`px-4 py-2 rounded ${isFormValid() ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          onClick={handleComplete}
          disabled={isReadOnly || !isFormValid()}
        >
          {t('overviewSection.complete')}
        </button>
      </div>

      {/* CSS tùy chỉnh cho ProseMirror */}
      <style jsx>{`
        .ProseMirror {
          min-height: 100px !important;
          padding: 8px;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .ProseMirror:focus {
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
};

const OverviewSection = ({ content, setContent, isReadOnly }) => {
  const { t } = useTranslation();
  const [showOverview, setShowOverview] = useState(false);

  return (
    <div>
      {!showOverview ? (
        <div
          className="bg-white border border-blue-500 rounded-lg p-6 w-full max-w-[710px] mb-4"
          onClick={isReadOnly ? null : () => setShowOverview(true)}
        >
          <h2 className="mb-2 text-2xl font-semibold">{t('overviewSection.overview')}</h2>
          <div
            className="prose text-gray-600 max-w-none"
            dangerouslySetInnerHTML={{ __html: content.text || t('overviewSection.clickToAddDetails') }}
          />
          <div className="mt-2">
            {content.media.map((item, index) => (
              <div key={index}>
                {item.type === "image" ? (
                  <img
                    src={item.url}
                    alt="Uploaded"
                    className="w-full max-w-xs mt-2 rounded-lg"
                  />
                ) : (
                  <video
                    src={item.url}
                    controls
                    className="w-full max-w-xs mt-2 rounded-lg"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Overview
          setShowOverview={setShowOverview}
          content={content}
          setContent={setContent}
          isReadOnly={isReadOnly}
        />
      )}
    </div>
  );
};

export default OverviewSection;