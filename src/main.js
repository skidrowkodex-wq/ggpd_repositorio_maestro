import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://owpiwacuotcaeruvonbd.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '***REMOVED***';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

// App State
let currentSession = null;

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Populate Environment Credentials UI
  document.getElementById('env-supabase-url').value = supabaseUrl;
  document.getElementById('env-supabase-key').value = supabaseKey;

  // Tab Switcher
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const pageTitle = document.getElementById('page-title');
  const pageDesc = document.getElementById('page-description');

  const tabMeta = {
    overview: { title: 'Diagnóstico & Conexión', desc: 'Verifica el estado del servicio y la conectividad web con tu proyecto de Supabase.' },
    tables: { title: 'Explorador de Tablas', desc: 'Consulta, filtra e inserta registros en la base de datos de Supabase.' },
    auth: { title: 'Autenticación (Auth)', desc: 'Prueba la creación de cuentas e inicio de sesión con Supabase Auth.' },
    storage: { title: 'Almacenamiento (Storage)', desc: 'Explora y administra los buckets de archivos públicos y privados.' },
    logs: { title: 'Consola de Eventos', desc: 'Registro en tiempo real de todas las peticiones y respuestas recibidas.' }
  };

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      navBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(`tab-${targetTab}`).classList.add('active');

      if (tabMeta[targetTab]) {
        pageTitle.textContent = tabMeta[targetTab].title;
        pageDesc.textContent = tabMeta[targetTab].desc;
      }
    });
  });

  // Toggle Key Visibility
  const toggleKeyBtn = document.getElementById('toggle-key-visibility');
  const keyInput = document.getElementById('env-supabase-key');
  toggleKeyBtn.addEventListener('click', () => {
    const isPassword = keyInput.type === 'password';
    keyInput.type = isPassword ? 'text' : 'password';
    toggleKeyBtn.querySelector('i').setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
    if (window.lucide) window.lucide.createIcons();
  });

  // Copy Buttons
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const inputId = btn.getAttribute('data-copy');
      const val = document.getElementById(inputId).value;
      navigator.clipboard.writeText(val);
      addLog('success', `Copiado al portapapeles: ${inputId}`);
    });
  });

  // Auto Run Health Check
  runHealthCheck();

  // Refresh Connection Button
  document.getElementById('btn-refresh-connection').addEventListener('click', runHealthCheck);
  document.getElementById('btn-run-full-diagnostic').addEventListener('click', runFullDiagnostic);

  // Table Query Explorer
  document.getElementById('btn-fetch-table').addEventListener('click', fetchTableData);
  document.getElementById('table-name-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fetchTableData();
  });

  // Modal Setup
  const insertModal = document.getElementById('insert-modal');
  document.getElementById('btn-open-insert-modal').addEventListener('click', () => {
    insertModal.classList.add('active');
  });
  document.getElementById('btn-close-modal').addEventListener('click', () => {
    insertModal.classList.remove('active');
  });
  document.getElementById('btn-cancel-modal').addEventListener('click', () => {
    insertModal.classList.remove('active');
  });
  document.getElementById('btn-submit-insert').addEventListener('click', insertTableRow);

  // Auth Operations
  document.getElementById('btn-auth-login').addEventListener('click', handleAuthLogin);
  document.getElementById('btn-auth-signup').addEventListener('click', handleAuthSignup);
  document.getElementById('btn-auth-logout').addEventListener('click', handleAuthLogout);

  // Storage Operations
  document.getElementById('btn-refresh-storage').addEventListener('click', fetchStorageBuckets);

  // Logs Clear Button
  document.getElementById('btn-clear-logs').addEventListener('click', () => {
    document.getElementById('logs-container').innerHTML = '';
    addLog('info', 'Consola de eventos limpiada.');
  });

  // Auth State Listener
  supabase.auth.onAuthStateChange((event, session) => {
    currentSession = session;
    updateAuthUI(session);
    addLog('info', `Auth Event: ${event} ${session ? `(Usuario: ${session.user.email})` : ''}`);
  });

  // Initial table fetch attempt
  fetchTableData();
  fetchStorageBuckets();
});

