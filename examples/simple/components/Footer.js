import PropTypes from 'prop-types'
import { version } from 'next-i18next/package.json'
import { withTranslation } from 'next-i18next'

const Footer = ({ t }) => (
  <footer>
    <p>
      {t('description')}
    </p>
    <p>
      next-i18next v
      {version}
    </p>
  </footer>
)

Footer.propTypes = {
  t: PropTypes.func.isRequired,
}

export default withTranslation('footer')(Footer)
