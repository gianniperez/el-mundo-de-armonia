import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { seedMockStory } from '@/lib/seedMockStory'

export const maxDuration = 300

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const result = await seedMockStory(payload)
    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown seed error'
    console.error('Seed error:', error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
