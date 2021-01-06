import Image from 'next/image'

import { Text } from 'components/shared'

export default function Giveaway() {
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
          src={`/assets/images/giveaway.jpg`}
        />
      </a>
      <div className='background-gray900 px-16 py-24'>
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
          + Breakfast for 2 at Alley on 25 (worth $880!).
        </Text>
        <Text as='body2' className='color-light text-center' element='p'>
          The lucky draw form can be found at the end of the quiz. Winner will
          be announced and notified on 19 Feburary 2021.
        </Text>
      </div>
    </div>
  )
}