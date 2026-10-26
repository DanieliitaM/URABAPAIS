import { Router } from 'express';
import { normalizeRole } from '../middlewares/roleMiddleware.js';

const router = Router();

// Usuarios preconfigurados para cada rol independiente
export const USUARIOS_SISTEMA = [
  {
    id: 1,
    email: 'admin@urabapais.org',
    password: 'admin123',
    nombre: 'Dra. Carolina Salazar Ríos',
    cargo: 'Coordinadora General de Alianza',
    rol: 'Administrador',
    rolId: 'admin',
    organizacion: 'COOPI / Alianza URABÁ-PAÍS',
    avatar: 'CS',
    color: '#8b5cf6',
    descripcion: 'Control total de la plataforma, metas globales y gestión integral'
  },
  {
    id: 2,
    email: 'campo@urabapais.org',
    password: 'campo123',
    nombre: 'Carlos Mario Pérez',
    cargo: 'Enlace Operativo de Territorio',
    rol: 'Técnico',
    rolId: 'campo',
    organizacion: 'HIAS Colombia (Apartadó / Turbo / Necoclí)',
    avatar: 'CP',
    color: '#0ea5e9',
    descripcion: 'Registro en territorio, verificación de duplicados y entrega de kits'
  },
  {
    id: 3,
    email: 'auditor@urabapais.org',
    password: 'auditor123',
    nombre: 'Marta Helena Gómez',
    cargo: 'Especialista de Monitoreo y Calidad',
    rol: 'Auditor',
    rolId: 'auditor',
    organizacion: 'FADV / Humanity & Inclusion (HI)',
    avatar: 'MG',
    color: '#f59e0b',
    descripcion: 'Auditoría analítica, cumplimiento de metas y exportación de reportes'
  },
  {
    id: 4,
    email: 'comunidad@urabapais.org',
    password: 'comunidad123',
    nombre: 'Consulta Comunitaria Urabá',
    cargo: 'Beneficiarios y Ciudadanía',
    rol: 'Consulta Pública',
    rolId: 'comunidad',
    organizacion: 'Población Civil de Urabá',
    avatar: 'CU',
    color: '#10b981',
    descripcion: 'Consulta pública de rutas humanitarias e información sin datos personales'
  }
];

// Endpoint: Lista de usuarios de demostración
router.get('/usuarios-demo', (req, res) => {
  res.json({
    success: true,
    usuarios: USUARIOS_SISTEMA.map(u => ({
      email: u.email,
      password: u.password,
      nombre: u.nombre,
      cargo: u.cargo,
      rol: u.rol,
      rolId: u.rolId,
      organizacion: u.organizacion,
      avatar: u.avatar,
      color: u.color,
      descripcion: u.descripcion
    }))
  });
});

// Endpoint: Autenticación / Login
router.post('/login', (req, res) => {
  const { email, password, rolId } = req.body;

  // Acceso directo por rolId (para accesos rápidos de un clic)
  if (rolId) {
    const userByRole = USUARIOS_SISTEMA.find(u => u.rolId === rolId || u.rol.toLowerCase() === rolId.toLowerCase());
    if (userByRole) {
      return res.json({
        success: true,
        mensaje: `Bienvenido/a al Sistema URABÁ-PAÍS, ${userByRole.nombre}`,
        usuario: {
          id: userByRole.id,
          nombre: userByRole.nombre,
          email: userByRole.email,
          cargo: userByRole.cargo,
          rol: userByRole.rol,
          rolId: userByRole.rolId,
          organizacion: userByRole.organizacion,
          avatar: userByRole.avatar,
          color: userByRole.color
        },
        token: `token_demo_${userByRole.rolId}_${Date.now()}`
      });
    }
  }

  // Login tradicional con email y contraseña
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Debe ingresar el correo electrónico y la contraseña.'
    });
  }

  const cleanEmail = email.toString().trim().toLowerCase();
  const cleanPassword = password.toString().trim();

  const usuario = USUARIOS_SISTEMA.find(u => u.email.toLowerCase() === cleanEmail);

  if (!usuario) {
    return res.status(401).json({
      success: false,
      message: 'Correo electrónico no registrado en el sistema.'
    });
  }

  if (usuario.password !== cleanPassword) {
    return res.status(401).json({
      success: false,
      message: 'Contraseña incorrecta. Verifique sus credenciales.'
    });
  }

  return res.json({
    success: true,
    mensaje: `Bienvenido/a al Sistema URABÁ-PAÍS, ${usuario.nombre}`,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      cargo: usuario.cargo,
      rol: usuario.rol,
      rolId: usuario.rolId,
      organizacion: usuario.organizacion,
      avatar: usuario.avatar,
      color: usuario.color
    },
    token: `token_demo_${usuario.rolId}_${Date.now()}`
  });
});

