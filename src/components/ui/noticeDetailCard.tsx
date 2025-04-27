'use client';

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Save, Edit } from "lucide-react";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const API_DOMAIN = "https://wp9s6wxn0h.execute-api.us-east-1.amazonaws.com";

export default function NoticeDetailCard({
  initialNotice,
  onToast,
  onDelete,
}: {
  initialNotice: any;
  onToast: (title: string, message: string) => void;
  onDelete: (id: string) => void;
}) {
  const [notice, setNotice] = useState(initialNotice);
  const [editMode, setEditMode] = useState(false);
  const [originalNotice, setOriginalNotice] = useState(initialNotice);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    setIsChanged(
      notice.title !== originalNotice.title ||
      notice.description !== originalNotice.description
    );
  }, [notice, originalNotice]);

  async function handleToggleRead() {
    const updatedIsRead = !notice.isRead;

    try {
      const response = await fetch(`${API_DOMAIN}/trigger-read/${notice.id}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error('Failed to update read status');
      }

      setNotice({ ...notice, isRead: updatedIsRead });
      handleNotification(updatedIsRead ? "Marked as Read" : "Marked as Unread");
    } catch (error) {
      console.error(error);
      handleNotification("Failed to update read status");
    }
  }

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setNotice({ ...notice, title: e.target.value });
  }

  function handleDescriptionChange(value: string) {
    setNotice({ ...notice, description: value });
  }

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;

    try {
      const response = await fetch(`${API_DOMAIN}/delete-notice/${notice.id}`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to delete notice");
      }

      onDelete(notice.id);
      handleNotification("Notice deleted successfully");
    } catch (error) {
      console.error(error);
      handleNotification("Failed to delete notice");
    }
  }

  function handleAttachmentUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const newAttachment = {
        id: `attach-${Date.now()}`,
        url: URL.createObjectURL(e.target.files[0]),
        type: e.target.files[0].type.startsWith("image") ? "image" : "video",
      };
      setNotice({ ...notice, attachments: [...notice.attachments, newAttachment] });
      handleNotification("Attachment uploaded");
    }
  }

  function handleAttachmentRemove(id: string) {
    setNotice({ ...notice, attachments: notice.attachments.filter(a => a.id !== id) });
    handleNotification("Attachment removed");
  }

  function handleSave() {
    setOriginalNotice(notice);
    setEditMode(false);
    setIsChanged(false);
    handleNotification("Notice updated successfully");
  }

  function handleNotification(message: string) {
    onToast(notice.title, message);
  }

  return (
    <div className="relative p-4 w-full min-w-[600px]">
      {/* Outer Card */}
      <div className="relative border rounded-2xl shadow-md p-6 pt-10 bg-white flex flex-col h-full overflow-hidden">
        {/* 🔵 Solid Dark Blue Filler at Top */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-orange-700 to-red-200 rounded-t-2xl"></div>

        {/* Header - Title and Read/Unread Toggle */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex-1">
            {editMode ? (
              <input
                type="text"
                value={notice.title}
                onChange={handleTitleChange}
                placeholder="Enter Notice Title..."
                className="border p-2 w-full rounded text-xl font-bold"
              />
            ) : (
              <div className="text-2xl font-bold truncate">{notice.title}</div>
            )}
          </div>
          <div className="flex items-center ml-4">
            <input
              type="checkbox"
              checked={notice.isRead}
              onChange={handleToggleRead}
              className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-4 flex-1">
          <label className="block mb-2 font-semibold">Description</label>
          <ReactQuill
            key={editMode ? "edit" : "read"}
            value={notice.description}
            onChange={handleDescriptionChange}
            readOnly={!editMode}
            theme={editMode ? "snow" : "bubble"}
            className="h-full"
          />
        </div>

        {/* Attachments */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold">Attachments</label>
          <div className="flex flex-wrap gap-4 mb-2">
            {notice.attachments.map(att => (
              <div key={att.id} className="relative">
                {att.type === "image" ? (
                  <img src={att.url} alt="Attachment" className="w-64 h-40 object-cover rounded" />
                ) : (
                  <video
                    src={att.url}
                    controls
                    preload="metadata"
                    className="w-64 h-40 rounded shadow-md"
                  />
                )}
                <button
                  onClick={() => handleAttachmentRemove(att.id)}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded"
                >
                  X
                </button>
              </div>
            ))}
          </div>
          <input type="file" onChange={handleAttachmentUpload} />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={() => setEditMode(!editMode)}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            <Edit className="h-5 w-5" />
            {editMode ? "Cancel" : ""}
          </button>
          <button
            onClick={handleSave}
            disabled={!isChanged}
            className={`flex items-center gap-2 px-4 py-2 rounded ${isChanged ? "bg-indigo-500 hover:bg-indigo-600 text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
          >
            <Save className="h-5 w-5" />
          </button>
        </div>

        {/* Delete Button */}
        <button
          onClick={handleDelete}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded"
        >
          Delete Notice
        </button>
      </div>
    </div>
  );
}
