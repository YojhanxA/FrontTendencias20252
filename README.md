# Frontend React (Vite + TS + MUI) para *Grupo 6 - Ventas*

Este frontend consume el backend Django/DRF incluido en tu proyecto **tendencias20252**.
Endpoints esperados (según el repo):
- `POST /api/token/` y `POST /api/token/refresh/` (JWT)
- `GET/POST /api/productos/`, `GET/PUT/DELETE /api/productos/:id/`
- `GET/POST /api/clientes/`, `GET/PUT/DELETE /api/clientes/:id/`
- `GET/POST /api/ventas/`, `GET/PUT/DELETE /api/ventas/:id/`
- `GET /api/reportes/ventas?from=YYYY-MM-DD&to=YYYY-MM-DD&format=(json|pdf)`

> **Nota de permisos**: según el código, crear/editar productos y ventas requiere roles (`admin` o `vendedor`) y la vista de reportes requiere autenticación. El frontend ocultará acciones si no hay sesión, pero el backend es quien decide.

## Correr en local

1. Clonar/copiar esta carpeta `ventas-frontend`.
2. Crear `.env` a partir de `.env.example` y comprobar `VITE_API_BASE_URL`.
3. Instalar dependencias y arrancar:
   ```bash
   npm install
   npm run dev
   ```
   El dev server abre en `http://localhost:5173`.

El `vite.config.ts` ya trae un **proxy** `/api -> http://localhost:8000`, por lo que si ejecutas el backend con `python manage.py runserver` no tendrás problemas de CORS durante desarrollo.

## Producción

- Sirve ambos (frontend y backend) bajo el mismo dominio o habilita CORS en Django (por ejemplo con `django-cors-headers`).
- Construir:
  ```bash
  npm run build
  npm run preview
  ```

## Estructura

```
src/
  api/      -> cliente axios + endpoints
  components/
  context/  -> Auth (manejo de JWT + refresh)
  pages/    -> Login, Productos, Clientes, Ventas, Reportes
  types.ts
  main.tsx, App.tsx, theme.ts
```