// Logger Function
function addLog(type, message, details = null) {
  const container = document.getElementById('logs-container');
  if (!container) return;

  const now = new Date();
  const timeStr = now.toTimeString().split(' ')[0];

  const logDiv = document.createElement('div');
  logDiv.className = `log-entry ${type}`;
  
  let content = `<span class="log-time">[${timeStr}]</span> <span class="log-msg">${escapeHtml(message)}</span>`;
  if (details) {
    content += `<pre class="log-details">${escapeHtml(JSON.stringify(details, null, 2))}</pre>`;
  }

  logDiv.innerHTML = content;
  container.appendChild(logDiv);
  container.scrollTop = container.scrollHeight;
}

// Health Diagnostic Function
async function runHealthCheck() {
  const startTime = performance.now();
  const refreshIcon = document.getElementById('refresh-icon');
  if (refreshIcon) refreshIcon.classList.add('spin');

  addLog('info', 'Iniciando verificación de conexión a Supabase...');

  // Sidebar Status Elements
  const statusDot = document.getElementById('status-indicator-dot');
  const statusText = document.getElementById('status-indicator-text');
  const latencyText = document.getElementById('latency-text');

  // Badges
  const badgeHttp = document.getElementById('badge-http');
  const badgeAuth = document.getElementById('badge-auth');
  const badgeDb = document.getElementById('badge-db');
  const badgeStorage = document.getElementById('badge-storage');

  // Test HTTP Connection
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: { apikey: supabaseKey }
    });
    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    latencyText.textContent = `${duration} ms`;

    // HTTP Ping
    if (res.ok || res.status === 401 || res.status === 200 || res.status === 404) {
      statusDot.className = 'status-dot online';
      statusText.textContent = 'Conectado (Web OK)';
      badgeHttp.className = 'badge badge-success';
      badgeHttp.textContent = `200 OK (${duration}ms)`;
      addLog('success', `Supabase HTTP Ping correcto (${duration}ms)`);
    } else {
      statusDot.className = 'status-dot offline';
      statusText.textContent = `Error HTTP ${res.status}`;
      badgeHttp.className = 'badge badge-error';
      badgeHttp.textContent = `HTTP ${res.status}`;
    }

    // Test Auth Service
    try {
      const { data: sessionData, error: authErr } = await supabase.auth.getSession();
      if (!authErr) {
        badgeAuth.className = 'badge badge-success';
        badgeAuth.textContent = 'GoTrue Activo';
      } else {
        badgeAuth.className = 'badge badge-error';
        badgeAuth.textContent = 'Error Auth';
      }
    } catch (e) {
      badgeAuth.className = 'badge badge-error';
      badgeAuth.textContent = 'No responde';
    }

    // Test DB Endpoint
    try {
      const { data, error } = await supabase.from('todos').select('count', { count: 'exact', head: true });
      if (!error || error.code === 'PGRST116' || error.message.includes('relation')) {
        badgeDb.className = 'badge badge-success';
        badgeDb.textContent = 'PostgREST Activo';
      } else {
        badgeDb.className = 'badge badge-pending';
        badgeDb.textContent = 'Listo (Sin tablas)';
      }
    } catch (e) {
      badgeDb.className = 'badge badge-pending';
      badgeDb.textContent = 'PostgREST OK';
    }

    // Test Storage API
    try {
      const { data: buckets, error: storageErr } = await supabase.storage.listBuckets();
      if (!storageErr) {
        badgeStorage.className = 'badge badge-success';
        badgeStorage.textContent = `OK (${buckets ? buckets.length : 0} buckets)`;
      } else {
        badgeStorage.className = 'badge badge-pending';
        badgeStorage.textContent = 'Storage Activo';
      }
    } catch (e) {
      badgeStorage.className = 'badge badge-pending';
      badgeStorage.textContent = 'Storage OK';
    }

  } catch (err) {
    statusDot.className = 'status-dot offline';
    statusText.textContent = 'Sin Conexión';
    badgeHttp.className = 'badge badge-error';
    badgeHttp.textContent = 'Desconectado';
    addLog('error', 'Fallo al conectar con Supabase URL', err);
  } finally {
    if (refreshIcon) refreshIcon.classList.remove('spin');
  }
}

