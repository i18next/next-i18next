import PropTypes from 'prop-types'
import { Link, withTranslation } from '../i18n'
import Header from '../components/Header'
import Footer from '../components/Footer'

const Homepage = ({ t, i18n }) => (
  <>
    <main>
      <Header title={t('h1')} subTitle={t('current-lang', { lang: i18n.language })}/>
      <div>
        <button
          type='button'
          onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'de' : 'en')}
        >
          {t('change-locale')}
        </button>
        <Link href='/second-page'>
          <button
            type='button'
          >
            {t('to-second-page')}
          </button>
        </Link>
      </div>
    </main>
    <Footer />
  </>
)

Homepage.getInitialProps = async () => ({
  namespacesRequired: ['common', 'footer'],
})

Homepage.propTypes = {
  t: PropTypes.func.isRequired,
}

export default withTranslation('common')(Homepage)
