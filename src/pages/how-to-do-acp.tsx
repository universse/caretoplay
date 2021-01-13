import Link from 'next/link'

import Icon from 'components/Icon'
import ACPLocations from 'components/ACPLocations'
import Header from 'components/Header'
import Footer from 'components/Footer'
import { Button, Text } from 'components/shared'

export default function HowToDoACPPage() {
  return (
    <div className='flex flex-col h-100'>
      <Header />
      <div className='background-brand100 flex-expand px-16 mS:px-32 pt-32 pb-64'>
        <Text
          as='h4'
          className='color-dark serif fw-800 text-center'
          element='h1'
        >
          How to do ACP?
        </Text>
        <br />
        <Text className='color-dark' element='p'>
          An Advance Care Planning (ACP) facilitator is a trained healthcare
          professional that will guide you in your ACP process. You can call to
          book a session with ACP facilitators in their ACP nodes at the
          locations listed below.
          <br />
          <br />
          Your preferences will be documented and your ACP will be tagged to
          your National Electronic Health Record that can be accessed by the
          healthcare team when neccessary.
        </Text>
        <br />
        <Text
          as='h4'
          className='color-dark serif fw-800 text-center'
          element='h2'
        >
          Where to do ACP?
        </Text>
        <br />
        <ACPLocations shouldShowPhoneNumber />
        <div className='mt-48 flex justify-center'>
          <Link href='/' passHref>
            <Button
              className='background-gray100 lowercase'
              element='a'
              style={{ height: '3.5rem' }}
            >
              <Icon icon='arrow-left' size='large' />
              &nbsp;&nbsp;&nbsp;Back to home
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
