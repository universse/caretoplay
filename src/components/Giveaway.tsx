import Image from 'next/image'
import { Text } from 'components/shared'

export default function Giveaway({ message1, message2 }) {
  return (
    <div>
      <a
        className='AspectRatio _16-9 block'
        href='https://www.hyatt.com/en-US/hotel/singapore/andaz-singapore/sinaz/dining'
        rel='noopener noreferrer'
        target='_blank'
      >
        <Image
          alt='Hyatt website'
          layout='fill'
          objectFit='cover'
          src='/assets/images/giveaway.jpg'
        />
      </a>
      <div className='background-gray900 px-16 mS:px-32 py-32'>
        <Text
          as='h6'
          className='color-light serif fw-800 uppercase text-center'
          element='p'
        >
          {message1}
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
          className='color-light serif fw-800 text-center opacity-80'
          element='p'
        >
          + Breakfast for 2 at Alley on 25 (worth $880!)
        </Text>
        <div className='mt-4'>
          <Text
            as='body2'
            className='color-light text-center opacity-80'
            element='p'
          >
            {message2}
          </Text>
        </div>
      </div>
    </div>
  )
}
