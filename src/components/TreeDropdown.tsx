import React, { useState, useRef, useEffect } from 'react';

export interface TreeNode {
  id: string | number;
  label: string;
  children?: TreeNode[];
}

interface TreeDropdownProps {
  treeData: TreeNode[];
  value?: string | number;
  onChange: (id: string | number, node: TreeNode) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function filterTree(
  nodes: TreeNode[],
  search: string
): { filtered: TreeNode[]; expandedIds: Set<string | number> } {
  const expandedIds = new Set<string | number>();
  function filter(nodes: TreeNode[]): TreeNode[] {
    return nodes
      .map((node) => {
        if (node.children) {
          const filteredChildren = filter(node.children);
          if (
            node.label.toLowerCase().includes(search) ||
            filteredChildren.length > 0
          ) {
            if (filteredChildren.length > 0) expandedIds.add(node.id);
            return { ...node, children: filteredChildren };
          }
        } else if (node.label.toLowerCase().includes(search)) {
          return node;
        }
        return null;
      })
      .filter(Boolean) as TreeNode[];
  }
  return { filtered: filter(nodes), expandedIds };
}

// Fungsi untuk mencari path breadcrumb dari root ke node terpilih
function getBreadcrumbPath(nodes: TreeNode[], value?: string | number): string[] {
  let path: string[] = [];
  function traverse(nodes: TreeNode[], target: string | number): boolean {
    for (const node of nodes) {
      if (node.id === target) {
        path.unshift(node.label);
        return true;
      }
      if (node.children && traverse(node.children, target)) {
        path.unshift(node.label);
        return true;
      }
    }
    return false;
  }
  if (typeof value !== 'undefined') traverse(nodes, value);
  return path;
}

const TreeDropdown: React.FC<TreeDropdownProps> = ({
  treeData,
  value,
  onChange,
  placeholder = 'Pilih kategori',
  disabled,
  className = '',
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string | number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtered tree & auto-expand on search
  const searchLower = search.trim().toLowerCase();
  const { filtered, expandedIds } = searchLower
    ? filterTree(treeData, searchLower)
    : { filtered: treeData, expandedIds: new Set() };

  useEffect(() => {
    if (searchLower) setExpanded(new Set<string | number>(Array.from(expandedIds) as (string | number)[]));
  }, [searchLower]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function handleExpand(id: string | number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function renderTree(nodes: TreeNode[], level = 0) {
    return (
      <ul className="tree-list" style={{ paddingLeft: level ? 16 : 0 }}>
        {nodes.map((node) => {
          const isExpanded = expanded.has(node.id);
          const hasChildren = node.children && node.children.length > 0;
          const isSelected = value === node.id;
          return (
            <li key={node.id} className="tree-node">
              <div
                className={`tree-node-label${isSelected ? ' selected' : ''}`}
                style={{ paddingLeft: hasChildren ? 0 : 20 }}
                onClick={() => {
                  onChange(node.id, node);
                  setOpen(false);
                }}
              >
                {hasChildren && (
                  <span
                    className="tree-node-arrow"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleExpand(node.id);
                    }}
                  >
                    {isExpanded ? '▼' : '▶'}
                  </span>
                )}
                <span className="tree-node-text">
                  {node.label}
                </span>
                <span className="tree-node-radio">
                  <input
                    type="radio"
                    checked={isSelected}
                    readOnly
                    tabIndex={-1}
                  />
                </span>
              </div>
              {hasChildren && isExpanded &&
                renderTree(node.children!, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  }

  // Find selected label
  function findLabel(nodes: TreeNode[]): string | undefined {
    for (const node of nodes) {
      if (node.id === value) return node.label;
      if (node.children) {
        const found = findLabel(node.children);
        if (found) return found;
      }
    }
    return undefined;
  }

  return (
    <div
      className={`tree-dropdown-container ${className}`}
      ref={containerRef}
      tabIndex={0}
    >
      <div
        className={`tree-dropdown-selector${open ? ' open' : ''}${disabled ? ' disabled' : ''}`}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        <span className="tree-dropdown-value">
          {(() => {
            const breadcrumb = getBreadcrumbPath(treeData, value);
            if (breadcrumb.length > 0) {
              return breadcrumb.join(' / ');
            }
            return <span className="tree-dropdown-placeholder">{placeholder}</span>;
          })()}
        </span>
        <span className="tree-dropdown-arrow">▼</span>
      </div>
      {open && !disabled && (
        <div className="tree-dropdown-menu">
          <input
            className="tree-dropdown-search"
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className="tree-dropdown-tree">
            {filtered.length > 0 ? (
              renderTree(filtered)
            ) : (
              <div className="tree-dropdown-empty">Tidak ada hasil</div>
            )}
          </div>
        </div>
      )}
      <style>{`
        .tree-dropdown-container { position: relative; width: 100%; }
        .tree-dropdown-selector { display: flex; align-items: center; border: 1px solid #d9d9d9; border-radius: 4px; min-height: 38px; padding: 4px 11px; background: #fff; cursor: pointer; transition: border-color 0.2s; }
        .tree-dropdown-selector.open { border-color: #4094f7; box-shadow: 0 0 0 2px rgba(24,144,255,0.2); }
        .tree-dropdown-selector.disabled { background: #f5f5f5; color: #bfbfbf; cursor: not-allowed; }
        .tree-dropdown-value { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tree-dropdown-placeholder { color: #bfbfbf; }
        .tree-dropdown-arrow { margin-left: 8px; color: #bfbfbf; font-size: 1rem; }
        .tree-dropdown-menu { position: absolute; z-index: 1000; background: #fff; border: 1px solid #d9d9d9; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); margin-top: 4px; width: 100%; min-width: 180px; max-height: 320px; overflow: auto; padding: 8px 0; }
        .tree-dropdown-search { width: 95%; margin: 0 2.5%; margin-bottom: 8px; border: 1px solid #e5e5e5; border-radius: 4px; padding: 4px 8px; font-size: 1rem; }
        .tree-dropdown-tree { max-height: 240px; overflow: auto; }
        .tree-list { list-style: none; margin: 0; padding: 0; }
        .tree-node { margin: 0; }
        .tree-node-label { display: flex; align-items: center; padding: 4px 8px; border-radius: 4px; cursor: pointer; transition: background 0.15s; }
        .tree-node-label.selected { background: #e6f7ff; color: #1890ff; }
        .tree-node-label:hover { background: #f5f5f5; }
        .tree-node-arrow { margin-right: 6px; font-size: 0.9em; cursor: pointer; user-select: none; }
        .tree-node-text { flex: 1; }
        .tree-node-radio { margin-left: 8px; }
        .tree-dropdown-empty { color: #bfbfbf; text-align: center; padding: 16px 0; }
      `}</style>
    </div>
  );
};

export default TreeDropdown; 