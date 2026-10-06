import React, { useState } from 'react';
import {
  Layers,
  Check,
  X,
  Code2,
  Terminal,
  Cpu,
  Globe,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { Project, ProjectFile } from '../../types';
import { TEMPLATES_CATALOG, ProjectTemplateItem } from '../../lib/project/templates';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProjectFromTemplate: (newProject: Project) => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onCreateProjectFromTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplateItem>(TEMPLATES_CATALOG[0]);
  const [projectName, setProjectName] = useState(TEMPLATES_CATALOG[0].name);

  // Customization options
  const [packageManager, setPackageManager] = useState<'npm' | 'yarn' | 'pnpm' | 'pip' | 'none'>('npm');
  const [createReadme, setCreateReadme] = useState(true);
  const [initGit, setInitGit] = useState(true);

  if (!isOpen) return null;

  const categories = [
    'All',
    'Web',
    'Node.js',
    'TypeScript',
    'Python',
    'Java',
    'C / C++',
    'SQL',
    'React',
    'Next.js',
    'Empty',
  ];

  const filteredTemplates =
    selectedCategory === 'All'
      ? TEMPLATES_CATALOG
      : TEMPLATES_CATALOG.filter((t) => t.category === selectedCategory);

  const handleSelectTemplate = (template: ProjectTemplateItem) => {
    setSelectedTemplate(template);
    setProjectName(template.name);
    if (template.category === 'Python') {
      setPackageManager('pip');
    } else if (
      template.category === 'Web' ||
      template.category === 'Empty' ||
      template.category === 'Java' ||
      template.category === 'C / C++' ||
      template.category === 'SQL'
    ) {
      setPackageManager('none');
    } else {
      setPackageManager('npm');
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = projectName.trim() || selectedTemplate.name;

    // Clone files
    let files: ProjectFile[] = JSON.parse(JSON.stringify(selectedTemplate.files));

    if (!createReadme) {
      files = files.filter((f) => f.name.toLowerCase() !== 'readme.md');
    }

    if (initGit) {
      files.push({
        id: 'f_gitignore_' + Date.now(),
        name: '.gitignore',
        path: '.gitignore',
        language: 'bash',
        content: `node_modules/\n.venv/\ndist/\n.next/\n.env*\n*.log\n`,
      });
    }

    const newProject: Project = {
      id: 'proj_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      name: finalName,
      description: selectedTemplate.description,
      defaultFile: selectedTemplate.defaultFile,
      templateType: selectedTemplate.id,
      files,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      snapshots: [
        {
          id: 'snap_init_' + Date.now(),
          timestamp: Date.now(),
          description: `Initial creation from ${selectedTemplate.name} template`,
          files: JSON.parse(JSON.stringify(files)),
        },
      ],
    };

    onCreateProjectFromTemplate(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-3xl bg-white border-3 border-black shadow-[8px_8px_0px_#000000] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#18181B] text-white p-4 border-b-2 border-black flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-[#2563EB] border-2 border-white flex items-center justify-center shadow-[2px_2px_0px_#000]">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-black text-base leading-none">Katalog Template Project</h3>
              <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                Pilih starter code terverifikasi & sesuaikan konfigurasi awal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="bg-gray-100 border-b-2 border-black px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-black border border-black cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#2563EB] text-white shadow-[1px_1px_0px_#000]'
                  : 'bg-white hover:bg-gray-200 text-gray-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Content Area: Grid of Templates + Customizer Form */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-12 gap-4 bg-gray-50">
          {/* Left: Template Selector Cards (7 cols) */}
          <div className="md:col-span-7 space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredTemplates.map((t) => {
              const isSelected = selectedTemplate.id === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  className={`p-3 border-2 border-black cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#DBEAFE] shadow-[3px_3px_0px_#000]'
                      : 'bg-white hover:bg-gray-100 shadow-[1px_1px_0px_#000]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-black text-sm text-[#18181B]">{t.name}</span>
                    <span className="text-[10px] font-mono font-bold bg-white text-black px-1.5 py-0.2 border border-black">
                      {t.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{t.description}</p>
                  <div className="mt-2 text-[10px] font-mono text-gray-400">
                    {t.files.length} file starter • Entry: {t.defaultFile}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Customization Form (5 cols) */}
          <form onSubmit={handleCreate} className="md:col-span-5 bg-white border-2 border-black p-4 space-y-3.5 shadow-[3px_3px_0px_#000]">
            <div className="pb-2 border-b-2 border-black">
              <span className="text-xs font-black uppercase text-[#18181B] block">
                Kustomisasi Project
              </span>
              <span className="text-[11px] font-semibold text-gray-500">
                Template: <strong>{selectedTemplate.name}</strong>
              </span>
            </div>

            <div>
              <label className="block text-xs font-black text-[#18181B] mb-1">
                Nama Project:
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full bg-[#F3F4F6] border-2 border-black px-2.5 py-1.5 text-xs font-bold outline-none shadow-[1px_1px_0px_#000]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-black text-[#18181B] mb-1">
                Package Manager:
              </label>
              <select
                value={packageManager}
                onChange={(e) => setPackageManager(e.target.value as any)}
                className="w-full bg-[#F3F4F6] border-2 border-black px-2 py-1.5 text-xs font-bold outline-none shadow-[1px_1px_0px_#000]"
              >
                <option value="npm">npm</option>
                <option value="pnpm">pnpm</option>
                <option value="yarn">yarn</option>
                <option value="pip">pip (Python)</option>
                <option value="none">none (Static)</option>
              </select>
            </div>

            <div className="space-y-2 pt-1 border-t border-gray-200">
              <label className="flex items-center space-x-2 text-xs font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={createReadme}
                  onChange={(e) => setCreateReadme(e.target.checked)}
                  className="accent-[#2563EB]"
                />
                <span>Generate README.md</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={initGit}
                  onChange={(e) => setInitGit(e.target.checked)}
                  className="accent-[#2563EB]"
                />
                <span>Initialize .gitignore</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full mt-4 flex items-center justify-center space-x-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs py-2.5 border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer active:translate-x-[1px] active:translate-y-[1px]"
            >
              <span>Buat & Buka Project</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-[#F3F4F6] border-t-2 border-black p-3 flex justify-between items-center">
          <span className="text-[11px] font-semibold text-gray-500">
            Total {TEMPLATES_CATALOG.length} starter template terverifikasi runnable.
          </span>
          <button
            onClick={onClose}
            className="bg-white hover:bg-gray-100 font-bold text-xs px-3.5 py-1.5 border-2 border-black shadow-[1px_1px_0px_#000] cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
