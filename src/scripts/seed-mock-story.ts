import { loadEnvConfig } from '@next/env'
import { getPayload } from 'payload'
import config from '../payload.config'
import { seedMockStory } from '../lib/seedMockStory'

loadEnvConfig(process.cwd())

async function main() {
  const payload = await getPayload({ config })
  const result = await seedMockStory(payload)
  console.log(JSON.stringify(result, null, 2))
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
