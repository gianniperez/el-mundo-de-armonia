import type { CollectionConfig } from 'payload'

export const Characters: CollectionConfig = {
  slug: 'characters',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'themeColor'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nombre del Personaje (ej: Daniel Torres)',
      required: true,
    },
    {
      name: 'shortDescription',
      type: 'text',
      label: 'Descripción breve',
    },
    {
      name: 'themeColor',
      type: 'text',
      label: 'Color característico (hex, ej: #d97706 o #000000)',
      defaultValue: '#000000',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Avatar / Retrato de perfil',
      filterOptions: {
        category: {
          equals: 'character',
        },
      },
    },
    {
      name: 'expressions',
      type: 'array',
      label: 'Biblioteca de Expresiones / Sprites',
      fields: [
        {
          name: 'tag',
          type: 'text',
          label: 'Etiqueta de expresión (ej: normal, dormido, sonriendo, serio)',
          required: true,
        },
        {
          name: 'sprite',
          type: 'upload',
          relationTo: 'media',
          label: 'Sprite con fondo transparente',
          required: true,
          filterOptions: {
            category: {
              equals: 'character',
            },
          },
        },
      ],
    },
  ],
}
