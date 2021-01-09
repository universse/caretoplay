import Link from 'next/link'

import LetsBegin from 'assets/illustrations/LetsBegin'
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
            <Image
              // alt='Hyatt website'
              src='/assets/gifs/hugging-dark.webp'
            />
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
      <div>
        <a
          className='AspectRatio _16-9 block'
          href='https://www.hyatt.com/en-US/hotel/singapore/andaz-singapore/sinaz/dining'
          rel='noopener noreferrer'
          target='_blank'
        >
          <Image alt='Hyatt website' src='/assets/images/giveaway.webp' />
        </a>
        <div className='background-gray900 px-16 mS:px-32 py-24'>
          <Text
            as='h6'
            className='color-light serif fw-800 uppercase text-center'
            element='p'
          >
            Complete the quiz & stand a chance to
          </Text>
          <Text
            as='h4'
            className='color-brand300 serif fw-800 uppercase text-center'
            element='p'
          >
            win our grand prize
          </Text>
          <Text
            as='h6'
            className='color-light serif fw-800 uppercase text-center'
            element='p'
          >
            A 3D2N stay at Andaz Singapore!
          </Text>
          <Text
            as='body1'
            className='color-light serif fw-800 text-center'
            element='p'
          >
            + Breakfast for 2 at Alley on 25 (worth $880!)
          </Text>
          <Text as='body2' className='color-light text-center' element='p'>
            The lucky draw form can be found at the end of the quiz. Winner will
            be announced and notified on 19 Feburary 2021.
          </Text>
        </div>
      </div>
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
            className='background-gray100 overflow-hidden'
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
