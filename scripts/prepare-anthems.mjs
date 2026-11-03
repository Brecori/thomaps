import { readFile, writeFile, mkdtemp, rm, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setTimeout as delay } from 'node:timers/promises'

const audit = JSON.parse(await readFile('data-sources/anthems.json', 'utf8'))
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex')
const temporary = await mkdtemp(join(tmpdir(), 'thomaps-anthems-'))
let restored = 0
try {
  await mkdir('public/audio/anthems', { recursive: true })
  for (const recording of audit.records) {
    if (recording.status !== 'available') continue
    try {
      if (hash(await readFile(recording.path)) === recording.sha256) continue
    } catch {
      /* Restore a missing file only from its curated source. */
    }
    console.log(`Preparando ${recording.countryId}…`)
    const response = await fetch(recording.downloadUrl, {
      headers: {
        'User-Agent':
          'Thomaps/1.0 (https://github.com/Brecori/thomaps; educational atlas)',
      },
      signal: globalThis.AbortSignal.timeout(30_000),
    })
    if (!response.ok)
      throw new Error(
        `${recording.countryId}: HTTP ${response.status}; interrompido, sem tentativas em lote.`,
      )
    const bytes = Buffer.from(await response.arrayBuffer())
    if (hash(bytes) !== recording.downloadSha256)
      throw new Error(
        `${recording.countryId}: a fonte mudou; revise a auditoria antes de atualizar.`,
      )
    const input = join(temporary, 'source.mp3')
    const output = join(temporary, 'output.mp3')
    await writeFile(input, bytes)
    execFileSync('ffmpeg', [
      '-v',
      'error',
      '-y',
      '-i',
      input,
      '-map',
      '0:a:0',
      '-vn',
      '-codec:a',
      'libmp3lame',
      '-b:a',
      '96k',
      '-ar',
      '44100',
      '-ac',
      '2',
      '-map_metadata',
      '-1',
      output,
    ])
    const result = await readFile(output)
    if (hash(result) !== recording.sha256)
      throw new Error(
        `${recording.countryId}: saída diferente; confira a versão do FFmpeg e revise o hash.`,
      )
    await writeFile(recording.path, result)
    restored++
    await delay(1500)
  }
} finally {
  await rm(temporary, { recursive: true, force: true })
}
console.log(`${restored} gravações restauradas; arquivos íntegros preservados.`)