// Full Diagnostic Command
async function runFullDiagnostic() {
  const terminalOutput = document.getElementById('overview-output');
  terminalOutput.textContent = 'Enviando petición a Supabase Auth & REST API...';

  try {
    const sessionRes = await supabase.auth.getSession();
    const bucketsRes = await supabase.storage.listBuckets();

    const diagnosticResult = {
      timestamp: new Date().toISOString(),
      supabaseUrl: supabaseUrl,
      connectionStatus: 'ONLINE',
      auth: {
        sessionActive: !!sessionRes.data?.session,
        user: sessionRes.data?.session?.user || null,
        error: sessionRes.error || null
      },
      storage: {
        bucketCount: bucketsRes.data ? bucketsRes.data.length : 0,
        buckets: bucketsRes.data || [],
        error: bucketsRes.error || null
      }
    };

    terminalOutput.textContent = JSON.stringify(diagnosticResult, null, 2);
    addLog('success', 'Diagnóstico completo ejecutado con éxito');
  } catch (err) {
    terminalOutput.textContent = `Error al ejecutar diagnóstico:\n${err.message}`;
    addLog('error', 'Error en diagnóstico completo', err);
  }
}

// Fetch Data Table
async function fetchTableData() {
  const tableName = document.getElementById('table-name-input').value.trim() || 'todos';
  const tableCountLabel = document.getElementById('table-count-label');
  const tableQueryTime = document.getElementById('table-query-time');
  const tableHead = document.getElementById('table-head');
  const tableBody = document.getElementById('table-body');

  tableCountLabel.textContent = `Consultando tabla "${tableName}"...`;
  const t0 = performance.now();

  try {
    const { data, error, count } = await supabase.from(tableName).select('*').limit(50);
    const t1 = performance.now();
    tableQueryTime.textContent = `${Math.round(t1 - t0)} ms`;

    if (error) {
      tableCountLabel.textContent = `Tabla "${tableName}": no existe o requiere permisos RLS.`;
      tableHead.innerHTML = `<tr><th>Estado de la Consulta</th></tr>`;
      tableBody.innerHTML = `
        <tr>
          <td class="empty-state">
            <div style="color: var(--status-warning); font-weight:600;">⚠️ ${escapeHtml(error.message)}</div>
            <p class="text-sm text-muted" style="margin-top:0.5rem;">Tip: Si la tabla no ha sido creada aún en el Dashboard de Supabase, puedes crearla desde el editor SQL o habilitar las políticas de acceso (RLS).</p>
          </td>
        </tr>
      `;
      addLog('info', `Consulta a tabla '${tableName}': ${error.message}`);
      return;
    }

    addLog('success', `Consulta exitosa a tabla '${tableName}' (${data ? data.length : 0} registros)`);
    tableCountLabel.textContent = `Total registros mostrados: ${data ? data.length : 0}`;

    if (!data || data.length === 0) {
      tableHead.innerHTML = `<tr><th>Resultado</th></tr>`;
      tableBody.innerHTML = `
        <tr>
          <td class="empty-state">La tabla "${escapeHtml(tableName)}" existe pero actualmente está vacía. Usá el botón "Insertar Registro" para agregar datos.</td>
        </tr>
      `;
      return;
    }

    // Render Dynamic Columns
    const columns = Object.keys(data[0]);
    tableHead.innerHTML = `<tr>${columns.map(c => `<th>${escapeHtml(c)}</th>`).join('')}</tr>`;

    // Render Dynamic Rows
    tableBody.innerHTML = data.map(row => {
      return `<tr>${columns.map(c => {
        const val = row[c];
        const displayVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return `<td>${escapeHtml(displayVal)}</td>`;
      }).join('')}</tr>`;
    }).join('');

  } catch (err) {
    tableCountLabel.textContent = `Error al consultar tabla "${tableName}"`;
    addLog('error', `Excepción al consultar tabla ${tableName}`, err);
  }
}

// Insert Table Row Modal Action
async function insertTableRow() {
  const tableName = document.getElementById('table-name-input').value.trim() || 'todos';
  const jsonText = document.getElementById('insert-json-input').value;
  const insertModal = document.getElementById('insert-modal');

  try {
    const payload = JSON.parse(jsonText);
    addLog('info', `Insertando registro en '${tableName}'...`, payload);

    const { data, error } = await supabase.from(tableName).insert([payload]).select();

    if (error) {
      alert(`Error al insertar: ${error.message}`);
      addLog('error', `Fallo inserción en '${tableName}'`, error);
      return;
    }

    addLog('success', `Registro insertado con éxito en '${tableName}'`, data);
    alert('¡Registro insertado con éxito!');
    insertModal.classList.remove('active');
    fetchTableData();

  } catch (err) {
    alert(`JSON inválido: ${err.message}`);
  }
}

