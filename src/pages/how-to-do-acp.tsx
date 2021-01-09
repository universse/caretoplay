import ACPLocations from 'components/ACPLocations'
import Header from 'components/Header'
import Footer from 'components/Footer'
import { Text } from 'components/shared'

export default function HowToDoACPPage() {
  return (
    <div className='flex flex-col h-100'>
      <Header />
      <div className='background-brand100 flex-expand px-16 mS:px-32 py-24'>
        <Text
          as='h4'
          className='color-dark serif fw-800 text-center'
          element='h1'
        >
          How to do my ACP?
        </Text>
        <br />
        <Text className='color-dark' element='p'>
          You can call to book a session with ACP facilitators in their ACP
          nodes at the locations listed below.
          <br />
          <br />
          Each session should last around 45 minutes
        </Text>
        <br />
        <Text
          as='h4'
          className='color-dark serif fw-800 text-center'
          element='h2'
        >
          Where to do my ACP?
        </Text>
        <br />
        <ACPLocations />
      </div>
      <Footer />
    </div>
  )
}
