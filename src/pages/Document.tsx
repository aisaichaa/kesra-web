import React, { useState, useEffect, ChangeEvent, type ReactNode } from 'react';
import { fetchCategories, fetchDocuments, uploadDocumentFile, createDocument, deleteDocument, updateDocument, getDownloadUrlFromSupabase, createCategory, updateCategory, deleteCategory as deleteCategoryApi, fetchDocumentYearsDistinct } from '../services/supabaseUtils';
import { FaEye, FaDownload, FaEdit, FaTrash, FaSpinner } from 'react-icons/fa';
import SidebarCategoryTree from '../components/SidebarCategoryTree';
import TreeDropdown, { TreeNode } from '../components/TreeDropdown';

type Document = {
  id: number;
  title: string;
  category_id: number;
  year: string;
  note: string;
  file: string;
  file_url: string; // Added file_url to the type
};

type Category = { id: number; name: string; parent_id: number | null; children?: Category[] };

function buildCategoryTree(categories: Category[], parentId: number | null = null): Category[] {
  return categories
    .filter(cat => cat.parent_id === parentId)
    .map(cat => ({
      ...cat,
      children: buildCategoryTree(categories, cat.id)
    }));
}

function renderOptions(tree: Category[], level = 0): ReactNode[] {
  return tree.flatMap(cat => [
    <option key={cat.id} value={cat.id}>
      {`${'— '.repeat(level)}${cat.name}`}
    </option>,
    ...(cat.children ? renderOptions(cat.children, level + 1) : [])
  ]);
}

function getAllDescendantIds(categories: Category[], parentId: number): number[] {
  const children = categories.filter(cat => cat.parent_id === parentId);
  return [
    parentId,
    ...children.flatMap(child => getAllDescendantIds(categories, child.id))
  ];
}

function getCategoryPath(id: number, categories: Category[]): string {
  const path: string[] = [];
  let current = categories.find(c => c.id === id);
  while (current) {
    path.unshift(current.name);
    if (typeof current.parent_id !== 'undefined' && current.parent_id !== null) {
      current = categories.find(c => c.id === current!.parent_id);
    } else {
      current = undefined;
    }
  }
  return path.join(' / ');
}

