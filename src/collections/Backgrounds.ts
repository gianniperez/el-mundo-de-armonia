import type { CollectionConfig } from 'payload'

export const Backgrounds: CollectionConfig = {
  slug: 'backgrounds',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'locationTag', 'image'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nombre de la Locación / Fondo (ej: Habitación de Daniel)',
      required: true,
    },
    {
      name: 'locationTag',
      type: 'text',
      label: 'Identificador corto (ej: hab_dani, subte_estacion, cielo)',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagen del Fondo',
      required: true,
      filterOptions: {
        category: {
          equals: 'background',
        },
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Notas de ambientación o descripción del lugar',
    },
  ],
}
