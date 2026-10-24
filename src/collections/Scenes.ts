import type { CollectionConfig } from 'payload'

export const Scenes: CollectionConfig = {
  slug: 'scenes',
  admin: {
    useAsTitle: 'sceneKey',
    defaultColumns: ['sceneKey', 'chapter', 'sceneMode', 'sceneType'],
  },
  fields: [
    {
      name: 'sceneKey',
      type: 'text',
      label: 'Identificador único de escena (ej: hab_daniel_01, intro_02)',
      required: true,
      unique: true,
    },
    {
      name: 'sceneTitle',
      type: 'text',
      label: 'Título de locación / escena (ej: HABITACIÓN DE DANIEL)',
    },
    {
      name: 'chapter',
      type: 'relationship',
      relationTo: 'chapters',
      label: 'Capítulo al que pertenece',
      required: true,
    },
    {
      name: 'sceneType',
      type: 'select',
      label: 'Tipo de escena',
      options: [
        { label: 'Portada / Título de Capítulo', value: 'title_card' },
        { label: 'Diálogo / Historia', value: 'story' },
        { label: 'Documento / Pergamino / Carta', value: 'document' },
        { label: 'Cinemática / Transición', value: 'cinematic' },
      ],
      defaultValue: 'story',
    },
    {
      name: 'sceneMode',
      type: 'select',
      label: 'Formato visual',
      options: [
        { label: 'Diapositiva Completa (Modo Plano - Todo pegado)', value: 'flat' },
        { label: 'Multicapa (Fondo + Personajes + Diálogo dinámico)', value: 'layered' },
      ],
      defaultValue: 'layered',
    },
    // Modo Plano
    {
      name: 'flatSlideImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagen completa de la diapositiva',
      admin: {
        condition: (data) => data.sceneMode === 'flat',
      },
    },
    // Modo Multicapa
    {
      name: 'background',
      type: 'relationship',
      relationTo: 'backgrounds',
      label: 'Fondo del escenario (Locación)',
      admin: {
        condition: (data) => data.sceneMode === 'layered',
      },
    },
    {
      name: 'overlayImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto u objeto superpuesto (ej: Polaroid de Schneider)',
      admin: {
        description: 'Imagen flotante superpuesta sobre el fondo (como la foto polaroid pegada con cinta)',
      },
    },
    {
      name: 'documentText',
      type: 'textarea',
      label: 'Texto del pergamino o documento',
      admin: {
        description: 'Texto renderizado directamente sobre el pergamino con tipografía manuscrita',
      },
    },
    {
      name: 'charactersOnStage',
      type: 'array',
      label: 'Personajes en pantalla',
      admin: {
        condition: (data) => data.sceneMode === 'layered',
      },
      fields: [
        {
          name: 'character',
          type: 'relationship',
          relationTo: 'characters',
          label: 'Personaje',
          required: true,
        },
        {
          name: 'expressionTag',
          type: 'text',
          label: 'Expresión (ej: normal, dormido, sonriendo)',
          defaultValue: 'normal',
        },
        {
          name: 'position',
          type: 'select',
          label: 'Posición en pantalla',
          options: [
            { label: 'Izquierda', value: 'left' },
            { label: 'Centro', value: 'center' },
            { label: 'Derecha', value: 'right' },
          ],
          defaultValue: 'right',
        },
      ],
    },
    // Diálogo
    {
      name: 'speakerName',
      type: 'text',
      label: 'Nombre del hablante (ej: DANIEL TORRES)',
    },
    {
      name: 'speakerStatus',
      type: 'text',
      label: 'Acotación / Estado (ej: Todavía medio dormido)',
    },
    {
      name: 'dialogueText',
      type: 'textarea',
      label: 'Texto del diálogo (ej: «No puede ser... por fin llegó el día».)',
    },
    // Audio
    {
      name: 'bgmTrack',
      type: 'upload',
      relationTo: 'media',
      label: 'Música ambiental (BGM) - Deja vacío para continuar la música actual',
    },
    {
      name: 'sfxTrack',
      type: 'upload',
      relationTo: 'media',
      label: 'Efecto de sonido al entrar a la escena (SFX)',
    },
    // Navegación y Ramificaciones
    {
      name: 'navigationType',
      type: 'select',
      label: 'Tipo de avance',
      options: [
        { label: 'Lineal (Siguiente automático al hacer click)', value: 'linear' },
        { label: 'Toma de decisiones (Bifurcación / Opciones)', value: 'choice' },
        { label: 'Fin de capítulo', value: 'end' },
      ],
      defaultValue: 'linear',
    },
    {
      name: 'nextSceneKey',
      type: 'text',
      label: 'Identificador de la siguiente escena (si es Lineal)',
      admin: {
        condition: (data) => data.navigationType === 'linear',
      },
    },
    {
      name: 'choices',
      type: 'array',
      label: 'Opciones de Decisión',
      admin: {
        condition: (data) => data.navigationType === 'choice',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Texto de la opción (ej: «Levantarse de un salto»)',
          required: true,
        },
        {
          name: 'targetSceneKey',
          type: 'text',
          label: 'Identificador de la escena destino',
          required: true,
        },
      ],
    },
  ],
}
