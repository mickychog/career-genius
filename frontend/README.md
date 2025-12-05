# 💻 Documentación Técnica - Frontend (React)

El frontend de **CareerGenius** es una aplicación de página única
(**SPA**) construida con **React 18** y **TypeScript**.

------------------------------------------------------------------------

## 1. Estructura y Componentes

La aplicación utiliza una arquitectura basada en **componentes
funcionales** y **Hooks**.

### 📁 Directorios Clave

#### `/src/pages` --- Vistas principales

-   **VocationalTestPage.tsx**:\
    Maneja la lógica visual del test adaptativo, incluyendo barra de
    progreso y transiciones de fase.
-   **DashboardPage.tsx**:\
    Panel que consume datos en tiempo real del backend.
-   **UniversitySearchPage.tsx**:\
    Buscador con filtros por departamento.

#### `/src/components`

Componentes reutilizables como:\
- `Header`\
- `Sidebar` (incluye menú móvil)\
- `ProtectedRoute`

#### `/src/context`

-   `AuthContext` para manejar el estado global de sesión mediante
    **JWT**.

#### `/src/services`

-   `api.ts` configura **Axios** con interceptores para inyectar
    automáticamente el token en cada petición.

------------------------------------------------------------------------

## 2. Características UX/UI

### 📱 Diseño Responsivo

Uso de **CSS Grid**, **Flexbox** y **Media Queries** adaptado para
móviles y escritorio.

### 🔔 Feedback al Usuario

Integración de **react-toastify** para mostrar notificaciones de
éxito/error de forma no intrusiva.

### 🔐 Rutas Protegidas

-   `ProtectedRoute`: Bloquea acceso no autorizado.\
-   `PublicRoute`: Redirige usuarios logueados a su dashboard.

------------------------------------------------------------------------

## 3. Comandos Útiles (Desarrollo Manual)

Para ejecutar el frontend sin Docker:

``` bash
cd frontend
npm install
npm start
```

La aplicación iniciará en:

**http://localhost:3001**
