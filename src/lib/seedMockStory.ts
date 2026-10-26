import fs from 'fs'
import path from 'path'
import type { Payload } from 'payload'
import { INITIAL_SCENE_KEY, MOCK_STORY } from '@/data/mockStory'
import type { CharacterOnStage, SceneData } from '@/types/vn'

type MediaCategory = 'character' | 'background' | 'slide' | 'music' | 'sfx' | 'ui'

const CHARACTER_CANONICAL: Record<string, { name: string }> = {
  daniel: { name: 'Daniel Torres' },
  madre: { name: 'Mamá de Daniel' },
  gabriela: { name: 'Gabriela Valdez' },
  nicola: { name: 'Nicola Costa' },
}

const CHAPTER_1 = {
  chapterNumber: 1,
  title: 'Capítulo 1',
  slug: 'capitulo-1',
  synopsis:
    'Prólogo, despedida en casa, La Llamada, el viaje en subte y el primer encuentro con el cielo. Toda la demo actual es este capítulo.',
}

function publicFilePath(url: string) {
  const relative = url.replace(/^\//, '')
  return path.resolve(process.cwd(), 'public', relative)
}

function mimeFromName(filename: string) {
  const ext = path.extname(filename).toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  if (ext === '.mp3') return 'audio/mpeg'
  if (ext === '.ogg') return 'audio/ogg'
  if (ext === '.wav') return 'audio/wav'
  return 'application/octet-stream'
}

function titleFromFilename(filename: string) {
  return path
    .parse(filename)
    .name.replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function locationTagFromUrl(url: string) {
  return path
    .parse(url)
    .name.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function expressionTagFromSprite(spriteUrl: string, characterId: string) {
  const base = path.parse(spriteUrl).name
  const prefixes: Record<string, RegExp[]> = {
    daniel: [/^daniel sprite\s*/i],
    madre: [/^madre de daniel sprite\s*/i, /^madre de daniel\s*/i],
    gabriela: [/^malena sprite\s*/i, /^gabriela sprite\s*/i],
    nicola: [/^nicola sprite\s*/i, /^nicola\s*/i],
  }

  let tag = base
  for (const prefix of prefixes[characterId] || []) {
    tag = tag.replace(prefix, '')
  }
  tag = tag.trim()
  return tag || 'normal'
}

function sceneTypeOf(scene: SceneData): 'title_card' | 'story' | 'document' | 'cinematic' {
  if (scene.documentText) return 'document'
  if (
    scene.key === 'cover' ||
    scene.key === 'ch1_ending' ||
    scene.key.endsWith('_title')
  ) {
    return 'title_card'
  }
  return 'story'
}

async function findOne(payload: Payload, collection: string, where: Record<string, unknown>) {
  const result = await payload.find({
    collection: collection as never,
    where: where as never,
    limit: 1,
    overrideAccess: true,
  })
  return result.docs[0]
}

async function upsertMedia(
  payload: Payload,
  sourceUrl: string,
  category: MediaCategory,
  cache: Map<string, string | number>,
) {
  if (cache.has(sourceUrl)) return cache.get(sourceUrl)

  const filePath = publicFilePath(sourceUrl)
  const filename = path.basename(filePath)
  const stem = path.parse(filename).name

  const existing = await payload.find({
    collection: 'media',
    where: {
      or: [
        { alt: { equals: sourceUrl } },
        { filename: { equals: `${stem}.webp` } },
        { filename: { equals: filename } },
      ],
    },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs[0]) {
    const id = existing.docs[0].id
    if (existing.docs[0].category !== category || existing.docs[0].alt !== sourceUrl) {
      await payload.update({
        collection: 'media',
        id,
        data: { alt: sourceUrl, category },
        overrideAccess: true,
      })
    }
    cache.set(sourceUrl, id)
    return id
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`No se encontró el archivo: ${filePath}`)
  }

  const fileBuffer = fs.readFileSync(filePath)
  const uploaded = await payload.create({
    collection: 'media',
    data: {
      alt: sourceUrl,
      category,
    },
    file: {
      data: fileBuffer,
      name: filename,
      mimetype: mimeFromName(filename),
      size: fileBuffer.length,
    },
    overrideAccess: true,
  })

  cache.set(sourceUrl, uploaded.id)
  return uploaded.id
}

export async function seedMockStory(payload: Payload) {
  const mediaCache = new Map<string, string | number>()
  const backgroundCache = new Map<string, string | number>()
  const characterCache = new Map<string, string | number>()

  const scenes = Object.values(MOCK_STORY)

  const backgroundUrls = new Set<string>()
  const overlayUrls = new Set<string>()
  const characterSprites = new Map<string, Map<string, { url: string; displayName: string }>>()

  for (const scene of scenes) {
    if (scene.backgroundUrl) backgroundUrls.add(scene.backgroundUrl)
    if (scene.overlayImage?.url) overlayUrls.add(scene.overlayImage.url)
    for (const character of scene.characters || []) {
      if (!characterSprites.has(character.id)) characterSprites.set(character.id, new Map())
      characterSprites.get(character.id)!.set(character.spriteUrl, {
        url: character.spriteUrl,
        displayName: character.name,
      })
    }
  }

  const media = { uploaded: 0, reused: 0 }
  for (const url of backgroundUrls) {
    const before = mediaCache.size
    await upsertMedia(payload, url, 'background', mediaCache)
    if (mediaCache.size === before) media.reused += 1
    else media.uploaded += 1
  }
  for (const url of overlayUrls) {
    await upsertMedia(payload, url, 'ui', mediaCache)
  }
  for (const sprites of characterSprites.values()) {
    for (const { url } of sprites.values()) {
      await upsertMedia(payload, url, 'character', mediaCache)
    }
  }

  const backgrounds = { created: 0, updated: 0 }
  for (const url of backgroundUrls) {
    const imageId = mediaCache.get(url)
    const name = titleFromFilename(path.basename(url))
    const locationTag = locationTagFromUrl(url)
    const existing = await findOne(payload, 'backgrounds', { locationTag: { equals: locationTag } })
    const data = {
      name,
      locationTag,
      image: imageId,
      description: `Fondo importado desde ${url}`,
    }

    if (existing) {
      await payload.update({
        collection: 'backgrounds',
        id: existing.id,
        data,
        overrideAccess: true,
      })
      backgroundCache.set(url, existing.id)
      backgrounds.updated += 1
    } else {
      const created = await payload.create({
        collection: 'backgrounds',
        data,
        overrideAccess: true,
      })
      backgroundCache.set(url, created.id)
      backgrounds.created += 1
    }
  }

  const characters = { created: 0, updated: 0 }
  for (const [characterId, sprites] of characterSprites) {
    const canonical = CHARACTER_CANONICAL[characterId] || {
      name: [...sprites.values()][0]?.displayName || characterId,
      themeColor: '#000000',
    }
    const expressions = [...sprites.values()].map(({ url }) => ({
      tag: expressionTagFromSprite(url, characterId),
      sprite: mediaCache.get(url),
    }))
    const avatar = expressions.find((e) => e.tag === 'normal')?.sprite || expressions[0]?.sprite
    const existing = await findOne(payload, 'characters', { name: { equals: canonical.name } })
    const data = {
      name: canonical.name,
      shortDescription: `Personaje importado desde mockStory (${characterId})`,
      avatar,
      expressions,
    }

    if (existing) {
      await payload.update({
        collection: 'characters',
        id: existing.id,
        data,
        overrideAccess: true,
      })
      characterCache.set(characterId, existing.id)
      characters.updated += 1
    } else {
      const created = await payload.create({
        collection: 'characters',
        data,
        overrideAccess: true,
      })
      characterCache.set(characterId, created.id)
      characters.created += 1
    }
  }

  const chapters = { created: 0, updated: 0, removed: 0 }
  const coverUrl =
    scenes.find((s) => s.key === 'p1_title' || s.key === 'cover')?.backgroundUrl
  const coverImage = coverUrl ? mediaCache.get(coverUrl) : undefined
  const existingChapter =
    (await findOne(payload, 'chapters', { slug: { equals: CHAPTER_1.slug } })) ||
    (await findOne(payload, 'chapters', { chapterNumber: { equals: 1 } }))
  const chapterData = {
    ...CHAPTER_1,
    coverImage,
  }

  let chapter1Id: string | number
  if (existingChapter) {
    const updated = await payload.update({
      collection: 'chapters',
      id: existingChapter.id,
      data: chapterData,
      overrideAccess: true,
    })
    chapter1Id = updated.id
    chapters.updated += 1
  } else {
    const created = await payload.create({
      collection: 'chapters',
      data: chapterData,
      overrideAccess: true,
    })
    chapter1Id = created.id
    chapters.created += 1
  }

  await payload.update({
    collection: 'scenes',
    where: {
      chapter: {
        not_equals: chapter1Id,
      },
    },
    data: {
      chapter: chapter1Id,
    },
    overrideAccess: true,
  })

  const sceneResults: Array<{ action: string; sceneKey: string; id: string | number }> = []

  for (const scene of scenes) {
    const charactersOnStage = (scene.characters || []).map((character: CharacterOnStage) => ({
      character: characterCache.get(character.id),
      expressionTag: expressionTagFromSprite(character.spriteUrl, character.id),
      position: character.position || 'right',
    })).filter((entry) => entry.character)

    const data: Record<string, unknown> = {
      sceneKey: scene.key,
      sceneTitle: scene.sceneTitle,
      chapter: chapter1Id,
      sceneType: sceneTypeOf(scene),
      sceneMode: scene.mode,
      background: scene.backgroundUrl ? backgroundCache.get(scene.backgroundUrl) : undefined,
      overlayImage: scene.overlayImage?.url ? mediaCache.get(scene.overlayImage.url) : undefined,
      documentText: scene.documentText || undefined,
      documentFont: scene.documentFont || undefined,
      charactersOnStage,
      speakerName: scene.speakerName || undefined,
      speakerStatus: scene.speakerStatus || undefined,
      dialogueText: scene.dialogueText?.trim() ? scene.dialogueText : undefined,
      navigationType: scene.navigationType,
      nextSceneKey: scene.navigationType === 'linear' ? scene.nextSceneKey : undefined,
      choices:
        scene.navigationType === 'choice'
          ? (scene.choices || []).map((choice) => ({
              label: choice.text,
              targetSceneKey: choice.targetSceneKey,
            }))
          : [],
    }

    const existing = await findOne(payload, 'scenes', { sceneKey: { equals: scene.key } })
    if (existing) {
      const updated = await payload.update({
        collection: 'scenes',
        id: existing.id,
        data: data as never,
        overrideAccess: true,
      })
      sceneResults.push({ action: 'updated', sceneKey: scene.key, id: updated.id })
    } else {
      const created = await payload.create({
        collection: 'scenes',
        data: data as never,
        overrideAccess: true,
      })
      sceneResults.push({ action: 'created', sceneKey: scene.key, id: created.id })
    }
  }

  const extraChapters = await payload.find({
    collection: 'chapters',
    where: { id: { not_equals: chapter1Id } },
    limit: 100,
    overrideAccess: true,
  })
  for (const extra of extraChapters.docs) {
    await payload.delete({
      collection: 'chapters',
      id: extra.id,
      overrideAccess: true,
    })
    chapters.removed += 1
  }

  return {
    success: true,
    initialSceneKey: INITIAL_SCENE_KEY,
    media: {
      backgrounds: backgroundUrls.size,
      overlays: overlayUrls.size,
      sprites: [...characterSprites.values()].reduce((n, set) => n + set.size, 0),
    },
    backgrounds,
    characters,
    chapters,
    scenes: {
      total: sceneResults.length,
      created: sceneResults.filter((s) => s.action === 'created').length,
      updated: sceneResults.filter((s) => s.action === 'updated').length,
      keys: sceneResults.map((s) => s.sceneKey),
    },
  }
}
