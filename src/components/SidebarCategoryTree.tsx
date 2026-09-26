import React, { useState } from 'react';
import { FaChevronDown, FaChevronRight, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';

type Category = { id: number; name: string; parent_id: number | null; children?: Category[] };

type SidebarCategoryTreeProps = {
  categories: Category[];
  selectedId: number | '';
  onSelect: (id: number | null) => void;
  onAdd: (parentId: number | null) => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
};

function renderTree(
  nodes: Category[],
  expanded: Set<number>,
  setExpanded: React.Dispatch<React.SetStateAction<Set<number>>>,
  selectedId: number | '',
  onSelect: (id: number | null) => void,
  onAdd: (parentId: number | null) => void,
  onEdit: (cat: Category) => void,
  onDelete: (cat: Category) => void,
  level: number
) {
  return nodes.map(node => (
    <div key={node.id} style={{ marginLeft: 12, marginBottom: 4 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {(node.children && node.children.length > 0) ? (
          <button
            onClick={() => setExpanded(exp => {
              const newSet = new Set(exp);
              if (newSet.has(node.id)) newSet.delete(node.id);
              else newSet.add(node.id);
              return newSet;
            })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title={expanded.has(node.id) ? 'Collapse' : 'Expand'}
          >
            {expanded.has(node.id) ? <FaChevronDown /> : <FaChevronRight />}
          </button>
        ) : <span style={{ width: 12, display: 'inline-block' }} />} 
        <span
          onClick={() => onSelect(node.id)}
          style={{
            fontWeight: selectedId === node.id ? 700 : 400,
            color: selectedId === node.id ? '#2563eb' : '#222',
            cursor: 'pointer',
            padding: '2px 4px',
            borderRadius: 4,
            background: selectedId === node.id ? '#e0e7ff' : 'none',
            userSelect: 'none'
          }}
        >
          {node.name}
        </span>
        <button onClick={() => onAdd(node.id)} title="Tambah Subkategori" style={{ background: 'none', border: 'none', color: '#059669', cursor: 'pointer', padding: 0 }}><FaPlus /></button>
        <button onClick={() => onEdit(node)} title="Edit" style={{ background: 'none', border: 'none', color: '#fbbf24', cursor: 'pointer', padding: 0 }}><FaEdit /></button>
        <button onClick={() => onDelete(node)} title="Hapus" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}><FaTrash /></button>
      </div>
      {node.children && node.children.length > 0 && expanded.has(node.id) && (
        <div>{renderTree(node.children, expanded, setExpanded, selectedId, onSelect, onAdd, onEdit, onDelete, level + 1)}</div>
      )}
    </div>
  ));
}

export default function SidebarCategoryTree({ categories, selectedId, onSelect, onAdd, onEdit, onDelete }: SidebarCategoryTreeProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  return (
    <div style={{ width: 260, background: '#f1f5f9', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px #0001', minHeight: 400 }}>
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Kategori
        <button onClick={() => onAdd(null)} title="Tambah Kategori" style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', padding: 0 }}><FaPlus /></button>
      </div>
      <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
        {/* all categories option */}
        <div style={{ marginBottom: 4, display: 'flex', gap: 4 }}>
        <span
          onClick={() => onSelect(null)}
          style={{
            fontWeight: selectedId === '' ? 700 : 400,
            color: selectedId === '' ? '#2563eb' : '#222',
            cursor: 'pointer',
            borderRadius: 4,
            background: selectedId === '' ? '#e0e7ff' : 'none',
            userSelect: 'none'
          }}
        >
          Semua Kategori
        </span>
        </div>
        {renderTree(categories, expanded, setExpanded, selectedId, onSelect, onAdd, onEdit, onDelete, 0)}
      </div>
    </div>
  );
} 