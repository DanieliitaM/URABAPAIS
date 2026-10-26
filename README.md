# 🌿 URABÁ-PAÍS — Sistema de Gestión y Seguimiento de Beneficiarios

> **Hackathon URABÁ-PAÍS (12 Horas)**  
> **Iniciativa liderada por:** COOPI Cooperación Internacional, Fondazione L'Albero della Vita (FADV), Fundación HIAS Colombia y Humanity and Inclusion (HI).  
> **Territorio Foco:** Apartadó, Turbo y Necoclí (Antioquia, Colombia).  
> **Meta Global:** 11.447 personas beneficiarias.

---

## 📌 1. Descripción de la Solución y Problemática Atendida

Una misma persona o familia en situación de vulnerabilidad, desplazamiento o migración en el Urabá puede recibir atención humanitaria, apoyo en salud o capacitación técnica de distintas organizaciones. Cuando esa información queda dispersa en formularios aislados, se fragmenta la atención, se duplican registros y se pierde la trazabilidad de los avances y compromisos pendientes.

**URABÁ-PAÍS** es una plataforma web integral que unifica la gestión de beneficiarios bajo una premisa fundamental: **una persona física conserva un único código interno inmutable**, reuniendo en una **Ficha Única Consolidada** su núcleo familiar, los programas a los que pertenece, los bienes o ayudas recibidas y su historial de seguimientos con alertas de próximas acciones.

---

## 🏗️ 2. Arquitectura del Backend (Capas Estrictas)

El backend fue desarrollado con **Node.js** y **Express** siguiendo una arquitectura modular en 5 capas desacopladas tal como fue solicitado:

```
backend/
├── src/
│   ├── schemas/        # Capa de Esquemas: DDL de MySQL (database.sql) y validaciones Zod
│   │   ├── database.sql
│   │   ├── beneficiarySchema.js
│   │   ├── familySchema.js
│   │   ├── programSchema.js
│   │   ├── participationSchema.js
│   │   ├── attentionSchema.js
│   │   └── followupSchema.js
│   ├── models/         # Capa de Modelos: Entidades de dominio y transformaciones
│   │   ├── Beneficiary.js
│   │   ├── FamilyMember.js
│   │   ├── Program.js
│   │   ├── Participation.js
│   │   ├── Attention.js
│   │   └── Followup.js
│   ├── repositories/   # Capa de Repositorios: Consultas SQL y acceso a persistencia
│   │   ├── beneficiaryRepository.js
│   │   ├── familyRepository.js
│   │   ├── programRepository.js
│   │   ├── participationRepository.js
│   │   ├── attentionRepository.js
│   │   ├── followupRepository.js
│   │   └── reportRepository.js
│   ├── services/       # Capa de Servicios: Lógica de negocio y reglas de validación
│   │   ├── beneficiaryService.js    (Regla anti-duplicados y código único)
│   │   ├── programService.js        (Metas y líneas estratégicas R1, R2, R3)
│   │   ├── participationService.js  (Estados: Inscrito, En proceso, Finalizado)
│   │   ├── attentionService.js      (Registro de entregas, kits y remisiones)
│   │   ├── followupService.js       (Seguimiento de novedades y próximas acciones)
│   │   ├── reportService.js         (Métricas agregadas sin datos personales)
│   │   └── aiAssistantService.js    (Síntesis de casos y alertas asistidas)
│   ├── controllers/    # Capa de Controles: Manejo de solicitudes HTTP y respuestas
│   │   ├── beneficiaryController.js
│   │   ├── familyController.js
│   │   ├── programController.js
│   │   ├── participationController.js
│   │   ├── attentionController.js
│   │   ├── followupController.js
│   │   └── reportController.js
│   ├── routes/         # Definición de rutas RESTful Express
│   ├── config/         # Configuración del pool MySQL y modo de respaldo automático
│   └── server.js       # Punto de entrada del servidor Express
```

---

## 🗄️ 3. Base de Datos (MySQL)

