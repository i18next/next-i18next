import Link from 'next/link'
import type { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import { useTranslation } from 'next-i18next/pages'
import { serverSideTranslations } from 'next-i18next/pages/serverSideTranslations'
import { Footer } from '../components/Footer'

type Props = {
  // Add custom props here
}

const SecondPage = (
  _props: InferGetServerSidePropsType<typeof getServerSideProps>
) => {
  const { t } = useTranslation(['common', 'second-page'])

  return (
    <>
      <main>
        <h2>next-i18next</h2>
        <h1>{t('second-page:h1')}</h1>
        <p style={{ opacity: 0.65, fontStyle: 'italic' }}>Pages Router</p>
        <div>
          <Link href="/">
            <button type="button">{t('second-page:back-to-home')}</button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  locale,
}) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', [
      'second-page',
      'footer',
    ])),
  },
})

export default SecondPage
