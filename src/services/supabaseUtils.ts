import supabase from './supabase';

// Generic CRUD operations
export const createData = async (table: string, data: any) => {
  const { data: result, error } = await supabase.from(table).insert([data]);
  if (error) throw error;
  return result;
};

export const readData = async (table: string, filters: any = {}) => {
  let query = supabase.from(table).select('*');
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const updateData = async (table: string, id: any, data: any, idField: string = 'id') => {
  const { data: result, error } = await supabase.from(table).update(data).eq(idField, id);
  if (error) throw error;
  return result;
};

export const deleteData = async (table: string, id: any, idField: string = 'id') => {
  const { data: result, error } = await supabase.from(table).delete().eq(idField, id);
  if (error) throw error;
  return result;
};

// Storage management
export const uploadFile = async (bucket: string, path: string, file: File) => {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file);
  if (error) throw error;
  return data;
};

export const downloadFile = async (bucket: string, path: string) => {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) throw error;
  return data;
};

export const deleteFile = async (bucket: string, path: string) => {
  const { data, error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
  return data;
};

export const readDataPaginated = async (
  table: string,
  {
    limit = 10,
    offset = 0,
    orderBy = 'created_at',
    orderDir = 'desc',
    filters = {}
  }: {
    limit?: number;
    offset?: number;
    orderBy?: string;
    orderDir?: 'asc' | 'desc';
    filters?: Record<string, any>;
  } = {}
) => {
  let query = supabase.from(table).select('*', { count: 'exact' });
  Object.entries(filters).forEach(([key, value]) => {
    query = query.eq(key, value);
  });
  query = query.order(orderBy, { ascending: orderDir === 'asc' });
  query = query.range(offset, offset + limit - 1);
  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
};

export const fetchCategories = async () => {
  const { data, error } = await supabase.from('categories').select('*');
  if (error) throw error;
  return data;
};

// CREATE
export const createDocument = async (data: any) => {
  const { data: result, error } = await supabase.from('documents').insert([data]).select().single();
  if (error) throw error;
  return result;
};

// READ (paginated, filter)
export const fetchDocuments = async ({
  limit = 10,
  offset = 0,
  categoryIds,
  year,
  orderBy = 'created_at',
  orderDir = 'desc'
}: {
  limit?: number;
  offset?: number;
  categoryIds?: number[];
  year?: string;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}) => {
  let query = supabase.from('documents').select('*', { count: 'exact' });
  if (categoryIds && categoryIds.length > 0) query = query.in('category_id', categoryIds);
  if (year) query = query.eq('year', year);
  query = query.order(orderBy, { ascending: orderDir === 'asc' });
  query = query.range(offset, offset + limit - 1);
  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
};

// UPDATE
export const updateDocument = async (id: number, data: any) => {
  const { data: result, error } = await supabase.from('documents').update(data).eq('id', id).select().single();
  if (error) throw error;
  return result;
};

// DELETE
export const deleteDocument = async (id: number) => {
  const { data, error } = await supabase.from('documents').delete().eq('id', id);
  if (error) throw error;
  return data;
};

// UPLOAD FILE
export const uploadDocumentFile = async (file: File) => {
  const filePath = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage.from('documents').upload(filePath, file);
  if (error) throw error;
  // Get public URL (or signed URL if bucket is private)
  const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(filePath);
  return publicUrlData.publicUrl;
};

export const getDownloadUrlFromSupabase = async (fileUrl: string) => {
  // fileUrl bisa berupa public URL atau path relative storage
  // Ekstrak path relative dari public URL jika perlu
  let path = fileUrl;
  // Jika fileUrl adalah public URL, ambil path setelah /object/public/<bucket>/
  const match = fileUrl.match(/\/object\/public\/([^/]+)\/(.+)$/);
  let bucket = 'documents';
  if (match) {
    bucket = match[1];
    path = match[2];
  }
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60, { download: true });
  if (error) throw error;
  return data.signedUrl;
};

export const createCategory = async (data: { name: string; parent_id: number | null }) => {
  const { data: result, error } = await supabase.from('categories').insert([data]).select().single();
  if (error) throw error;
  return result;
};

export const updateCategory = async (id: number, data: { name: string; parent_id: number | null }) => {
  const { data: result, error } = await supabase.from('categories').update(data).eq('id', id).select().single();
  if (error) throw error;
  return result;
};

export const deleteCategory = async (id: number) => {
  const { data, error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
  return data;
};

export const fetchDocumentYearsDistinct = async () => {
  const { data, error } = await supabase.from('documents').select('year').order('year', { ascending: false });
  if (error) throw error;
  // Ambil hanya nilai unik
  const years = Array.from(new Set((data || []).map((d: any) => d.year))).filter(Boolean);
  return years;
}; 