El sistema incluye el script SQL completo en [`backend/src/schemas/database.sql`](file:///c:/Users/ASUS/Downloads/URABAPAIS/backend/src/schemas/database.sql) con las 7 tablas relacionales:

1. `beneficiarios`: Registro de la persona, datos sociodemográficos, código inmutable (`BEN-XXX`), consentimiento Habeas Data.
2. `familiares`: Núcleo familiar dependiente (hijos, parejas, padres, dependientes).
3. `programas`: Catálogo de las 3 líneas estratégicas (R1 Asistencia Humanitaria, R2 Salud y Bienestar, R3 Integración Socioeconómica).
4. `participaciones`: Vinculaciones con fecha y estado (`Inscrito`, `En proceso`, `Finalizado`, `Retirado`).
5. `atenciones`: Registro de entregas (kits, consultas, alimentos, remisiones).
6. `seguimientos`: Novedades observadas, estado del caso y alertas de próxima acción con fecha.
7. `usuarios`: Gestión de roles (Administrador / Funcionario de Campo).

> **Dualidad y Tolerancia a Fallos:**  
> Si su servidor MySQL local está activo, el sistema se conecta automáticamente y crea las tablas y datos. Si el servicio MySQL no estuviese iniciado al momento de la demostración, el sistema activa un **motor de respaldo de alta disponibilidad** precargado con los 100 beneficiarios de prueba del archivo oficial `Base_Beneficiarios_Hackathon.xlsx`, asegurando que la presentación nunca se interrumpa por problemas de base de datos.

---

## 🎨 4. Frontend (React + Vite) y Diseño Accesible

- **Tecnología:** React 19 + Vite + Lucide Icons.
- **Paleta de Colores Humanitaria:** Diseñada especialmente para ser agradable a la vista de personas de todas las edades (evita el deslumbramiento blanco y los colores estridentes):
  - **Teal / Océano Caribe (`#0d7685`):** Transmite calma, confianza y estabilidad humanitaria.
  - **Terracota / Tierra Cálida (`#e07a5f`):** Evoca la calidez de la región del Urabá y la cercanía comunitaria.
  - **Verde Esperanza (`#15803d`):** Indicadores de éxito y consentimientos aprobados.
  - **Superficie Suave (`#f8fafc`):** Fondo descansado para evitar la fatiga visual.
- **Herramientas de Accesibilidad Incorporadas:**
  - **Selector de Tamaño de Texto:** Botón `A Normal`, `A Grande (+15%)`, `A Extra Grande (+28%)` para adultos mayores o lectura en campo bajo el sol.
  - **Modo Alto Contraste:** Para personas con baja agudeza visual.
  - **Navegación Intuitiva:** Menú superior visible en todo momento con pestañas claras para movilizarse fácilmente:
    1. **Tablero de Indicadores**
    2. **Directorio de Personas**
    3. **+ Nuevo Registro (Paso a Paso)**
    4. **Programas y Líneas**
    5. **Atenciones y Ayudas**
    6. **Seguimientos y Alertas**
    7. **Portal Comunitario Público**

---

## 🔄 5. Flujo Mínimo Obligatorio del Reto (Demostración)

El sistema implementa el flujo continuo oficial en 5 pasos:

1. **Búsqueda Previa y Regla Anti-Duplicados:**
   - Antes de registrar, se busca a la persona por documento.
   - Si el documento ya existe (ej: `FIC-200001`), el sistema bloquea el duplicado, advierte al usuario y le permite abrir directamente la **Ficha Existente**.
   - Si no tiene documento, compara nombres y teléfonos alertando coincidencias similares.
2. **Registro de Datos y Habeas Data:**
   - Nombres, edad, municipio (Apartadó, Turbo, Necoclí), zona y casilla obligatoria de autorización para el tratamiento de datos.
3. **Núcleo Familiar:**
   - Relaciona integrantes familiares dependientes con parentesco y edad.
4. **Vinculación a Programa:**
   - Asocia a la persona con una o más líneas de trabajo con estado inicial `Inscrito`.
5. **Atención y Seguimiento:**
   - Permite registrar la primera entrega o ayuda (kit higiénico, de dignidad, salud, etc.).
6. **Ficha Única y Reporte:**
   - Consolida todo el historial en un solo perfil y actualiza dinámicamente los 4 indicadores del tablero sin exponer datos privados en los reportes públicos.

---

## 🚀 6. Instrucciones para Ejecutar el Proyecto

### Requisitos Previos
- Node.js v18 o superior.
- (Opcional) MySQL Server 8.0 local.

### 1. Iniciar el Backend
```bash
cd backend
npm install
npm start
```
*El backend quedará escuchando en `http://localhost:5000`*.

### 2. Iniciar el Frontend
En otra terminal:
```bash
cd frontend
npm install
npm run dev
```
*El frontend se abrirá en `http://localhost:5173` o `http://localhost:5174`*.

---

## 👥 7. Tipos de Usuario Propuestos y Privacidad

| Tipo de Usuario | Información Visible | Acciones Permitidas |
| :--- | :--- | :--- |
| **Administrador / Coordinador** | Fichas completas, reportes consolidados, auditoría y exportación CSV. | Crear, editar programas, reasignar casos y exportar reportes. |
| **Técnico / Enlace de Campo** | Fichas de beneficiarios de su municipio asignado. | Registrar personas, añadir familiares, registrar ayudas y seguimientos. |
| **Comunidad / Portal Público** | Indicadores agregados, rutas de atención, sedes y teléfonos. | Consulta informativa **sin acceso a nombres ni documentos de identidad**. |

---

## 🏆 8. Cumplimiento de Criterios del Jurado

- [x] Flujo Registro → Vinculación → Atención → Seguimiento → Reporte 100% funcional.
- [x] Regla de Beneficiario Único: código interno inmutable (`BEN-XXX`) y control estricto de duplicados por documento.
- [x] Ficha única consolidada con historial integrado.
- [x] 4 Indicadores dinámicos calculados en tiempo real (personas únicas separadas de eventos).
- [x] Protección de datos y consentimiento de Habeas Data implementado.
- [x] Componentes complementarios: Asistente IA ético de síntesis de caso, descarga de reportes CSV, selector de accesibilidad y portal comunitario.
