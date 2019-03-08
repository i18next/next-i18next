import React, {Fragment} from 'react'

import {i18n, Link, withNamespaces} from '../i18n'

import Title from '../components/Title'
import Footer from '../components/Footer'

const HomePage = ({t}) => (
    <Fragment>
        <Title/>
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
        <Footer/>
    </Fragment>
)

HomePage.getInitialProps = () => {
    return {
        namespacesRequired: ['common', 'footer'],
    }
}

export default withNamespaces('common')(HomePage)
