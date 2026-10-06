import React, { useState, useMemo } from 'react';
import {
  RotateCw,
  Monitor,
  Tablet,
  Smartphone,
  Maximize2,
  ExternalLink,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { Project } from '../../types';

interface HtmlPreviewProps {
  project: Project;
  onClose?: () => void;
}

type ViewportMode = 'responsive' | 'desktop' | 'tablet' | 'mobile';

export const HtmlPreview: React.FC<HtmlPreviewProps> = ({ project, onClose }) => {
  const [key, setKey] = useState(0);
  const [viewport, setViewport] = useState<ViewportMode>('responsive');

  const reloadPreview = () => {
    setKey((prev) => prev + 1);
  };

  // Compile HTML document with project files bundled
  const compiledDoc = useMemo(() => {
    const htmlFile = project.files.find((f) => f.name.endsWith('.html')) || project.files[0];
    let rawHtml = htmlFile?.content || '<h1>No HTML file found</h1>';

    // Collect all CSS files in project and inject into preview
    const cssFiles = project.files.filter((f) => f.name.endsWith('.css'));
    const cssBundle = cssFiles.map((f) => `/* ${f.name} */\n${f.content}`).join('\n\n');

    // Collect all JS files in project and inject into preview if not already included
    const jsFiles = project.files.filter((f) => f.name.endsWith('.js') && !f.name.includes('config'));
    const jsBundle = jsFiles.map((f) => `// ${f.name}\n${f.content}`).join('\n\n');

    // Inject styles and scripts safely into HTML
    if (cssBundle) {
      if (rawHtml.includes('</head>')) {
        rawHtml = rawHtml.replace('</head>', `<style>\n${cssBundle}\n</style>\n</head>`);
      } else {
        rawHtml = `<style>\n${cssBundle}\n</style>\n` + rawHtml;
      }
    }

    if (jsBundle) {
      const scriptTag = `<script>\n${jsBundle}\n</script>`;
      if (rawHtml.includes('</body>')) {
        rawHtml = rawHtml.replace('</body>', `${scriptTag}\n</body>`);
      } else {
        rawHtml = rawHtml + '\n' + scriptTag;
      }
    }

    return rawHtml;
  }, [project.files]);

  const getViewportWidth = () => {
    switch (viewport) {
      case 'mobile':
        return '375px';
      case 'tablet':
        return '768px';
      case 'desktop':
        return '1024px';
      default:
        return '100%';
    }
  };

  return (
    <div className="w-full h-full bg-[#E5E7EB] border-l-3 border-black flex flex-col">
      {/* Preview Header Toolbar */}
      <div className="bg-white border-b-2 border-black p-2 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black animate-pulse" />
          <span className="text-xs font-black uppercase text-[#18181B] tracking-tight">
            HTML Preview
          </span>
        </div>

        {/* Viewport Width Controls */}
        <div className="flex items-center space-x-1 bg-gray-100 p-1 border border-black rounded-xs">
          <button
            onClick={() => setViewport('responsive')}
            className={`p-1 rounded-xs text-xs font-bold transition-all cursor-pointer ${
              viewport === 'responsive' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-gray-500 hover:text-black'
            }`}
            title="Responsif (100%)"
          >
            Auto
          </button>
          <button
            onClick={() => setViewport('desktop')}
            className={`p-1 rounded-xs transition-all cursor-pointer ${
              viewport === 'desktop' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-gray-500 hover:text-black'
            }`}
            title="Desktop (1024px)"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`p-1 rounded-xs transition-all cursor-pointer ${
              viewport === 'tablet' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-gray-500 hover:text-black'
            }`}
            title="Tablet (768px)"
          >
            <Tablet className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`p-1 rounded-xs transition-all cursor-pointer ${
              viewport === 'mobile' ? 'bg-white text-[#2563EB] shadow-xs' : 'text-gray-500 hover:text-black'
            }`}
            title="Mobile (375px)"
          >
            <Smartphone className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Refresh & Close Action */}
        <div className="flex items-center space-x-1">
          <button
            onClick={reloadPreview}
            className="p-1 hover:bg-gray-100 border border-black bg-white shadow-[1px_1px_0px_#000] cursor-pointer"
            title="Refresh Preview"
          >
            <RotateCw className="w-3.5 h-3.5 text-gray-700" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs font-bold px-2 py-0.5 border border-black bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer"
            >
              Tutup
            </button>
          )}
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-2 sm:p-4 bg-zinc-200/60">
        <div
          className="h-full bg-white border-2 border-black shadow-[4px_4px_0px_#000] transition-all duration-200 overflow-hidden flex flex-col"
          style={{ width: getViewportWidth(), maxWidth: '100%' }}
        >
          <iframe
            key={key}
            title="BILZX CODEX Live Preview"
            srcDoc={compiledDoc}
            sandbox="allow-scripts allow-modals"
            className="w-full h-full border-none bg-white"
          />
        </div>
      </div>
    </div>
  );
};
