import Header from 'components/Header'
import Footer from 'components/Footer'

import { Text } from 'components/shared'

export default function WhatIsACPPage() {
  return (
    <div className='flex flex-col h-100'>
      <Header />
      <div className='background-brand100 flex-expand px-16 mS:px-32 py-24'>
        <Text
          as='h4'
          className='color-dark serif fw-800 text-center'
          element='h1'
        >
          What is ACP?
        </Text>
        <br />
        <Text className='color-dark' element='p'>
          Advance care planning (ACP) is for everyone, regardless of age or
          state of health.
          <br />
          <br />
          A general ACP guides you to reflect your values and personal beliefs
          when facing end-of-life. It will also help you identify and appoint a
          Nominated Healthcare Spokesperson (NHS).
          <br />
          <br />
          In the event that you lose the capacity to make decisions on your own,
          and are unable to communicate your wishes, your NHS will assist the
          healthcare team in making healthcare decisions on your behalf.
          <br />
          <br />
          ACP is tagged onto your National Electronic Health Record (NEHR)
          across all hospitals in Singapore for healthcare teams to access in
          case of an emergency.
          <br />
          <br />
          By voicing out and documenting your preferences now, you can ease the
          stress of decision-making for your loved ones should anything happen
          to you in future.
          <br />
          <br />
          We encourage you to have open conversations about your wishes and
          goals for care. It is never too early to start, so take some time to
          talk to your parents and loved ones about their end-of-life plans
          today.
        </Text>
      </div>
      <Footer />
    </div>
  )
}
