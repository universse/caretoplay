import LetsBegin from 'assets/illustrations/LetsBegin'
import Footer from 'components/Footer'
import Header from 'components/Header'
import Hero from 'components/Hero'
import { Button, Text, Image } from 'components/shared'

export default function LandingScreen({ name, nextStep }: {}): JSX.Element {
  return (
    <div>
      <Header />
      <Hero />
      <div className='background-gray900 px-16 mS:px-32 py-24'>
        <div className='mx-auto' style={{ width: '64%' }}>
          <div className='AspectRatio _1-1'>
            <Image alt='' src='/assets/gifs/hugging-dark.gif' />
          </div>
        </div>
        <div>
          <Text
            as='h4'
            className='serif color-brand100 fw-800 text-center'
            element='h2'
          >
            Guess what {name} would choose!
          </Text>
          <Text
            as='body2'
            className='color-brand100 fw-400 text-center'
            element='p'
          >
            Get {name} to sit beside you, we promise it’ll be fun!
          </Text>
        </div>
      </div>
      <div className='flex flex-col items-center px-16 mS:px-32 pt-32 pb-64 background-brand900 overflow-hidden'>
        <Text
          as='h5'
          className='serif color-dark fw-800 text-center'
          element='h3'
        >
          Ready?
        </Text>
        <div style={{ flex: '0 0 0.5rem' }} />
        <Button
          className='background-gray100'
          onClick={nextStep}
          style={{ height: '3rem', width: '10rem' }}
          type='button'
        >
          Let's Begin!
        </Button>
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
