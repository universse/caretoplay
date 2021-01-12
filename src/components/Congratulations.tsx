import { Image, Text } from 'components/shared'

export default function Congratulations() {
  return (
    <div>
      <div className='px-16 mS:px-32 pt-16 pb-24'>
        <div className='AspectRatio _16-9'>
          <Image alt='' src='/assets/gifs/congrats.webp' />
        </div>
        <div className='mb-4'>
          <Text
            as='h4'
            className='color-dark serif fw-800 text-center'
            element='h1'
          >
            Congratulations!
          </Text>
        </div>
        <Text className='color-dark text-center' element='p'>
          What you’ve just went through was a short introduction to Advance Care
          Planning (ACP)!
          <br />
          <br />
          These quiz questions are designed to help you reflect on your values &
          preferences, which will guide the healthcare team and your loved ones
          to make better healthcare decisions on your behalf.
        </Text>
      </div>
      <div className='background-brand900 px-16 mS:px-32 py-24'>
        <Text className='color-dark text-center serif fw-800' element='p'>
          Life is unpredictable.
          <br />
          If one day you are unable to speak for yourself, who would you appoint
          to represent your wishes?
        </Text>
      </div>
    </div>
  )
}
