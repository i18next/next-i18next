import PropTypes from 'prop-types'
import { withTranslation, Link } from '../i18n'
import Header from '../components/Header'
import Footer from '../components/Footer'

const SecondPage = ({ t, i18n }) => (
  <>
    <main>
      <Header title={t('h1')} subTitle={t('current-lang', { lang: i18n.language })}/>
      <Link href='/'>
        <button
          type='button'
        >
          {t('back-to-home')}
        </button>
      </Link>
    </main>
    <Footer />
  </>
)

SecondPage.getInitialProps = async () => ({
  namespacesRequired: ['second-page', 'footer'],
})

SecondPage.propTypes = {
  t: PropTypes.func.isRequired,
}

export default withTranslation('second-page')(SecondPage)
