import Link from 'next/link'

import LetsBegin from 'assets/illustrations/LetsBegin'
import Giveaway from 'components/Giveaway'
import Footer from 'components/Footer'
import Header from 'components/Header'
import Hero from 'components/Hero'
import { Image, Text, Button } from 'components/shared'

export default function IndexPage(): JSX.Element {
  return (
    <div>
      <Header />
      <Hero />
      <div className='flex background-gray900 pr-16 mS:pr-32 py-24 items-center'>
        <div style={{ flex: '0 0 40%' }}>
          <div className='AspectRatio _1-1'>
            <Image alt='' src='/assets/gifs/hugging-dark.gif' />
          </div>
        </div>
        <div>
          <Text as='h4' className='serif color-brand100 fw-800' element='h2'>
            How well do you think you know your loved one?
          </Text>
          <Text as='body2' className='color-brand100 fw-400' element='p'>
            Take this quiz to find out!
            <br />
            (You may even discover new surprises!)
          </Text>
        </div>
      </div>
      <Giveaway
        message1={
          <>
            Complete the quiz
            <br />& stand a chance to
          </>
        }
        message2='The lucky draw form can be found at the end of the quiz. Winner will
            be announced and notified on 19 Feburary 2021.'
      />
      <div className='flex flex-col items-center px-16 mS:px-32 pt-32 pb-64 background-brand900 overflow-hidden'>
        <Text
          as='h5'
          className='serif color-dark fw-800 text-center'
          element='h3'
        >
          Are you ready?
        </Text>
        <Text as='body2' className='color-dark fw-400 text-center' element='p'>
          Remember, you can customise your answers!
          <br />
          (You may even add in some tricks to <strong>really</strong> test your
          loved ones!)
        </Text>
        <div style={{ flex: '0 0 1.5rem' }} />
        <Link href='/q/new' passHref>
          <Button
            className='background-gray100'
            element='a'
            style={{ height: '3rem', width: '10rem' }}
          >
            Let's Begin!
          </Button>
        </Link>
        <div
          className='absolute'
          style={{
            width: '12rem',
            left: 'calc(50% + 4.5rem)',
            bottom: '-2.5rem',
          }}
        >
          <LetsBegin />
        </div>
      </div>
      <Footer />
    </div>
  )
}
