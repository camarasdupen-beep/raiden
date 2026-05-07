# RAIDEN · Control de Vencimientos

App web para control de vencimientos de productos integrada con Loyverse.
Los datos de vencimientos se comparten en tiempo real entre los 3 celulares.

---

## ESTRUCTURA

```
raiden/
├── netlify.toml                  ← configuración de Netlify
├── public/
│   └── index.html                ← app web
└── netlify/
    └── functions/
        ├── loyverse.js           ← proxy API Loyverse (resuelve CORS)
        └── expiries.js           ← base de datos compartida (Netlify Blobs)
```

---

## DEPLOY EN NETLIFY

### Paso 1 — Subir a GitHub
1. Creá un repositorio nuevo en github.com
2. Subí todos estos archivos manteniendo la estructura de carpetas

### Paso 2 — Conectar con Netlify
1. netlify.com → "Add new site" → "Import from Git"
2. Seleccioná tu repositorio
3. Build settings:
   - **Publish directory:** `public`
   - **Functions directory:** `netlify/functions`
4. Clic en "Deploy site"

### Paso 3 — Configurar el Token de Loyverse
En Netlify → Site settings → Environment variables → Add variable:
```
Key:   LOYVERSE_TOKEN
Value: tu-token-de-loyverse
```
Luego hacé "Deploy" nuevamente para que tome el nuevo env var.

**¿Dónde encontrar el token de Loyverse?**
Loyverse Dashboard → Configuración → API → Crear token

### Paso 4 — Activar Netlify Blobs (para compartir datos entre 3 celes)
Los vencimientos se guardan en Netlify Blobs, que está incluido gratis.
Netlify lo activa automáticamente cuando la function lo usa por primera vez.

---

## USO

1. Abrí la URL de Netlify en los 3 celulares
2. Tocá **SYNC** para traer los productos de Loyverse
3. Tocá **+** para cargar la fecha de vencimiento de un producto
4. Los colores indican la urgencia:
   - 🔴 Rojo → vence en 7 días o menos
   - 🟠 Naranja → 15 días
   - 🟡 Amarillo → 1 mes
   - 🟢 Verde → hasta 2 meses (OK)
5. Cualquier cambio en un celu se refleja en los otros en ~90 segundos

---

## SI EL TOKEN ESTÁ EN NETLIFY (recomendado)
No necesitás ingresar nada en la app. El proxy lo usa automáticamente.

## SI PREFERÍS INGRESAR EL TOKEN EN LA APP
Dejás el env var vacío y la app te pide el token la primera vez.
Se guarda en el localStorage del celular.
