import { useState } from 'react';
import { Search, Plus, Upload, Grid, List, FileText, Image, Table2, Presentation, Folder, MoreVertical, Download, Share2, Trash2 } from 'lucide-react';
import { documents, users } from '../data/mockData';

const typeIcons: Record<string, typeof FileText> = {
  pdf: FileText, doc: FileText, spreadsheet: Table2, image: Image, presentation: Presentation, folder: Folder,
};

const typeColors: Record<string, string> = {
  pdf: 'bg-red-100 text-red-600',
  doc: 'bg-blue-100 text-blue-600',
  spreadsheet: 'bg-emerald-100 text-emerald-600',
  image: 'bg-purple-100 text-purple-600',
  presentation: 'bg-amber-100 text-amber-600',
  folder: 'bg-indigo-100 text-indigo-600',
};

export default function Documents() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');

  const filtered = documents.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  const getUserName = (id: string) => users.find(u => u.id === id)?.name ?? 'Unknown';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500 mt-1">{documents.length} files · Manage and share your documents</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary"><Upload className="w-4 h-4" /> Upload</button>
          <button className="btn-primary"><Plus className="w-4 h-4" /> New Folder</button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" placeholder="Search documents..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button onClick={() => setView('grid')} className={`p-2 rounded-md ${view === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>
            <Grid className="w-4 h-4" />
          </button>
          <button onClick={() => setView('list')} className={`p-2 rounded-md ${view === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'}`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'All Files', count: documents.length, color: 'bg-indigo-100 text-indigo-600' },
          { label: 'PDFs', count: documents.filter(d => d.type === 'pdf').length, color: 'bg-red-100 text-red-600' },
          { label: 'Documents', count: documents.filter(d => d.type === 'doc').length, color: 'bg-blue-100 text-blue-600' },
          { label: 'Images', count: documents.filter(d => d.type === 'image').length, color: 'bg-purple-100 text-purple-600' },
        ].map(s => (
          <div key={s.label} className="stat-card flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{s.count}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(doc => {
            const Icon = typeIcons[doc.type] ?? FileText;
            return (
              <div key={doc.id} className="card hover:shadow-md transition-shadow cursor-pointer group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeColors[doc.type] ?? 'bg-gray-100 text-gray-600'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Download className="w-3.5 h-3.5 text-gray-500" /></button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Share2 className="w-3.5 h-3.5 text-gray-500" /></button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 truncate">{doc.name}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">{doc.size}</span>
                  <span className="text-xs text-gray-400">{doc.uploadedAt}</span>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <div className="w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-[9px] font-semibold">
                    {users.find(u => u.id === doc.uploadedBy)?.avatar}
                  </div>
                  <span className="text-xs text-gray-500">{getUserName(doc.uploadedBy)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Size</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Uploaded By</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => {
                const Icon = typeIcons[doc.type] ?? FileText;
                return (
                  <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeColors[doc.type]}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="badge bg-gray-100 text-gray-600 uppercase text-[10px]">{doc.type}</span></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{doc.size}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{getUserName(doc.uploadedBy)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{doc.uploadedAt}</td>
                    <td className="px-4 py-3"><button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-4 h-4" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
