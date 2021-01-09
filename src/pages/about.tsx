import HeroImage from 'assets/illustrations/HeroImage'
import Header from 'components/Header'
import Footer from 'components/Footer'
import { Text } from 'components/shared'

export default function AboutPage() {
  return (
    <div className='flex flex-col h-100'>
      <Header />
      <div className='background-brand100 flex-expand px-16 mS:px-32 py-24'>
        <Text
          as='h4'
          className='color-dark serif fw-800 text-center'
          element='h1'
        >
          Our Story
        </Text>
        <br />
        <div className='AspectRatio mx-auto' style={{ width: '64%' }}>
          <HeroImage />
        </div>
        <br />
        <Text className='color-dark' element='p'>
          Care to Play? started out as a final-year thesis project in NUS
          Division of Industrial Design. Over the last 5 months, it has grown
          into a social cause aiming to raise awareness about Advance Care
          Planning (ACP).
          <br />
          <br />
          Our mission is to normalize conversations surrounding end-of-life
          plans. We hope that by providing a fun and interactive platform to
          introduce ACP to our audience, we can abolish the taboo of speaking
          about end-of-life care in future generations.
        </Text>
      </div>
      <Footer />
    </div>
  )
}