export default function DocumentArchives() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterYear, setFilterYear] = useState('');
  const [filterCategory, setFilterCategory] = useState<number | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 10;
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [year, setYear] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [loadingDownload, setLoadingDownload] = useState<number | null>(null); // id dokumen yang sedang didownload
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState<'add' | 'edit'>('add');
  const [categoryModalEdit, setCategoryModalEdit] = useState<Category | null>(null);
  const [categoryNameInput, setCategoryNameInput] = useState('');
  const [categoryParentInput, setCategoryParentInput] = useState<number | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [years, setYears] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchDocumentYearsDistinct().then(setYears);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let categoryIds: number[] | undefined = undefined;
      if (filterCategory) categoryIds = getAllDescendantIds(categories, filterCategory);
      const { data, count } = await fetchDocuments({
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        categoryIds,
        year: filterYear
      });
      setDocuments(data || []);
      setTotalCount(count || 0);
      setLoading(false);
    };
    fetch();
  }, [filterCategory, filterYear, page, categories]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 2. Filter dokumen berdasarkan category_id
  const filteredDocs = documents.filter((doc) => {
    const matchYear = !filterYear || doc.year === filterYear;
    let matchCategory = true;
    if (filterCategory) {
      const allowedIds = getAllDescendantIds(categories, filterCategory);
      matchCategory = allowedIds.includes(doc.category_id);
    }
    return matchYear && matchCategory;
  });

  // 3. Helper untuk lookup nama kategori
  function getCategoryName(id: number) {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : '-';
  }

  // Handler download file
  const handleDownload = async (doc: Document) => {
    setLoadingDownload(doc.id);
    try {
      const url = await getDownloadUrlFromSupabase(doc.file_url);
      window.open(url, '_blank');
    } catch (err) {
      alert('Gagal generate link download');
    } finally {
      setLoadingDownload(null);
    }
  };

  // Loading state
  // Hapus blok if (loading) { return ... }

  // Handler hapus dokumen
  async function handleDelete(id: number) {
    if (!window.confirm('Yakin ingin menghapus dokumen ini?')) return;
    setSaving(true);
    try {
      await deleteDocument(id);
      // refetch data
      let categoryIds: number[] | undefined = undefined;
      if (filterCategory) categoryIds = getAllDescendantIds(categories, filterCategory);
      const { data, count } = await fetchDocuments({
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        categoryIds,
        year: filterYear
      });
      setDocuments(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      alert('Gagal menghapus dokumen');
    } finally {
      setSaving(false);
    }
  }

  // Handler buka modal edit
  function handleEdit(doc: Document) {
    setEditId(doc.id);
    setTitle(doc.title);
    setCategoryId(doc.category_id);
    setYear(doc.year);
    setNote(doc.note);
    setSelectedFile(null);
    setShowModal(true);
  }

  // Handler sidebar
  function handleSidebarSelect(id: number | null) {
    setFilterCategory(id ?? '');
    setPage(1);
  }
  function handleSidebarAdd(parentId: number | null) {
    setCategoryModalMode('add');
    setCategoryParentInput(parentId);
    setCategoryNameInput('');
    setShowCategoryModal(true);
  }
  function handleSidebarEdit(cat: Category) {
    setCategoryModalMode('edit');
    setCategoryModalEdit(cat);
    setCategoryNameInput(cat.name);
    setCategoryParentInput(cat.parent_id);
    setShowCategoryModal(true);
  }
  async function handleSidebarDelete(cat: Category) {
    if (!window.confirm('Yakin hapus kategori ini?')) return;
    setSavingCategory(true);
    try {
      await deleteCategoryApi(cat.id);
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (err) {
      alert('Gagal hapus kategori');
    } finally {
      setSavingCategory(false);
    }
  }
  async function handleCategoryModalSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSavingCategory(true);
    try {
      if (categoryModalMode === 'add') {
        await createCategory({ name: categoryNameInput, parent_id: categoryParentInput });
      } else if (categoryModalEdit) {
        await updateCategory(categoryModalEdit.id, { name: categoryNameInput, parent_id: categoryParentInput });
      }
      setShowCategoryModal(false);
      setCategoryNameInput('');
      setCategoryParentInput(null);
      setCategoryModalEdit(null);
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (err) {
      alert('Gagal simpan kategori');
    } finally {
      setSavingCategory(false);
    }
  }

  // Layout: flex row, sidebar kiri, konten kanan
  return (
    <div style={{ display: 'flex', background: '#f8f9fa', fontFamily: 'Arial, sans-serif', minHeight: '100vh' }}>
      <div style={{ padding: '32px 0 32px 32px', paddingTop: 80 }}>
        <div style={{ marginBottom: 16 }}>
          <select
            onChange={e => setFilterYear(e.target.value)}
            value={filterYear}
            style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }}
          >
            <option value="">Pilih Tahun</option>
            {years.map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>
        <SidebarCategoryTree
          categories={buildCategoryTree(categories)}
          selectedId={filterCategory}
          onSelect={handleSidebarSelect}
          onAdd={handleSidebarAdd}
          onEdit={handleSidebarEdit}
          onDelete={handleSidebarDelete}
        />
      </div>
      <div style={{ flex: 1, maxWidth: 800, margin: '2rem auto', padding: 16, paddingTop: 80 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontWeight: 700, fontSize: 28, margin: 0 }}>Arsip Dokumen</h2>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 18px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #0001'
            }}
          >
            + Tambah Dokumen
          </button>
        </div>
        {/* Table */}
        <div style={{
          overflowX: 'auto',
          borderRadius: 12,
          boxShadow: '0 2px 16px #0002',
          background: '#fff',
        }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ background: '#f1f5f9' }}>
                <th style={{ padding: 14, textAlign: 'left', fontWeight: 600, fontSize: 15, borderTopLeftRadius: 12 }}>#</th>
                <th style={{ padding: 14, textAlign: 'left', fontWeight: 600, fontSize: 15 }}>Judul</th>
                <th style={{ padding: 14, textAlign: 'left', fontWeight: 600, fontSize: 15 }}>Kategori</th>
                <th style={{ padding: 14, textAlign: 'left', fontWeight: 600, fontSize: 15 }}>Tahun</th>
                <th style={{ padding: 14, textAlign: 'left', fontWeight: 600, fontSize: 15 }}>Keterangan</th>
                <th style={{ padding: 14, textAlign: 'left', fontWeight: 600, fontSize: 15 }}>File</th>
                <th style={{ padding: 14, textAlign: 'center', fontWeight: 600, fontSize: 15, borderTopRightRadius: 12 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                    Loading dokumen...
                  </td>
                </tr>
              ) : filteredDocs.length > 0 ? (
                filteredDocs.map((doc, index) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background 0.2s' }}>
                    <td style={{ padding: 14, fontSize: 15 }}>{index + 1}</td>
                    <td style={{ padding: 14, fontSize: 15 }}>{doc.title}</td>
                    <td style={{ padding: 14, fontSize: 15 }}>
                      {getCategoryPath(doc.category_id, categories)}
                    </td>
                    <td style={{ padding: 14, fontSize: 15 }}>{doc.year}</td>
                    <td style={{ padding: 14, fontSize: 15 }}>{doc.note}</td>
                    <td style={{ padding: 14, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                        {doc.file_url ? (
                          <>
                            <a
                              href={doc.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Lihat"
                              style={{ fontSize: 18, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                            ><FaEye /></a>
                            <button
                              onClick={() => handleDownload(doc)}
                              title="Download"
                              style={{ fontSize: 18, color: '#059669', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                              disabled={loadingDownload === doc.id}
                            >
                              {loadingDownload === doc.id ? (
                                <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                              ) : (
                                <FaDownload />
                              )}
                            </button>
                          </>
                        ) : (
                          <span style={{ color: '#888', fontSize: 14 }}>-</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: 14, textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                        <button
                          onClick={() => handleEdit(doc)}
                          title="Edit"
                          style={{ fontSize: 18, color: '#fbbf24', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                        ><FaEdit /></button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          title="Hapus"
                          style={{ fontSize: 18, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                        ><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#888' }}>Tidak ada dokumen ditemukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination di bawah tabel */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 24 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              background: '#e5e7eb',
              color: '#222',
              border: 'none',
              borderRadius: 4,
              padding: '6px 16px',
              fontWeight: 500,
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.6 : 1
            }}
          >
            Sebelumnya
          </button>
          <span style={{ fontSize: 15 }}>
            Halaman {page} dari {Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(totalCount / PAGE_SIZE)}
            style={{
              background: '#e5e7eb',
              color: '#222',
              border: 'none',
              borderRadius: 4,
              padding: '6px 16px',
              fontWeight: 500,
              cursor: page >= Math.ceil(totalCount / PAGE_SIZE) ? 'not-allowed' : 'pointer',
              opacity: page >= Math.ceil(totalCount / PAGE_SIZE) ? 0.6 : 1
            }}
          >
            Selanjutnya
          </button>
        </div>
        {/* Modal */}
        {showModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 999,
          }}>
            <div style={{
              background: '#fff',
              borderRadius: 12,
              padding: 28,
              width: 420,
              maxWidth: '90%',
              boxShadow: '0 5px 24px #0003',
            }}>
              <h3 style={{ marginBottom: 18, fontWeight: 700, fontSize: 22 }}>
                {editId ? 'Edit Dokumen' : 'Tambah Dokumen'}
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSaving(true);
                  let fileUrl = '';
                  try {
                    if (selectedFile) {
                      fileUrl = await uploadDocumentFile(selectedFile);
                    }
                    if (editId) {
                      await updateDocument(editId, {
                        title,
                        category_id: categoryId,
                        year,
                        note,
                        ...(fileUrl ? { file_url: fileUrl } : {})
                      });
                    } else {
                      await createDocument({
                        title,
                        category_id: categoryId,
                        year,
                        note,
                        file_url: fileUrl
                      });
                    }
                    setShowModal(false);
                    setTitle(''); setCategoryId(''); setYear(''); setNote(''); setSelectedFile(null); setEditId(null);
                    setPage(1); // reset ke halaman 1
                    // refetch data
                    let categoryIds: number[] | undefined = undefined;
                    if (filterCategory) categoryIds = getAllDescendantIds(categories, filterCategory);
                    const { data, count } = await fetchDocuments({
                      limit: PAGE_SIZE,
                      offset: 0,
                      categoryIds,
                      year: filterYear
                    });
                    setDocuments(data || []);
                    setTotalCount(count || 0);
                    const newYears = await fetchDocumentYearsDistinct();
                    setYears(newYears);
                  } catch (err) {
                    alert(editId ? 'Gagal mengupdate dokumen' : 'Gagal menyimpan dokumen');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                <input
                  type="text"
                  placeholder="Judul Dokumen"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                  style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
                />
                <TreeDropdown
                  treeData={buildCategoryTree(categories).map(cat => ({
                    id: cat.id,
                    label: cat.name,
                    children: cat.children?.map(child => ({
                      id: child.id,
                      label: child.name,
                      children: child.children?.map(grand => ({
                        id: grand.id,
                        label: grand.name,
                        children: grand.children // dst, recursive
                      }))
                    }))
                  })) as TreeNode[]}
                  value={categoryId || undefined}
                  onChange={(id) => setCategoryId(id as number)}
                  placeholder="Pilih Kategori"
                  className="mb-2"
                />
                <input
                  type="number"
                  placeholder="Tahun"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  required
                  style={{ width: '100%', margin: '10px 0', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
                />
                <textarea
                  placeholder="Keterangan"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 6, border: '1px solid #ccc', minHeight: 60 }}
                />
                <input
                  type="file"
                  onChange={handleFileChange}
                  style={{ marginBottom: 18 }}
                  required={editId === null}
                />
                {selectedFile && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                    <span style={{ fontSize: 15 }}>{selectedFile.name}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setTitle(''); setCategoryId(''); setYear(''); setNote(''); setSelectedFile(null); setEditId(null); }}
                    style={{ background: '#e5e7eb', color: '#222', border: 'none', padding: '8px 18px', borderRadius: 6, fontWeight: 500 }}
                    disabled={saving}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 6, fontWeight: 600, boxShadow: '0 2px 8px #0001' }}
                    disabled={saving}
                  >
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      {/* Modal kategori */}
      {showCategoryModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 28, width: 400, maxWidth: '90%', boxShadow: '0 5px 24px #0003' }}>
            <h3 style={{ marginBottom: 18, fontWeight: 700, fontSize: 20 }}>{categoryModalMode === 'add' ? 'Tambah Kategori' : 'Edit Kategori'}</h3>
            <form onSubmit={handleCategoryModalSubmit}>
              <input
                type="text"
                placeholder="Nama kategori"
                value={categoryNameInput}
                onChange={e => setCategoryNameInput(e.target.value)}
                required
                style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
              />
              <select
                value={categoryParentInput ?? ''}
                onChange={e => setCategoryParentInput(e.target.value ? Number(e.target.value) : null)}
                style={{ width: '100%', marginBottom: 16, padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
              >
                <option value="">Tanpa parent (root)</option>
                {categories.filter(c => !categoryModalEdit || c.id !== categoryModalEdit.id).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setShowCategoryModal(false)} style={{ background: '#e5e7eb', color: '#222', border: 'none', padding: '8px 18px', borderRadius: 6, fontWeight: 500 }} disabled={savingCategory}>Batal</button>
                <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 6, fontWeight: 600, boxShadow: '0 2px 8px #0001' }} disabled={savingCategory}>{savingCategory ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