// Endpoint: Registro / Crear cuenta o correo de usuario
router.post('/register', (req, res) => {
  const { nombre, email, password, rolId, cargo, organizacion } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Nombre completo, correo electrónico y contraseña son obligatorios.'
    });
  }

  const cleanEmail = email.toString().trim().toLowerCase();
  const existingUser = USUARIOS_SISTEMA.find(u => u.email.toLowerCase() === cleanEmail);

  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'Este correo electrónico ya se encuentra registrado. Intente iniciar sesión o restablecer su contraseña.'
    });
  }

  const roleKey = (rolId === 'tecnico' ? 'campo' : rolId === 'consulta_publica' ? 'comunidad' : rolId) || 'campo';
  const roleColors = {
    admin: '#8b5cf6',
    campo: '#0ea5e9',
    auditor: '#f59e0b',
    comunidad: '#10b981'
  };

  const roleNames = {
    admin: 'Administrador',
    campo: 'Técnico',
    auditor: 'Auditor',
    comunidad: 'Consulta Pública'
  };

  const initials = nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'UR';

  const nuevoUsuario = {
    id: USUARIOS_SISTEMA.length + 1,
    email: cleanEmail,
    password: password.toString().trim(),
    nombre: nombre.toString().trim(),
    cargo: (cargo && cargo.trim()) || 'Miembro Alianza URABÁ-PAÍS',
    rol: roleNames[roleKey] || 'Técnico',
    rolId: roleKey,
    organizacion: (organizacion && organizacion.trim()) || 'Alianza Humanitaria Urabá',
    avatar: initials,
    color: roleColors[roleKey] || '#0ea5e9',
    descripcion: 'Usuario registrado activamente en la plataforma'
  };

  USUARIOS_SISTEMA.push(nuevoUsuario);

  return res.status(201).json({
    success: true,
    message: 'Cuenta creada exitosamente en el Sistema URABÁ-PAÍS.',
    usuario: {
      id: nuevoUsuario.id,
      nombre: nuevoUsuario.nombre,
      email: nuevoUsuario.email,
      cargo: nuevoUsuario.cargo,
      rol: nuevoUsuario.rol,
      rolId: nuevoUsuario.rolId,
      organizacion: nuevoUsuario.organizacion,
      avatar: nuevoUsuario.avatar,
      color: nuevoUsuario.color
    },
    token: `token_registered_${nuevoUsuario.rolId}_${Date.now()}`
  });
});

// Endpoint: Recuperar o restablecer contraseña
router.post('/recuperar-password', (req, res) => {
  const { email, nuevaPassword } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Debe ingresar el correo electrónico asociado a la cuenta.'
    });
  }

  const cleanEmail = email.toString().trim().toLowerCase();
  const usuario = USUARIOS_SISTEMA.find(u => u.email.toLowerCase() === cleanEmail);

  if (!usuario) {
    return res.status(404).json({
      success: false,
      message: 'No se encontró ninguna cuenta asociada a este correo electrónico.'
    });
  }

  if (nuevaPassword) {
    if (nuevaPassword.length < 4) {
      return res.status(400).json({
        success: false,
        message: 'La nueva contraseña debe tener al menos 4 caracteres.'
      });
    }
    usuario.password = nuevaPassword.toString().trim();
    return res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente. Ya puede iniciar sesión con su nueva clave.',
      email: usuario.email
    });
  }

  // Si solo pide código o enlace de recuperación
  return res.json({
    success: true,
    message: 'Se han generado las instrucciones de recuperación de acceso para su correo.',
    email: usuario.email,
    tokenRecuperacion: 'REC-' + Math.floor(100000 + Math.random() * 900000),
    esCuentaDemo: ['admin@urabapais.org', 'campo@urabapais.org', 'auditor@urabapais.org', 'comunidad@urabapais.org'].includes(usuario.email)
  });
});

export default router;
