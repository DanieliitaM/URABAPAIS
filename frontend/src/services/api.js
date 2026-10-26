const API_BASE_URL = '/api';

let currentRole = 'Administrador';
try {
  const saved = localStorage.getItem('uraba_user_role');
  if (saved) currentRole = saved;
} catch (e) {}

export const setApiRole = (role) => {
  currentRole = role;
  try {
    localStorage.setItem('uraba_user_role', role);
  } catch (e) {}
};

export const getApiRole = () => currentRole;

const authFetch = (url, options = {}) => {
  const headers = {
    'x-user-role': currentRole,
    ...(options.headers || {})
  };
  return fetch(url, { ...options, headers });
};

const handleResponse = async (res) => {
  const json = await res.json();
  if (!res.ok) {
    const errorMsg = json.message || (json.errores ? json.errores.map(e => e.mensaje).join(', ') : 'Error en la petición');
    const err = new Error(errorMsg);
    err.data = json;
    err.status = res.status;
    throw err;
  }
  return json;
};

export const api = {
  setRole: setApiRole,
  getRole: getApiRole,

  // Autenticación independiente
  login: (credentials) => authFetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  }).then(handleResponse),

  register: (userData) => authFetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  }).then(handleResponse),

  recoverPassword: (data) => authFetch(`${API_BASE_URL}/auth/recuperar-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),

  getDemoUsers: () => authFetch(`${API_BASE_URL}/auth/usuarios-demo`).then(handleResponse),

  // Catálogos
  getCatalogs: () => authFetch(`${API_BASE_URL}/catalogos`).then(handleResponse),

  // Estado del sistema
  getStatus: () => authFetch(`${API_BASE_URL}/status`).then(handleResponse),

  // Reportes y Dashboard
  getDashboard: () => authFetch(`${API_BASE_URL}/reportes/dashboard`).then(handleResponse),
  getExportData: () => authFetch(`${API_BASE_URL}/reportes/exportar`).then(handleResponse),

  // Beneficiarios
  getBeneficiaries: (params = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.append('search', params.search);
    if (params.municipio) q.append('municipio', params.municipio);
    if (params.tipo_poblacion) q.append('tipo_poblacion', params.tipo_poblacion);
    if (params.page) q.append('page', params.page);
    if (params.limit) q.append('limit', params.limit);
    return authFetch(`${API_BASE_URL}/beneficiarios?${q.toString()}`).then(handleResponse);
  },

  getBeneficiaryById: (id) => authFetch(`${API_BASE_URL}/beneficiarios/${id}`).then(handleResponse),

  getConsolidatedFile: (id) => authFetch(`${API_BASE_URL}/beneficiarios/${id}/ficha-consolidada`).then(handleResponse),

  checkDuplicates: (params) => {
    const q = new URLSearchParams();
    if (params.tipo_documento) q.append('tipo_documento', params.tipo_documento);
    if (params.numero_documento) q.append('numero_documento', params.numero_documento);
    if (params.nombre_completo) q.append('nombre_completo', params.nombre_completo);
    if (params.telefono) q.append('telefono', params.telefono);
    if (params.edad) q.append('edad', params.edad);
    return authFetch(`${API_BASE_URL}/beneficiarios/buscar-duplicados?${q.toString()}`).then(handleResponse);
  },

  createBeneficiary: (data) => authFetch(`${API_BASE_URL}/beneficiarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),

  updateBeneficiary: (id, data) => authFetch(`${API_BASE_URL}/beneficiarios/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),

  getAiSummary: (id) => authFetch(`${API_BASE_URL}/beneficiarios/${id}/resumen-ia`).then(handleResponse),

  // Programas y Vinculaciones
  getPrograms: () => authFetch(`${API_BASE_URL}/programas`).then(handleResponse),

  enrollProgram: (data) => authFetch(`${API_BASE_URL}/participaciones/vincular`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),

  updateParticipationStatus: (id, data) => authFetch(`${API_BASE_URL}/participaciones/${id}/estado`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),

  // Atenciones y Ayudas
  getAttentions: (params = {}) => {
    const q = new URLSearchParams();
    if (params.resultado_asociado) q.append('resultado_asociado', params.resultado_asociado);
    if (params.organizacion) q.append('organizacion', params.organizacion);
    if (params.page) q.append('page', params.page);
    if (params.limit) q.append('limit', params.limit);
    return authFetch(`${API_BASE_URL}/atenciones?${q.toString()}`).then(handleResponse);
  },

  createAttention: (data) => authFetch(`${API_BASE_URL}/atenciones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),

  // Seguimientos
  getFollowups: (params = {}) => {
    const q = new URLSearchParams();
    if (params.estado_caso) q.append('estado_caso', params.estado_caso);
    if (params.limit) q.append('limit', params.limit);
    return authFetch(`${API_BASE_URL}/seguimientos?${q.toString()}`).then(handleResponse);
  },

  createFollowup: (data) => authFetch(`${API_BASE_URL}/seguimientos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),

  updateFollowup: (id, data) => authFetch(`${API_BASE_URL}/seguimientos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),

  // Familiares
  createFamilyMember: (data) => authFetch(`${API_BASE_URL}/familiares`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(handleResponse),

  deleteFamilyMember: (id) => authFetch(`${API_BASE_URL}/familiares/${id}`, {
    method: 'DELETE'
  }).then(handleResponse)
};
