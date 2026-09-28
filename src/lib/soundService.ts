type SoundName = 'toggle' | 'success' | 'copy'
type Tone = { frequency: number; duration: number; delay?: number }

let enabled = true
let volume = 70
let audioContext: AudioContext | null = null

try {
  const stored = localStorage.getItem('nodeconnect_preferences')
  if (stored) {
    const preferences = JSON.parse(stored) as { sound_enabled?: boolean; sound_volume?: number }
    if (typeof preferences.sound_enabled === 'boolean') enabled = preferences.sound_enabled
    if (typeof preferences.sound_volume === 'number') volume = Math.max(0, Math.min(100, preferences.sound_volume))
  }
} catch {
  // Use local defaults when browser storage is unavailable.
}

export function setSoundPreferences(soundEnabled: boolean, soundVolume: number): void {
  enabled = soundEnabled
  volume = Math.max(0, Math.min(100, soundVolume))
}

export function playUiSound(name: SoundName): void {
  if (!enabled || volume === 0 || typeof window === 'undefined') return
  const AudioContextConstructor = window.AudioContext
  if (!AudioContextConstructor) return

  try {
    audioContext ??= new AudioContextConstructor()
    const context = audioContext
    void context.resume().then(() => {
      if (!enabled || volume === 0) return
      const patterns: Record<SoundName, Tone[]> = {
        toggle: [{ frequency: 590, duration: 0.055 }],
        success: [{ frequency: 660, duration: 0.075 }, { frequency: 880, duration: 0.09, delay: 0.07 }],
        copy: [{ frequency: 760, duration: 0.045 }, { frequency: 1040, duration: 0.06, delay: 0.045 }],
      }
      const startedAt = context.currentTime
      const masterVolume = (volume / 100) * 0.045
      for (const tone of patterns[name]) {
        const start = startedAt + (tone.delay || 0)
        const oscillator = context.createOscillator()
        const gain = context.createGain()
        oscillator.type = 'sine'
        oscillator.frequency.setValueAtTime(tone.frequency, start)
        gain.gain.setValueAtTime(0.0001, start)
        gain.gain.exponentialRampToValueAtTime(masterVolume, start + 0.012)
        gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.duration)
        oscillator.connect(gain)
        gain.connect(context.destination)
        oscillator.start(start)
        oscillator.stop(start + tone.duration + 0.01)
      }
    }).catch(() => undefined)
  } catch {
    // Optional UI audio must not interrupt an account action.
  }
}