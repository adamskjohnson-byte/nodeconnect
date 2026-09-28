import { useAppTranslation } from '../lib/i18n'

export default function OfficialReception() {
  const t = useAppTranslation()
  return (
    <section className="official-reception" aria-labelledby="official-reception-title">
      <p id="official-reception-title" className="official-reception-label">{t('home.officialReception')}</p>
      <div className="official-reception-inner">
        <p className="official-reception-copy">{t('home.emailForInformation')}</p>
        <a
          className="official-reception-email"
          href="mailto:coinbureau940@gmail.com"
          aria-label={t('home.receptionEmailLabel', { email: 'coinbureau940@gmail.com' })}
        >
          coinbureau940@gmail.com
        </a>
      </div>
    </section>
  )
}
