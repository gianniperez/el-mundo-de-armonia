import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'alt',
  },
  upload: {
    staticDir: 'public/media',
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*', 'audio/*'],
    formatOptions: {
      format: 'webp',
      options: { quality: 85 },
    },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 320,
        height: 180,
        position: 'centre',
        formatOptions: { format: 'webp', options: { quality: 80 } },
      },
      {
        name: 'full',
        width: 1920,
        height: 1080,
        position: 'centre',
        formatOptions: { format: 'webp', options: { quality: 85 } },
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Descripción o Nombre del archivo',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      label: 'Categoría',
      options: [
        { label: 'Sprite de Personaje', value: 'character' },
        { label: 'Fondo de Escenario (Background)', value: 'background' },
        { label: 'Slide Completo (Modo Plano)', value: 'slide' },
        { label: 'Música Ambiental (BGM)', value: 'music' },
        { label: 'Efecto de Sonido (SFX)', value: 'sfx' },
        { label: 'Interfaz / Logo', value: 'ui' },
      ],
      defaultValue: 'character',
    },
  ],
}
