import { useEffect, useRef, useState } from 'react'
import whitepaper1 from '../assets/whitepaper/whitepaper-1.jpeg'
import whitepaper2 from '../assets/whitepaper/whitepaper-2.jpeg'
import whitepaper3 from '../assets/whitepaper/whitepaper-3.jpeg'
import whitepaper4 from '../assets/whitepaper/whitepaper-4.jpeg'
import whitepaper5 from '../assets/whitepaper/whitepaper-5.jpeg'
import whitepaper6 from '../assets/whitepaper/whitepaper-6.jpeg'
import whitepaper7 from '../assets/whitepaper/whitepaper-7.jpeg'
import whitepaper8 from '../assets/whitepaper/whitepaper-8.jpeg'
import './whitepaper-carousel.css'

const autoplayDelay = 5600

const slides = [
  { src: whitepaper1, title: 'White Paper cover', alt: 'NodeConnect White Paper cover introducing the CNPY network, token, and use cases' },
  { src: whitepaper2, title: 'Problem and vision', alt: 'White Paper page 2: Problem and Vision, core objectives, and the non-custodial security principle' },
  { src: whitepaper3, title: 'Protocol architecture', alt: 'White Paper page 3: Protocol Architecture, Wallet ID and Session ID model, and initial target chains' },
  { src: whitepaper4, title: 'Node security and vesting', alt: 'White Paper page 4: Node Security, Validation and Vesting, including the funded-node lifecycle' },
  { src: whitepaper5, title: 'Tokenomics and burn mechanism', alt: 'White Paper page 5: Tokenomics, proposed burn formula, funded-wallet tiers, and supply-reduction logic' },
  { src: whitepaper6, title: 'Wallet security and meme intelligence', alt: 'White Paper page 6: Wallet Security, Meme Intelligence, potential indicators, and anti-rug principle' },
  { src: whitepaper7, title: 'Roadmap to January 2027', alt: 'White Paper page 7: Roadmap phases, governance, transparency, and key feature summary' },
  { src: whitepaper8, title: 'Technical specification and risks', alt: 'White Paper page 8: Technical Specification, Risks, launch conditions, and disclaimer' },
]

type SwipeStart = { x: number; y: number }

export default function WhitePaperCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [interactionVersion, setInteractionVersion] = useState(0)
  const swipeStart = useRef<SwipeStart | null>(null)
  const activeSlide = slides[activeIndex]

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReducedMotion(mediaQuery.matches)
    updatePreference()
    mediaQuery.addEventListener('change', updatePreference)
    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  useEffect(() => {
    if (reducedMotion) return
    const timer = window.setTimeout(() => {
      setActiveIndex((index) => (index + 1) % slides.length)
    }, autoplayDelay)
    return () => window.clearTimeout(timer)
  }, [activeIndex, interactionVersion, reducedMotion])

  const showSlide = (index: number) => {
    setActiveIndex((index + slides.length) % slides.length)
    setInteractionVersion((version) => version + 1)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      showSlide(activeIndex - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      showSlide(activeIndex + 1)
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return
    swipeStart.current = { x: event.clientX, y: event.clientY }
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = swipeStart.current
    swipeStart.current = null
    if (!start) return

    const deltaX = event.clientX - start.x
    const deltaY = event.clientY - start.y
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return
    showSlide(activeIndex + (deltaX < 0 ? 1 : -1))
  }

  return (
    <section
      className="whitepaper-carousel"
      aria-label="NodeConnect White Paper"
      aria-roledescription="carousel"
      onKeyDown={handleKeyDown}
    >
      <div className="whitepaper-label">NODECONNECT WHITE PAPER</div>
      <div className="whitepaper-frame">
        <div
          className="whitepaper-viewport"
          role="group"
          aria-roledescription="slide"
          aria-label={`Page ${activeIndex + 1} of ${slides.length}: ${activeSlide.title}`}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => { swipeStart.current = null }}
        >
          <img
            key={activeSlide.src}
            src={activeSlide.src}
            alt={activeSlide.alt}
            width="764"
            height="1080"
            loading="eager"
            decoding="async"
            draggable="false"
          />
        </div>
      </div>
      <div className="whitepaper-controls">
        <button
          className="whitepaper-arrow"
          type="button"
          aria-label="Previous White Paper page"
          onClick={() => showSlide(activeIndex - 1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 5-7 7 7 7" /></svg>
        </button>
        <div className="whitepaper-pagination" aria-label="White Paper pages">
          {slides.map((slide, index) => (
            <button
              className={`whitepaper-dot${index === activeIndex ? ' is-active' : ''}`}
              key={slide.src}
              type="button"
              aria-label={`Go to White Paper page ${index + 1}: ${slide.title}`}
              aria-current={index === activeIndex ? 'true' : undefined}
              onClick={() => showSlide(index)}
            />
          ))}
        </div>
        <button
          className="whitepaper-arrow"
          type="button"
          aria-label="Next White Paper page"
          onClick={() => showSlide(activeIndex + 1)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 5 7 7-7 7" /></svg>
        </button>
      </div>
      <span className="whitepaper-page-count" aria-hidden="true">
        {String(activeIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </span>
    </section>
  )
}