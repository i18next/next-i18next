import React, {Fragment} from 'react'

import {withNamespaces, Link} from '../i18n'


const SecondPage = ({t}) => (
    <Fragment>
        <h1>{t('h1')}</h1>
        <Link href='/'>
            <button
                type='button'
            >
                {t('back-to-home')}
            </button>
        </Link>
    </Fragment>
)

SecondPage.getInitialProps = () => {
    return {
        namespacesRequired: ['second-page'],
    }
}

export default withNamespaces('second-page')(SecondPage)
