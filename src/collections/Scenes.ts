import type { CollectionConfig } from 'payload'

export const Scenes: CollectionConfig = {
  slug: 'scenes',
  admin: {
    useAsTitle: 'sceneKey',
    defaultColumns: ['sceneKey', 'sceneTitle', 'chapter', 'speakerName', 'navigationType'],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Guion y Diálogo',
          description: 'Identificación de la escena, texto del diálogo y narrativa',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'sceneKey',
                  type: 'text',
                  label: 'ID de escena (ej: hab_daniel_01)',
                  required: true,
                  unique: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'sceneTitle',
                  type: 'text',
                  label: 'Título en pantalla (ej: HABITACIÓN DE DANIEL)',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'chapter',
                  type: 'relationship',
                  relationTo: 'chapters',
                  label: 'Capítulo',
                  required: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'sceneType',
                  type: 'select',
                  label: 'Tipo de Escena',
                  options: [
                    { label: 'Diálogo / Historia estándar', value: 'story' },
                    { label: 'Portada / Título de Capítulo', value: 'title_card' },
                    { label: 'Documento / Pergamino / Carta', value: 'document' },
                    { label: 'Cinemática / Transición', value: 'cinematic' },
                  ],
                  defaultValue: 'story',
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              admin: {
                condition: (data) => data.sceneType !== 'title_card',
              },
              fields: [
                {
                  name: 'speakerName',
                  type: 'text',
                  label: 'Nombre del Hablante (ej: DANIEL TORRES, ???)',
                  admin: {
                    width: '50%',
                    description: 'Dejar vacío para narración en tercera persona',
                  },
                },
                {
                  name: 'speakerStatus',
                  type: 'text',
                  label: 'Acotación / Estado (en cursiva)',
                  admin: {
                    width: '50%',
                    description: 'ej: (Todavía medio dormido) o descripción ambiental',
                  },
                },
              ],
            },
            {
              name: 'dialogueText',
              type: 'textarea',
              label: 'Texto del Diálogo',
              admin: {
                condition: (data) => data.sceneType !== 'title_card' && data.sceneType !== 'document',
                description: 'Línea de diálogo hablada (admite saltos de línea y comillas « »)',
              },
            },
            {
              name: 'documentText',
              type: 'textarea',
              label: 'Texto del Documento o Pergamino',
              admin: {
                condition: (data) => data.sceneType === 'document',
                description: 'Texto renderizado sobre el pergamino',
              },
            },
            {
              name: 'documentFont',
              type: 'select',
              label: 'Tipografía del Documento',
              defaultValue: 'script',
              options: [
                { label: 'Manuscrita / Cursiva (Carta de Schneider)', value: 'script' },
                { label: 'Serif / Imprenta Formal (Decreto y Normativas)', value: 'serif' },
              ],
              admin: {
                condition: (data) => data.sceneType === 'document',
                description: 'Elige si el texto se ve en cursiva personal o en serif formal',
              },
            },
            {
              name: 'overlayImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Imagen superpuesta (ej: Polaroid de Schneider pegada con cinta)',
              admin: {
                condition: (data) => data.sceneType === 'document' || data.sceneType === 'story',
              },
            },
          ],
        },
        {
          label: 'Escenario y Personajes',
          description: 'Fondos ilustrados y personajes presentes en pantalla',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'sceneMode',
                  type: 'select',
                  label: 'Formato Visual',
                  options: [
                    { label: 'Multicapa (Fondo + Sprites + UI)', value: 'layered' },
                    { label: 'Diapositiva Completa (Modo Plano)', value: 'flat' },
                  ],
                  defaultValue: 'layered',
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'background',
                  type: 'relationship',
                  relationTo: 'backgrounds',
                  label: 'Fondo del Escenario',
                  admin: {
                    width: '50%',
                    condition: (data) => data.sceneMode === 'layered',
                  },
                },
              ],
            },
            {
              name: 'flatSlideImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Imagen completa de la diapositiva',
              admin: {
                condition: (data) => data.sceneMode === 'flat',
              },
            },
            {
              name: 'charactersOnStage',
              type: 'array',
              label: 'Personajes en Escena',
              admin: {
                condition: (data) => data.sceneMode === 'layered',
                description: 'Personajes visibles en este diálogo. Normalmente se ubican a la derecha.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'character',
                      type: 'relationship',
                      relationTo: 'characters',
                      label: 'Personaje',
                      required: true,
                      admin: {
                        width: '40%',
                      },
                    },
                    {
                      name: 'expressionTag',
                      type: 'text',
                      label: 'Expresión / Sprite',
                      defaultValue: 'normal',
                      admin: {
                        width: '35%',
                        description: 'ej: normal, serio, feliz, sorprendido, hablando, sonriente, sombra',
                      },
                    },
                    {
                      name: 'position',
                      type: 'select',
                      label: 'Posición',
                      options: [
                        { label: 'Derecha (Estándar)', value: 'right' },
                        { label: 'Centro', value: 'center' },
                        { label: 'Izquierda', value: 'left' },
                      ],
                      defaultValue: 'right',
                      admin: {
                        width: '25%',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Flujo y Decisiones',
          description: 'Hacia dónde avanza la historia al hacer click o tomar decisiones',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'navigationType',
                  type: 'select',
                  label: 'Tipo de Avance',
                  options: [
                    { label: 'Lineal (Siguiente automático al hacer click)', value: 'linear' },
                    { label: 'Toma de Decisiones (Bifurcación / Opciones)', value: 'choice' },
                    { label: 'Fin de capítulo', value: 'end' },
                  ],
                  defaultValue: 'linear',
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'nextSceneKey',
                  type: 'text',
                  label: 'ID de la Siguiente Escena',
                  admin: {
                    width: '50%',
                    condition: (data) => data.navigationType === 'linear',
                    description: 'Identificador exacto de la siguiente escena (ej: hab_daniel_02)',
                  },
                },
              ],
            },
            {
              name: 'choices',
              type: 'array',
              label: 'Opciones de Decisión (Cápsulas en pantalla)',
              admin: {
                condition: (data) => data.navigationType === 'choice',
                description: 'Botones que aparecen en el tercio superior izquierdo para que el jugador elija.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      label: 'Texto del Botón / Opción',
                      required: true,
                      admin: {
                        width: '65%',
                        description: 'ej: «Voy a estar bien ma. Te prometo que voy a volver.»',
                      },
                    },
                    {
                      name: 'targetSceneKey',
                      type: 'text',
                      label: 'ID Escena Destino',
                      required: true,
                      admin: {
                        width: '35%',
                        description: 'ej: hab_daniel_14',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Audio y Música',
          description: 'Banda sonora y efectos ambientales',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'bgmTrack',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Música de Fondo (BGM)',
                  admin: {
                    width: '50%',
                    description: 'Dejar vacío para continuar la música que ya está sonando',
                  },
                },
                {
                  name: 'sfxTrack',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Efecto de Sonido (SFX)',
                  admin: {
                    width: '50%',
                    description: 'Efecto puntual al entrar a la escena (ej: despertador, puerta, trueno)',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