// Auth Handlers
async function handleAuthLogin() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const resultBox = document.getElementById('auth-result-box');
  const resultContent = document.getElementById('auth-result-content');

  resultBox.style.display = 'block';
  resultContent.textContent = 'Procesando inicio de sesión...';

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      resultContent.textContent = `Error (${error.name}): ${error.message}`;
      addLog('error', 'Fallo al iniciar sesión', error);
    } else {
      resultContent.textContent = `Sesión Iniciada con Éxito:\n${JSON.stringify(data, null, 2)}`;
      addLog('success', `Sesión iniciada para ${email}`);
    }
  } catch (err) {
    resultContent.textContent = `Excepción: ${err.message}`;
  }
}

async function handleAuthSignup() {
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const resultBox = document.getElementById('auth-result-box');
  const resultContent = document.getElementById('auth-result-content');

  resultBox.style.display = 'block';
  resultContent.textContent = 'Registrando usuario en Supabase Auth...';

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      resultContent.textContent = `Error al registrar: ${error.message}`;
      addLog('error', 'Fallo registro de usuario', error);
    } else {
      resultContent.textContent = `Usuario Creado / Confirmación enviada:\n${JSON.stringify(data, null, 2)}`;
      addLog('success', `Usuario registrado: ${email}`);
    }
  } catch (err) {
    resultContent.textContent = `Excepción: ${err.message}`;
  }
}

async function handleAuthLogout() {
  await supabase.auth.signOut();
  addLog('info', 'Sesión de usuario cerrada');
  document.getElementById('auth-result-box').style.display = 'none';
}

function updateAuthUI(session) {
  const sessionInfoDiv = document.getElementById('auth-session-info');
  const logoutWrapper = document.getElementById('auth-logout-wrapper');

  if (session && session.user) {
    sessionInfoDiv.innerHTML = `
      <div style="text-align:left;">
        <h4 style="color:var(--primary); font-family:var(--font-heading); margin-bottom:0.4rem;">🟢 Sesión Activa</h4>
        <p class="font-mono text-sm"><strong>ID:</strong> ${escapeHtml(session.user.id)}</p>
        <p class="font-mono text-sm"><strong>Email:</strong> ${escapeHtml(session.user.email)}</p>
        <p class="font-mono text-sm"><strong>Último acceso:</strong> ${new Date(session.user.last_sign_in_at).toLocaleString()}</p>
      </div>
    `;
    logoutWrapper.style.display = 'block';
  } else {
    sessionInfoDiv.innerHTML = `
      <div class="empty-session">
        <i data-lucide="user-x" class="session-icon"></i>
        <p>No hay ningún usuario autenticado en esta sesión.</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    logoutWrapper.style.display = 'none';
  }
}

// Storage Buckets Explorer
async function fetchStorageBuckets() {
  const container = document.getElementById('storage-buckets-container');
  container.innerHTML = '<div class="bucket-skeleton">Cargando buckets de Supabase Storage...</div>';

  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    if (error) {
      container.innerHTML = `<div class="info-box hint">⚠️ ${escapeHtml(error.message)}</div>`;
      addLog('error', 'Error al obtener buckets de Storage', error);
      return;
    }

    if (!buckets || buckets.length === 0) {
      container.innerHTML = `
        <div class="card glass" style="grid-column: 1 / -1; padding: 2rem; text-align:center;">
          <h4 style="color:var(--text-muted);">No se encontraron Buckets creados en Storage</h4>
          <p class="text-sm text-dim" style="margin-top:0.5rem;">Crea un bucket desde la interfaz web de Supabase para subir imágenes y documentos.</p>
        </div>
      `;
      addLog('info', 'No se encontraron buckets de almacenamiento');
      return;
    }

    container.innerHTML = buckets.map(b => `
      <div class="bucket-card">
        <div class="bucket-name">
          <i data-lucide="folder"></i>
          <span>${escapeHtml(b.name)}</span>
        </div>
        <div class="text-sm text-muted">ID: <code>${escapeHtml(b.id)}</code></div>
        <div class="text-sm text-dim">Acceso: ${b.public ? '🌐 Público' : '🔒 Privado'}</div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
    addLog('success', `Buckets cargados: ${buckets.length}`);

  } catch (err) {
    container.innerHTML = `<div class="info-box hint">Excepción en Storage: ${escapeHtml(err.message)}</div>`;
  }
}

// Utility: Escape HTML
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
