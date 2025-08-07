import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import SectionEvent from "./SegmentEvent";
import UploadContainer from "./UploadImg";
import DatetimeLocation from "./EventDateLocate";
import OverviewSection from "./OverviewSection";
import Loader from "../../components/Loading";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import DOMPurify from 'dompurify';

const EventForm = ({ event, setEvent, onNext, isReadOnly }) => {
  const { t } = useTranslation();
  const [showOverview, setShowOverview] = useState(false);
  const [loading, setLoading] = useState(true);
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
    content: event.eventDesc || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const plainText = editor.getText().replace(/\n/g, '');
      if (plainText.length <= 20000) {
        setEvent({ ...event, eventDesc: html });
        setPasteError('');
      } else {
        const truncatedText = plainText.slice(0, 20000);
        const newHtml = `<p>${truncatedText}</p>`;
        editor.commands.setContent(newHtml);
        setEvent({ ...event, eventDesc: newHtml });
        setPasteError(t('eventForm.pasteError'));
      }
    },
    editorProps: {
      handlePaste: (view, event) => {
        const clipboardData = event.clipboardData.getData('text/plain');
        if (clipboardData) {
          const currentText = view.state.doc.textContent.replace(/\n/g, '');
          const newText = currentText + clipboardData.replace(/\n/g, '');
          if (newText.length > 20000) {
            const allowedText = clipboardData.slice(0, 20000 - currentText.length);
            view.dispatch(
              view.state.tr.insertText(allowedText, view.state.selection.from)
            );
            setPasteError(t('eventForm.pasteError'));
            return true;
          }
        }
        return false;
      },
    },
  });

  // Đếm ký tự (loại bỏ thẻ HTML)
  const getCharacterCount = () => {
    const plainText = event.eventDesc.replace(/<[^>]+>/g, '').replace(/\n/g, '');
    return plainText.length;
  };

  // Kiểm tra xem eventName và eventDesc có hợp lệ không
  const isFormValid = () => {
    const hasEventName = event.eventName && event.eventName.trim() !== '';
    const hasEventDesc = event.eventDesc && event.eventDesc.replace(/<[^>]+>/g, '').trim() !== '';
    return hasEventName && hasEventDesc;
  };

  // Hàm cập nhật eventLocation
  const handleLocationUpdate = (updatedLocation) => {
    if (isReadOnly) return;
    setEvent((prevEvent) => ({
      ...prevEvent,
      eventLocation: updatedLocation,
    }));
  };

  // Hàm cập nhật segment
  const handleSegmentUpdate = (updatedSegments) => {
    if (isReadOnly) return;
    setEvent((prevEvent) => ({
      ...prevEvent,
      segment: updatedSegments,
    }));
  };

  // Hàm cập nhật overviewContent
  const handleContentUpdate = (newContent) => {
    if (isReadOnly) return;
    setEvent((prev) => ({
      ...prev,
      overviewContent: newContent,
    }));
  };

  // Hàm cập nhật uploadedImages
  const handleImagesUpdate = (newImages) => {
    if (isReadOnly) return;
    setEvent((prev) => ({
      ...prev,
      uploadedImages: newImages,
    }));
  };

  // Xử lý thay đổi cho các input khác (eventName)
  const handleChange = (e) => {
    if (isReadOnly) return;
    const { name, value } = e.target;
    setEvent((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Xử lý khi nhấn Complete
  const handleComplete = () => {
    if (isFormValid()) {
      setShowOverview(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  // Đồng bộ editor với event.eventDesc khi event thay đổi
  useEffect(() => {
    if (editor && event.eventDesc !== editor.getHTML()) {
      editor.commands.setContent(event.eventDesc || '');
    }
  }, [editor, event.eventDesc]);

  return (
    <div className="max-w-3xl p-4 mx-auto">
      {isReadOnly && (
        <p className="mb-4 text-red-500">
          {t('eventForm.readOnlyMessage')}
        </p>
      )}
      {/* Image Upload Section */}
      <UploadContainer
        uploadedImages={event.uploadedImages || []}
        setUploadedImages={handleImagesUpdate}
        isReadOnly={isReadOnly}
      />

      {/* Event Overview Section */}
      {!showOverview ? (
        <div
          className="bg-white border border-blue-500 rounded-lg p-6 w-full max-w-[710px] mb-4"
          onClick={() => setShowOverview(true)}
        >
          <h2 className="mb-2 text-5xl font-semibold">
            {event.eventName || t('eventForm.noTitle')}
          </h2>
          <div
            className="prose text-gray-600 max-w-none"
            dangerouslySetInnerHTML={{
              __html: event.eventDesc
                ? DOMPurify.sanitize(event.eventDesc)
                : t('eventForm.noSummary'),
            }}
          />
        </div>
      ) : (
        <div className="bg-white border border-blue-500 rounded-lg p-6 w-full max-w-[710px] mb-4">
          <h1 className="mb-6 text-2xl font-bold">{t('eventForm.eventOverview')}</h1>

          <div className="mb-6">
            <h2 className="flex mb-2 text-lg font-semibold">
              {t('eventForm.eventTitle')} <p className="ml-2 text-red-500"></p>
            </h2>
            <label className="block">
              <input
                type="text"
                name="eventName"
                className="block w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                value={event.eventName || ""}
                onChange={handleChange}
                disabled={isReadOnly}
              />
              {!event.eventName?.trim() && (
                <p className="mt-1 text-sm text-red-500">{t('eventForm.eventTitleRequired')}</p>
              )}
            </label>
          </div>

          <div className="mb-6">
            <h2 className="flex mb-2 text-lg font-semibold">
              {t('eventForm.summary')} <p className="ml-2 text-red-500"></p>
            </h2>
            <label className="block">
              <div className="block w-full mt-1 border border-gray-300 rounded-md shadow-sm">
                <div className="p-2 border-b border-gray-200 bg-gray-50 rounded-t-md">
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    disabled={isReadOnly}
                    className={`px-2 py-1 mr-1 border border-gray-300 rounded cursor-pointer hover:bg-gray-100 ${editor?.isActive('bold') ? 'bg-blue-600 text-white' : 'bg-none'} 
                    ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {t('eventForm.bold')}
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    disabled={isReadOnly}
                    className={`px-2 py-1 mr-1 border border-gray-300 rounded cursor-pointer hover:bg-gray-100 ${editor?.isActive('italic') ? 'bg-blue-600 text-white' : 'bg-none'}
                    ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {t('eventForm.italic')}
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    disabled={isReadOnly}
                    className={`px-2 py-1 mr-1 border border-gray-300 rounded cursor-pointer hover:bg-gray-100 ${editor?.isActive('underline') ? 'bg-blue-600 text-white' : 'bg-none'}
                    ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {t('eventForm.underline')}
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    disabled={isReadOnly}
                    className={`px-2 py-1 mr-1 border border-gray-300 rounded cursor-pointer hover:bg-gray-100 ${editor?.isActive('bulletList') ? 'bg-blue-600 text-white' : 'bg-none'}
                    ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {t('eventForm.bulletList')}
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleLink({ href: prompt('Enter URL') }).run()}
                    disabled={isReadOnly}
                    className={`px-2 py-1 mr-1 border border-gray-300 rounded cursor-pointer hover:bg-gray-100 ${editor?.isActive('link') ? 'bg-blue-600 text-white' : 'bg-none'}
                    ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {t('eventForm.link')}
                  </button>
                </div>
                <EditorContent
                  editor={editor}
                  className="p-2 min-h-[100px] border-none outline-none focus:ring-0"
                />
              </div>
              {(!event.eventDesc || event.eventDesc.replace(/<[^>]+>/g, '').trim() === '') && (
                <p className="mt-1 text-sm text-red-500">{t('eventForm.summaryRequired')}</p>
              )}
            </label>
            <div className="mt-1 text-right text-gray-600">
              {t('eventForm.characterCount', { count: getCharacterCount() })}
            </div>
            {pasteError && (
              <div className="mt-1 text-red-500">{pasteError}</div>
            )}
          </div>

          <div className="flex items-center text-blue-500">
            <button
              className={`mt-4 px-6 py-2 rounded-lg ${isFormValid() ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              onClick={handleComplete}
              disabled={!isFormValid()}
            >
              {t('eventForm.complete')}
            </button>
          </div>
        </div>
      )}

      <DatetimeLocation
        locationData={event.eventLocation || {}}
        onLocationUpdate={handleLocationUpdate}
        isReadOnly={isReadOnly}
      />
      <SectionEvent
        segmentData={event.segment}
        onSegmentUpdate={handleSegmentUpdate}
        eventStart={event.eventLocation?.startTime}
        eventEnd={event.eventLocation?.endTime}
        isReadOnly={isReadOnly}
      />
      <OverviewSection
        content={event.overviewContent || { text: "", media: [] }}
        setContent={handleContentUpdate}
        isReadOnly={isReadOnly}
      />

      {/* Save Button */}
      <div className="text-right">
        {!isReadOnly && (
          <button
            className="px-6 py-2 text-white bg-orange-600 rounded-lg"
            onClick={onNext}
          >
            {t('eventForm.saveAndContinue')}
          </button>
        )}
      </div>

      {/* CSS tùy chỉnh cho ProseMirror */}
      <style>{`
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

export default EventForm;