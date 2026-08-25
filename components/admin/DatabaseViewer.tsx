"use client";

import { useState, useEffect } from "react";
import { 
  Database, Search, RefreshCw, ChevronLeft, ChevronRight, 
  Table as TableIcon, Pencil, Trash2, X, Save
} from "lucide-react";
import { toast } from "react-hot-toast";

interface TableInfo {
  name: string;
  count: number;
}

interface ColumnInfo {
  name: string;
  type: string;
  isPrimaryKey: boolean;
}

export default function DatabaseViewer() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [searchTable, setSearchTable] = useState("");
  const [loadingTables, setLoadingTables] = useState(true);
  
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 });

  // Edit State
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
        fetchData(selectedTable, 1);
    } else {
        setData([]);
        setColumns([]);
    }
  }, [selectedTable]);

  async function fetchTables() {
    setLoadingTables(true);
    try {
        const res = await fetch("/api/admin/database/tables");
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        setTables(json.tables);
    } catch (e) {
        toast.error("Failed to load tables");
    } finally {
        setLoadingTables(false);
    }
  }

  async function fetchData(tableName: string, page: number) {
    setLoadingData(true);
    try {
        const res = await fetch("/api/admin/database/data", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tableName, page, limit: 50 })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        
        setData(json.data);
        setColumns(json.columns);
        setPagination(json.pagination);
    } catch (e: any) {
        toast.error(e.message);
    } finally {
        setLoadingData(false);
    }
  }

  const handleDelete = async (row: any) => {
    if (!selectedTable) return;
    
    // Identify PKs
    const identifiers: any = {};
    const pkCols = columns.filter(c => c.isPrimaryKey);
    
    if (pkCols.length > 0) {
        pkCols.forEach(c => identifiers[c.name] = row[c.name]);
    } else if (row._ctid) {
        identifiers["_ctid"] = row._ctid;
    } else {
        toast.error("Cannot delete: No primary key or row ID found");
        return;
    }

    if (!confirm("Are you sure you want to delete this record? This cannot be undone.")) return;

    try {
        const res = await fetch("/api/admin/database/data", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tableName: selectedTable,
                identifiers
            })
        });
        const json = await res.json();
        
        if (!res.ok) throw new Error(json.error);
        
        toast.success("Record deleted");
        fetchData(selectedTable, pagination.page); // Refresh
    } catch (e: any) {
        toast.error(e.message);
    }
  };

  const openEditModal = (row: any) => {
    setEditingRow(row);
    setEditFormData({ ...row }); // Clone data
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedTable || !editingRow) return;

    // Identify PKs
    const identifiers: any = {};
    const pkCols = columns.filter(c => c.isPrimaryKey);
    
    if (pkCols.length > 0) {
        pkCols.forEach(c => identifiers[c.name] = editingRow[c.name]);
    } else if (editingRow._ctid) {
        identifiers["_ctid"] = editingRow._ctid;
    } else {
        toast.error("Cannot update: No primary key or row ID found");
        return;
    }

    setSaving(true);
    try {
        const res = await fetch("/api/admin/database/data", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tableName: selectedTable,
                identifiers,
                data: editFormData
            })
        });
        const json = await res.json();
        
        if (!res.ok) throw new Error(json.error);
        
        toast.success("Record updated");
        setIsEditModalOpen(false);
        fetchData(selectedTable, pagination.page); // Refresh
    } catch (e: any) {
        toast.error(e.message);
    } finally {
        setSaving(false);
    }
  };

  const filteredTables = tables.filter(t => t.name.toLowerCase().includes(searchTable.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-120px)] border border-gray-800 rounded-lg overflow-hidden bg-[#111827]">
        
        {/* SIDEBAR: TABLE LIST */}
        <div className="w-64 border-r border-gray-800 flex flex-col bg-[#0f172a]/50">
            <div className="p-4 border-b border-gray-800">
                <div className="flex items-center gap-2 mb-3 text-yellow-500 font-semibold">
                    <Database className="w-4 h-4" />
                    <span>Tables ({tables.length})</span>
                </div>
                <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-500" />
                    <input 
                        className="w-full bg-[#1f2937] border border-gray-700 rounded pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-yellow-500 transition"
                        placeholder="Search tables..."
                        value={searchTable}
                        onChange={(e) => setSearchTable(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                {loadingTables ? (
                    <div className="p-4 text-center text-gray-500 text-xs animate-pulse">Loading...</div>
                ) : (
                    <div className="flex flex-col">
                        {filteredTables.map(t => (
                            <button
                                key={t.name}
                                onClick={() => setSelectedTable(t.name)}
                                className={`flex items-center justify-between px-4 py-3 text-sm border-b border-gray-800/50 hover:bg-gray-800 transition text-left ${
                                    selectedTable === t.name ? "bg-yellow-500/10 text-yellow-400 border-l-2 border-l-yellow-500" : "text-gray-400 border-l-2 border-l-transparent"
                                }`}
                            >
                                <span className="truncate flex-1 font-mono">{t.name}</span>
                                <span className="text-[10px] bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 tabular-nums">
                                    {t.count}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* MAIN CONTENT: DATA VIEWER */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#111827] relative">
            {selectedTable ? (
                <>
                    {/* HEADER */}
                    <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[#0f172a]/30">
                        <div className="flex items-center gap-3">
                            <TableIcon className="w-5 h-5 text-gray-400" />
                            <h2 className="text-lg font-bold text-white font-mono">{selectedTable}</h2>
                            <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded">
                                {pagination.total} records
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => fetchData(selectedTable, pagination.page)}
                                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 transition"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`} />
                            </button>
                        </div>
                    </div>

                    {/* TABLE AREA */}
                    <div className="flex-1 overflow-auto relative custom-scrollbar">
                        {loadingData ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10">
                                <div className="text-yellow-500 animate-pulse font-mono">Loading Data...</div>
                            </div>
                        ) : data.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                <Database className="w-12 h-12 mb-4 opacity-20" />
                                <p>No data found in table</p>
                            </div>
                        ) : (
                            <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
                                <thead className="bg-[#1f2937] sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-4 py-3 font-mono text-gray-400 font-medium border-b border-gray-700 bg-[#1f2937] w-20 text-center">
                                            Actions
                                        </th>
                                        {columns.map(col => (
                                            <th key={col.name} className="px-4 py-3 font-mono text-gray-400 font-medium border-b border-gray-700 bg-[#1f2937]">
                                                <div className="flex items-center gap-1">
                                                    {col.name}
                                                    {col.isPrimaryKey && <span className="text-yellow-500 text-[10px] bg-yellow-900/20 px-1 rounded">PK</span>}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {data.map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-800/50 transition group">
                                            <td className="px-4 py-2 border-r border-gray-800/50 bg-[#1f2937]/50 text-center sticky left-0 z-10">
                                                <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => openEditModal(row)}
                                                        className="p-1 hover:bg-blue-900/30 text-blue-400 rounded"
                                                        title="Edit"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(row)}
                                                        className="p-1 hover:bg-red-900/30 text-red-400 rounded"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                            {columns.map(col => {
                                                const val = row[col.name];
                                                let displayVal: any = val;
                                                
                                                if (val === null) displayVal = <span className="text-gray-600 italic">null</span>;
                                                else if (typeof val === 'boolean') displayVal = <span className={val ? "text-green-400" : "text-red-400"}>{String(val)}</span>;
                                                else if (typeof val === 'object') displayVal = JSON.stringify(val); // Dates, JSON, etc
                                                
                                                // Identify visible_password specially
                                                const isPwd = col.name === 'visible_password';
                                                
                                                return (
                                                    <td key={col.name} className={`px-4 py-2 border-r border-gray-800/50 last:border-r-0 max-w-[300px] truncate ${isPwd ? "text-red-300 font-mono bg-red-900/10" : "text-gray-300"}`}>
                                                        {displayVal}
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* FOOTER PAGINATION */}
                    <div className="p-3 border-t border-gray-800 bg-[#0f172a]/30 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                            Page {pagination.page} of {pagination.totalPages}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchData(selectedTable, pagination.page - 1)}
                                disabled={pagination.page <= 1 || loadingData}
                                className="p-1 px-3 rounded bg-[#1f2937] text-gray-300 disabled:opacity-50 hover:bg-gray-700 transition"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => fetchData(selectedTable, pagination.page + 1)}
                                disabled={pagination.page >= pagination.totalPages || loadingData}
                                className="p-1 px-3 rounded bg-[#1f2937] text-gray-300 disabled:opacity-50 hover:bg-gray-700 transition"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 bg-[#0f172a]/20">
                    <Database className="w-16 h-16 mb-4 opacity-20" />
                    <h3 className="text-lg font-medium text-gray-400">Select a Table</h3>
                    <p className="text-sm">Choose a table from the sidebar to view its data</p>
                </div>
            )}

            {/* EDIT MODAL */}
            {isEditModalOpen && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#1f2937] border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">Edit Record</h3>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <div className="grid grid-cols-1 gap-4">
                                {columns.map(col => {
                                    const isPK = col.isPrimaryKey;
                                    const val = editFormData[col.name];
                                    
                                    // Safe display value handling
                                    let displayVal = val;
                                    if (val === null) displayVal = "";
                                    else if (typeof val === 'object') displayVal = JSON.stringify(val);

                                    return (
                                        <div key={col.name} className="flex flex-col gap-1">
                                            <label className="text-xs text-gray-400 font-mono flex items-center gap-2">
                                                {col.name}
                                                {isPK && <span className="text-yellow-500 bg-yellow-900/20 px-1 rounded-[2px]">PK</span>}
                                            </label>
                                            {isPK ? (
                                                <input 
                                                    className="bg-gray-900/50 border border-gray-700 rounded px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                                                    value={String(displayVal)}
                                                    readOnly
                                                />
                                            ) : (
                                                <input 
                                                    className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:border-yellow-500 outline-none"
                                                    value={String(displayVal)}
                                                    onChange={(e) => setEditFormData({ ...editFormData, [col.name]: e.target.value })}
                                                />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-700 flex justify-end gap-3 bg-[#0f172a]/30">
                            <button 
                                onClick={() => setIsEditModalOpen(false)}
                                className="px-4 py-2 rounded text-sm text-gray-400 hover:text-white transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUpdate}
                                disabled={saving}
                                className="px-4 py-2 rounded text-sm bg-yellow-500 text-black font-semibold hover:bg-yellow-400 transition flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}
