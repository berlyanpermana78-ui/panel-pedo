import React, { useState } from 'react';
import {
  FolderTree,
  FileCode,
  FilePlus,
  Trash2,
  Edit2,
  File,
  RotateCcw,
  Plus,
  Check,
  X,
} from 'lucide-react';
import { Project, ProjectFile } from '../../types';
import { detectLanguageFromFilename } from '../../lib/templates';

interface FileExplorerProps {
  project: Project;
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (fileName: string) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onDeleteFile: (fileId: string) => void;
  onResetProject: () => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  project,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
  onResetProject,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingFileName, setEditingFileName] = useState('');

  const handleStartCreate = () => {
    setIsCreating(true);
    setNewFileName('');
  };

  const handleConfirmCreate = () => {
    const cleanName = newFileName.trim().replace(/[/\\]/g, '');
    if (cleanName) {
      onCreateFile(cleanName);
      setIsCreating(false);
      setNewFileName('');
    }
  };

  const handleStartRename = (file: ProjectFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFileId(file.id);
    setEditingFileName(file.name);
  };

  const handleConfirmRename = (fileId: string) => {
    const cleanName = editingFileName.trim().replace(/[/\\]/g, '');
    if (cleanName) {
      onRenameFile(fileId, cleanName);
    }
    setEditingFileId(null);
  };

  const handleDelete = (file: ProjectFile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (project.files.length <= 1) {
      alert('Tidak dapat menghapus satu-satunya file yang tersisa.');
      return;
    }
    if (confirm(`Hapus file "${file.name}"?`)) {
      onDeleteFile(file.id);
    }
  };

  const getFileBadgeColor = (lang: string) => {
    switch (lang) {
      case 'javascript':
        return 'text-amber-600 bg-amber-50';
      case 'typescript':
        return 'text-blue-600 bg-blue-50';
      case 'python':
        return 'text-emerald-700 bg-emerald-50';
      case 'html':
        return 'text-orange-600 bg-orange-50';
      case 'css':
        return 'text-cyan-700 bg-cyan-50';
      case 'json':
        return 'text-yellow-700 bg-yellow-50';
      case 'java':
        return 'text-red-700 bg-red-50';
      case 'c':
        return 'text-sky-700 bg-sky-50';
      case 'cpp':
        return 'text-indigo-700 bg-indigo-50';
      case 'sql':
        return 'text-emerald-700 bg-emerald-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="w-full h-full bg-[#FFFFFF] border-r-3 border-black flex flex-col select-none">
      {/* Explorer Header */}
      <div className="p-3 border-b-2 border-black flex items-center justify-between bg-[#F3F4F6]">
        <div className="flex items-center space-x-2">
          <FolderTree className="w-4 h-4 text-[#2563EB]" />
          <span className="text-xs font-black uppercase text-[#18181B] tracking-wider">
            Files ({project.files.length})
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleStartCreate}
            className="p-1 hover:bg-white border border-transparent hover:border-black rounded-xs text-[#18181B] cursor-pointer"
            title="Tambah File Baru"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={onResetProject}
            className="p-1 hover:bg-white border border-transparent hover:border-black rounded-xs text-gray-500 hover:text-red-600 cursor-pointer"
            title="Reset ke Template Default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* New file input form */}
        {isCreating && (
          <div className="p-1.5 bg-[#DBEAFE] border-2 border-black mb-2 flex items-center space-x-1 shadow-[2px_2px_0px_#000]">
            <input
              type="text"
              autoFocus
              placeholder="e.g. script.js"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmCreate();
                if (e.key === 'Escape') setIsCreating(false);
              }}
              className="flex-1 text-xs font-mono font-bold bg-white px-2 py-1 border border-black outline-none"
            />
            <button
              onClick={handleConfirmCreate}
              className="p-1 bg-emerald-600 text-white border border-black cursor-pointer"
              title="Simpan"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={() => setIsCreating(false)}
              className="p-1 bg-red-500 text-white border border-black cursor-pointer"
              title="Batal"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {project.files.map((file) => {
          const isActive = file.id === activeFileId;
          const isEditing = editingFileId === file.id;

          return (
            <div
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              className={`group flex items-center justify-between px-2.5 py-1.5 border-2 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#2563EB] text-white border-black shadow-[2px_2px_0px_#000]'
                  : 'bg-white hover:bg-gray-100 text-[#18181B] border-transparent hover:border-black'
              }`}
            >
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <FileCode className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-gray-500'}`} />

                {isEditing ? (
                  <div
                    className="flex items-center space-x-1 flex-1 mr-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      autoFocus
                      value={editingFileName}
                      onChange={(e) => setEditingFileName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmRename(file.id);
                        if (e.key === 'Escape') setEditingFileId(null);
                      }}
                      className="w-full text-xs font-mono bg-white text-black px-1 py-0.5 border border-black"
                    />
                    <button
                      onClick={() => handleConfirmRename(file.id)}
                      className="p-0.5 bg-emerald-600 text-white border border-black"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span className="font-mono truncate">{file.name}</span>
                )}
              </div>

              {!isEditing && (
                <div className="flex items-center space-x-1 shrink-0">
                  <span
                    className={`text-[9px] font-mono uppercase px-1 py-0.2 border border-black/20 ${
                      isActive ? 'bg-white text-black' : getFileBadgeColor(file.language)
                    }`}
                  >
                    {file.language}
                  </span>

                  {/* Actions visible on hover or active */}
                  <div className={`flex items-center space-x-0.5 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button
                      onClick={(e) => handleStartRename(file, e)}
                      className={`p-1 hover:bg-black/10 rounded-xs cursor-pointer ${isActive ? 'text-white' : 'text-gray-500'}`}
                      title="Ganti Nama File"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    {project.files.length > 1 && (
                      <button
                        onClick={(e) => handleDelete(file, e)}
                        className={`p-1 hover:bg-red-500 hover:text-white rounded-xs cursor-pointer ${
                          isActive ? 'text-white' : 'text-gray-500'
                        }`}
                        title="Hapus File"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Explorer Footer Quick Action */}
      <div className="p-2 border-t-2 border-black bg-[#F3F4F6]">
        <button
          onClick={handleStartCreate}
          className="w-full flex items-center justify-center space-x-1.5 bg-white hover:bg-gray-100 text-[#18181B] font-extrabold text-xs py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
        >
          <FilePlus className="w-3.5 h-3.5" />
          <span>File Baru</span>
        </button>
      </div>
    </div>
  );
};
