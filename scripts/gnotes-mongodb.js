// ============================================================
// Módulo Gnotes — Setup de colección e índices
// ============================================================
// Copiar y pegar en MongoDB Compass (MongoDB Shell)
// ============================================================

// 2. Crear colección (si no existe)
db.createCollection('gnotes')

// 3. Índices
db.gnotes.createIndex({ slug: 1 }, { unique: true })
db.gnotes.createIndex({ updated: -1 })
db.gnotes.createIndex({ owner: 1 })
db.gnotes.createIndex({ title: 'text', body: 'text', tags: 'text' })

// 4. Seed data
db.gnotes.insertMany([
  {
    slug: 'bienvenida',
    title: 'Nota de bienvenida',
    body: '# Bienvenido\n\nEsta es una nota de **ejemplo** en la plataforma.',
    tags: ['intro', 'ejemplo'],
    updated: '2026-06-22',
    owner: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    slug: 'markdown-guide',
    title: 'Guía rápida de Markdown',
    body: '## Encabezados\n\nUsa `#` para **títulos**.\n\n- Listas con `-`\n- **Negrita** con `**`',
    tags: ['markdown', 'guia'],
    updated: '2026-06-21',
    owner: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  },
  {
    slug: 'api-endpoints',
    title: 'Endpoints del módulo Gnotes',
    body: '| Método | Ruta | Descripción |\n|--------|------|-------------|\n| GET | /gnotes | Lista notas |\n| POST | /gnotes | Crea nota |\n| PUT | /gnotes/:slug | Actualiza nota |\n| DELETE | /gnotes/:slug | Elimina nota |',
    tags: ['api', 'referencia'],
    updated: '2026-06-20',
    owner: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  }
])
