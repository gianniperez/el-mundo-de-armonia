export type Position = 'left' | 'center' | 'right'

export interface CharacterOnStage {
  id: string
  name: string
  spriteUrl: string
  position: Position
  isSpeaking?: boolean
}

export interface ChoiceOption {
  id: string
  text: string
  targetSceneKey: string
  hint?: string
}

export interface OverlayImage {
  url: string
  alt?: string
  position?: 'bottom-right' | 'bottom-left' | 'center' | 'top-right'
  className?: string
}

export interface SceneData {
  key: string
  chapterTitle: string
  sceneTitle: string
  mode: 'flat' | 'layered'
  
  // Flat mode
  flatImageUrl?: string
  
  // Layered mode
  backgroundUrl?: string
  characters?: CharacterOnStage[]
  speakerName?: string
  speakerStatus?: string // ej: "(Todavía medio dormido)"
  dialogueText?: string

  // Document / Letter mode
  documentText?: string
  overlayImage?: OverlayImage
  
  // Audio
  bgmUrl?: string
  sfxUrl?: string
  
  // Navigation
  navigationType: 'linear' | 'choice' | 'end'
  nextSceneKey?: string
  choices?: ChoiceOption[]
}

export interface SaveData {
  slotId: number
  timestamp: string
  sceneKey: string
  sceneTitle: string
  chapterTitle: string
  previewText: string
}
