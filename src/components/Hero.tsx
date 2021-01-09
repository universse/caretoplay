import HeroImage from 'assets/illustrations/HeroImage'
import { Text } from 'components/shared'

export default function Hero(): JSX.Element {
  return (
    <div
      className='px-16 pt-48 pb-24 background-brand200 background-no-repeat background-center'
      style={{
        backgroundImage: 'url(/assets/svgs/sun.svg)',
      }}
    >
      <div className='AspectRatio mx-auto' style={{ width: '75%' }}>
        <HeroImage />
      </div>
      <br />
      <Text
        as='h6'
        className='serif color-dark fw-800 text-center'
        element='h1'
      >
        An introduction to Advance Care Planning (ACP)
      </Text>
    </div>
  )
}
