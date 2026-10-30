async function request(path, options) {
  let res;
  try {
    res = await fetch(path, { headers: { 'content-type': 'application/json' }, ...options });
  } catch {
    throw Object.assign(new Error('Cannot reach the server. Check your connection and try again.'), { fields: {} });
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed.'), { fields: data.fields || {}, status: res.status });
  return data;
}

export const getOptions = () => request('/api/options');
export const createPath = (answers) => request('/api/paths', { method: 'POST', body: JSON.stringify(answers) });
export const getPath = (id) => request(`/api/paths/${id}`);
export const saveLead = (id, lead) => request(`/api/paths/${id}/lead`, { method: 'POST', body: JSON.stringify(lead) });
