import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  FileCode2,
  ArrowRight,
} from 'lucide-react';
import { Project } from '../../types';
import { DEFAULT_PROJECTS } from '../../lib/templates';

export type ProjectTemplateOption =
  | 'node'
  | 'typescript'
  | 'python'
  | 'java'
  | 'c'
  | 'cpp'
  | 'sql'
  | 'html'
  | 'blank';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string, templateType: ProjectTemplateOption) => void;
  onRenameProject: (id: string, newName: string) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplateOption>('node');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  if (!isOpen) return null;

  const handleConfirmCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    onCreateProject(newProjectName.trim(), selectedTemplate);
    setNewProjectName('');
    setIsCreating(false);
  };

  const handleStartRename = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditingName(project.name);
  };

  const handleConfirmRename = (id: string) => {
    if (editingName.trim()) {
      onRenameProject(id, editingName.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projects.length <= 1) {
      alert('Tidak dapat menghapus satu-satunya project yang ada.');
      return;
    }
    if (confirm(`Hapus project "${name}" beserta seluruh filenya?`)) {
      onDeleteProject(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-xl bg-white border-3 border-black shadow-[8px_8px_0px_#000000] flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#DBEAFE] border-b-2 border-black p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-[#2563EB] text-white border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base text-[#18181B] leading-none">
                Kelola Project Workspace
              </h3>
              <p className="text-[11px] font-bold text-gray-600 mt-0.5">
                Pilih, buat, atau kelola ruang kerja coding Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white border-2 border-transparent hover:border-black rounded-xs cursor-pointer text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!isCreating ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase">
                  Daftar Project ({projects.length})
                </span>
                <button
                  onClick={() => setIsCreating(true)}
                  className="flex items-center space-x-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Buat Project Baru</span>
                </button>
              </div>

              <div className="space-y-2">
                {projects.map((proj) => {
                  const isActive = proj.id === activeProjectId;
                  const isEditing = editingId === proj.id;

                  return (
                    <div
                      key={proj.id}
                      onClick={() => {
                        onSelectProject(proj.id);
                        onClose();
                      }}
                      className={`p-3.5 border-2 border-black flex items-center justify-between cursor-pointer transition-all shadow-[2px_2px_0px_#000] ${
                        isActive
                          ? 'bg-[#DBEAFE] border-[#2563EB]'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex-1 min-w-0 mr-3">
                        {isEditing ? (
                          <div
                            className="flex items-center space-x-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="text-xs font-bold bg-white px-2 py-1 border border-black w-full"
                              autoFocus
                            />
                            <button
                              onClick={() => handleConfirmRename(proj.id)}
                              className="p-1 bg-emerald-600 text-white border border-black"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-black text-sm text-[#18181B] truncate">
                                {proj.name}
                              </h4>
                              {isActive && (
                                <span className="bg-[#2563EB] text-white text-[9px] font-black uppercase px-1.5 py-0.5">
                                  Aktif
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 font-semibold truncate mt-0.5">
                              {proj.description || `${proj.files.length} file`}
                            </p>
                          </>
                        )}
                      </div>

                      {!isEditing && (
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <button
                            onClick={(e) => handleStartRename(proj, e)}
                            className="p-1.5 hover:bg-gray-200 border border-transparent hover:border-black rounded-xs text-gray-600 cursor-pointer"
                            title="Ganti Nama"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {projects.length > 1 && (
                            <button
                              onClick={(e) => handleDelete(proj.id, proj.name, e)}
                              className="p-1.5 hover:bg-red-500 hover:text-white border border-transparent hover:border-black rounded-xs text-gray-600 cursor-pointer"
                              title="Hapus Project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form onSubmit={handleConfirmCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[#18181B] uppercase mb-1">
                  Nama Project
                </label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Misal: My Python API, Web Game, Algorithm Sandbox"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-[#F3F4F6] border-2 border-black p-2 text-xs font-bold outline-none shadow-[2px_2px_0px_#000]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#18181B] uppercase mb-1.5">
                  Pilih Starter Template
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate('node')}
                    className={`p-2 border-2 border-black text-left cursor-pointer ${
                      selectedTemplate === 'node'
                        ? 'bg-[#2563EB] text-white font-black shadow-[2px_2px_0px_#000]'
                        : 'bg-white hover:bg-gray-100 text-[#18181B] font-bold'
                    }`}
                  >
                    <span className="block font-black">Node.js</span>
                    <span className="text-[10px] opacity-80">JavaScript V8</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTemplate('typescript')}
                    className={`p-2 border-2 border-black text-left cursor-pointer ${
                      selectedTemplate === 'typescript'
                        ? 'bg-[#2563EB] text-white font-black shadow-[2px_2px_0px_#000]'
                        : 'bg-white hover:bg-gray-100 text-[#18181B] font-bold'
                    }`}
                  >
                    <span className="block font-black">TypeScript</span>
                    <span className="text-[10px] opacity-80">TSX / Typings</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTemplate('python')}
                    className={`p-2 border-2 border-black text-left cursor-pointer ${
                      selectedTemplate === 'python'
                        ? 'bg-[#2563EB] text-white font-black shadow-[2px_2px_0px_#000]'
                        : 'bg-white hover:bg-gray-100 text-[#18181B] font-bold'
                    }`}
                  >
                    <span className="block font-black">Python 3</span>
                    <span className="text-[10px] opacity-80">Math & Pip</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTemplate('java')}
                    className={`p-2 border-2 border-black text-left cursor-pointer ${
                      selectedTemplate === 'java'
                        ? 'bg-[#2563EB] text-white font-black shadow-[2px_2px_0px_#000]'
                        : 'bg-white hover:bg-gray-100 text-[#18181B] font-bold'
                    }`}
                  >
                    <span className="block font-black">Java 21</span>
                    <span className="text-[10px] opacity-80">javac + JVM</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTemplate('c')}
                    className={`p-2 border-2 border-black text-left cursor-pointer ${
                      selectedTemplate === 'c'
                        ? 'bg-[#2563EB] text-white font-black shadow-[2px_2px_0px_#000]'
                        : 'bg-white hover:bg-gray-100 text-[#18181B] font-bold'
                    }`}
                  >
                    <span className="block font-black">C Language</span>
                    <span className="text-[10px] opacity-80">Clang / GCC</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTemplate('cpp')}
                    className={`p-2 border-2 border-black text-left cursor-pointer ${
                      selectedTemplate === 'cpp'
                        ? 'bg-[#2563EB] text-white font-black shadow-[2px_2px_0px_#000]'
                        : 'bg-white hover:bg-gray-100 text-[#18181B] font-bold'
                    }`}
                  >
                    <span className="block font-black">C++ Modern</span>
                    <span className="text-[10px] opacity-80">Clang++ / G++</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTemplate('sql')}
                    className={`p-2 border-2 border-black text-left cursor-pointer ${
                      selectedTemplate === 'sql'
                        ? 'bg-[#2563EB] text-white font-black shadow-[2px_2px_0px_#000]'
                        : 'bg-white hover:bg-gray-100 text-[#18181B] font-bold'
                    }`}
                  >
                    <span className="block font-black">SQL Database</span>
                    <span className="text-[10px] opacity-80">SQLite Online</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTemplate('html')}
                    className={`p-2 border-2 border-black text-left cursor-pointer ${
                      selectedTemplate === 'html'
                        ? 'bg-[#2563EB] text-white font-black shadow-[2px_2px_0px_#000]'
                        : 'bg-white hover:bg-gray-100 text-[#18181B] font-bold'
                    }`}
                  >
                    <span className="block font-black">HTML5 Canvas</span>
                    <span className="text-[10px] opacity-80">Live Preview</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTemplate('blank')}
                    className={`p-2 border-2 border-black text-left cursor-pointer ${
                      selectedTemplate === 'blank'
                        ? 'bg-[#2563EB] text-white font-black shadow-[2px_2px_0px_#000]'
                        : 'bg-white hover:bg-gray-100 text-[#18181B] font-bold'
                    }`}
                  >
                    <span className="block font-black">Blank</span>
                    <span className="text-[10px] opacity-80">Workspace kosong</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="bg-white hover:bg-gray-100 font-bold text-xs px-4 py-2 border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs px-5 py-2 border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  Buat Project
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F3F4F6] border-t-2 border-black p-3 flex justify-end">
          <button
            onClick={onClose}
            className="bg-white hover:bg-gray-100 font-black text-xs px-4 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
