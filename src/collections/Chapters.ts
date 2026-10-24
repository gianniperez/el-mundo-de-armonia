import type { CollectionConfig } from 'payload'

export const Chapters: CollectionConfig = {
  slug: 'chapters',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['chapterNumber', 'title', 'order'],
  },
  fields: [
    {
      name: 'chapterNumber',
      type: 'number',
      label: 'Número de Capítulo / Parte',
      required: true,
      defaultValue: 1,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Título (ej: La despedida)',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Identificador (slug, ej: parte-1-la-despedida)',
      required: true,
      unique: true,
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Portada o Fondo del Capítulo',
    },
    {
      name: 'synopsis',
      type: 'textarea',
      label: 'Sinopsis / Resumen breve',
    },
  ],
}
