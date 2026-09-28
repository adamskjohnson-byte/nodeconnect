import networkGraphic from '../assets/network-graphic.svg'
import { useAppTranslation } from '../lib/i18n'

export default function Hero() {
  const t = useAppTranslation()
  return <section className="hero section" id="top"><div className="hero-copy"><h1>{t('home.heroTitle')}</h1><p>{t('home.heroDescription')}</p></div><img className="network-art" src={networkGraphic} alt="" aria-hidden="true" /></section>
}