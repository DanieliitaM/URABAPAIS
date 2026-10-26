import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './config/db.js';
import apiRoutes from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*', // Permitir conexión desde Vite Frontend
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-role', 'x-rol']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger básico para peticiones
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Rutas API
app.use('/api', apiRoutes);

// Ruta raíz de verificación
app.get('/', (req, res) => {
  res.json({
    nombre: 'API Proyecto URABÁ-PAÍS',
    descripcion: 'Sistema de Gestión y Seguimiento de Beneficiarios y Familias',
    documentacion_rutas: '/api/status',
    estado: 'Servidor funcionando correctamente'
  });
});

// Manejador centralizado de errores
app.use((err, req, res, next) => {
  console.error('❌ Error capturado:', err);

  // Error de validación Zod
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación en los datos enviados',
      errores: err.errors.map(e => ({
        campo: e.path.join('.'),
        mensaje: e.message
      }))
    });
  }

  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    detalles: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Inicializar Base de Datos y arrancar servidor
const startServer = async () => {
  console.log('🚀 Iniciando sistema URABÁ-PAÍS...');
  await initDatabase();

  const server = app.listen(PORT, () => {
    console.log(`✅ Servidor backend Express escuchando en http://localhost:${PORT}`);
    console.log(`📡 Endpoints API disponibles en http://localhost:${PORT}/api`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`⚠️ El puerto ${PORT} ya está ocupado por otra instancia.`);
      console.log(`💡 Solución: Cierra la terminal previa o cambia 'PORT' en el archivo .env`);
      process.exit(1);
    } else {
      console.error('Error en el servidor:', err);
    }
  });
};

startServer().catch(err => {
  console.error('Error fatal al iniciar la aplicación:', err);
});
