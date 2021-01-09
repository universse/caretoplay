import Link from 'next/link'
import Image from 'next/image'

import { Text } from 'components/shared'

export default function Congratulations() {
  return (
    <div>
      <div className='px-16 mS:px-32 pb-24'>
        <div className='mx-auto' style={{ width: '64%' }}>
          <div className='AspectRatio _1-1'>
            <Image
              // alt='Hyatt website'
              layout='fill'
              objectFit='cover'
              src={`/assets/gifs/congrats.gif`}
            />
          </div>
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
        </Text>
      </div>
      <div className='background-brand900 px-16 mS:px-32 py-24'>
        <Text className='color-dark text-center serif fw-800' element='p'>
          Life is unpredictable.
          <br />
          If one day you are unable to speak for yourself, who would you appoint
          to represent your wishes?
          <br />
          <br />I would nominate ________ to speak up for me.
        </Text>
      </div>
    </div>
  )
}
