type SoundName = 'click' | 'toggle' | 'success' | 'copy'
type Tone = { frequency: number; duration: number; delay?: number }

let enabled = true
let volume = 70
let audioContext: AudioContext | null = null
let currentClickEvent: Event | null = null
let interactionsInstalled = false
const explicitlyHandledClicks = new WeakSet<Event>()

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
  if (currentClickEvent) explicitlyHandledClicks.add(currentClickEvent)
  if (!enabled || volume === 0 || typeof window === 'undefined') return
  const AudioContextConstructor = window.AudioContext
  if (!AudioContextConstructor) return

  try {
    audioContext ??= new AudioContextConstructor()
    const context = audioContext
    void context.resume().then(() => {
      if (!enabled || volume === 0) return
      const patterns: Record<SoundName, Tone[]> = {
        click: [{ frequency: 520, duration: 0.035 }],
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

export function installGlobalSoundInteractions(): void {
  if (interactionsInstalled || typeof document === 'undefined') return
  interactionsInstalled = true

  const markClickEvent = (event: Event) => {
    currentClickEvent = event
    queueMicrotask(() => {
      if (currentClickEvent === event) currentClickEvent = null
    })
  }

  const playForAction = (event: MouseEvent) => {
    const target = event.target instanceof Element ? event.target : null
    const control = target?.closest('button, a[href], select, input[type="button"], input[type="submit"], input[type="reset"], input[type="checkbox"], input[type="radio"], input[type="range"], [role="button"], [role="tab"], [role="switch"], [role="checkbox"], [role="radio"], [role="menuitem"], [data-sound-interaction]')
    if (!control || control instanceof HTMLButtonElement && control.disabled || control.getAttribute('aria-disabled') === 'true') return
    if (control.getAttribute('data-sound-interaction') === 'managed' || control.getAttribute('data-sound-interaction') === 'copy') return
    if (explicitlyHandledClicks.has(event)) return
    playUiSound('click')
  }

  document.addEventListener('click', markClickEvent, true)
  document.addEventListener('click', playForAction)
}