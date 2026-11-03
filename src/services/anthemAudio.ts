/** Called only from an explicit playback action; never during catalog loading. */
export function createAnthemAudio() {
  const audio = new Audio()
  if (!audio.canPlayType('audio/mpeg')) throw new Error('unsupported')
  audio.preload = 'none'
  return audio
}
