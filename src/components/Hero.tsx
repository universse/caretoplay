import HeroImage from 'assets/illustrations/HeroImage'
import { Text } from 'components/shared'

export default function Hero(): JSX.Element {
  return (
    <div
      className='px-16 mS:px-32 pt-48 pb-32 background-brand200 background-no-repeat background-center'
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
        An introduction to
        <br />
        Advance Care Planning (ACP)
      </Text>
    </div>
  )
}
