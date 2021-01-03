import Image from 'next/image'
import { useActor } from '@xstate/react'

import { Text, TextInput, Checkbox, Radio } from 'components/shared'
import { FormService } from 'machines/formMachine'

const MARITAL_STATUSES = [
  'Single',
  'In a relationship',
  'Cohabiting',
  'Engaged',
  'Married',
  'Divorced',
  'Widowed',
  'Prefer not to say',
]

export default function SubscriptionScreen({
  skipScreen,
  subscriptionService,
}: {
  skipScreen: () => void
  subscriptionService: FormService
}): JSX.Element {
  const [
    {
      matches,
      context: { fieldValues, fieldErrors },
      value,
    },
    send,
  ] = useActor(subscriptionService)

  const handleChange = (e) => {
    if (e.target.type.includes('checkbox')) {
      send({ type: 'change', field: e.target.name, value: e.target.checked })
    } else {
      send({ type: 'change', field: e.target.name, value: e.target.value })
    }
  }

  const maritalStatusField = (
    <fieldset className='mb-32'>
      <div className='mb-4'>
        <Text as='h5' className='serif color-dark fw-800' element='legend'>
          You are...
        </Text>
      </div>
      <div
        className='flex flex-wrap'
        style={{ margin: '0 -0.75rem -0.75rem 0' }}
      >
        {MARITAL_STATUSES.map((value, i) => {
          const optionId = `marital-status-${i}`

          return (
            <div
              key={i}
              className='mb-12 mr-12'
              style={{
                height: '2.5rem',
                flex: '1 1 calc(40%)',
              }}
            >
              <Radio
                aria-describedby={fieldErrors.maritalStatus
                  ?.map((_, i) => `form-marital-status-error-${i}`)
                  .join(' ')}
                checked={value === fieldValues.maritalStatus}
                id={optionId}
                name='maritalStatus'
                onChange={handleChange}
                value={value}
              />
              <label className='text-body1' htmlFor={optionId}>
                {value}
              </label>
            </div>
          )
        })}
      </div>
      <div className='mt-8'>
        {fieldErrors.maritalStatus?.map((error, i) => (
          <Text
            key={i}
            as='body2'
            className='block color-danger500'
            id={`form-marital-status-error-${i}`}
          >
            {error}
          </Text>
        ))}
      </div>
    </fieldset>
  )

  const haveChildrenField = (
    <fieldset className='mb-32'>
      <div className='mb-4'>
        <Text as='h5' className='serif color-dark fw-800' element='legend'>
          You have children?
        </Text>
      </div>
      <div
        className='flex flex-wrap'
        style={{ margin: '0 -0.75rem -0.75rem 0' }}
      >
        {['Yes', 'No'].map((value, i) => {
          const optionId = `have-children-${i}`

          return (
            <div
              key={i}
              className='mb-12 mr-12'
              style={{
                height: '2.5rem',
                flex: '1 1 calc(40%)',
              }}
            >
              <Radio
                aria-describedby={fieldErrors.haveChildren
                  ?.map((_, i) => `form-have-children-error-${i}`)
                  .join(' ')}
                checked={value === fieldValues.haveChildren}
                id={optionId}
                name='haveChildren'
                onChange={handleChange}
                value={value}
              />
              <Text
                as='body1'
                className='color-dark'
                element='label'
                htmlFor={optionId}
              >
                {value}
              </Text>
            </div>
          )
        })}
      </div>
      <div className='mt-8'>
        {fieldErrors.haveChildren?.map((error, i) => (
          <Text
            key={i}
            as='body2'
            className='block color-danger500'
            id={`form-have-children-error-${i}`}
          >
            {error}
          </Text>
        ))}
      </div>
    </fieldset>
  )

  const EMAIL_FIELD_ID = 'email'

  const emailField = (
    <div className='mb-16'>
      <div className='mb-4'>
        <Text
          as='h5'
          className='block serif color-dark fw-800'
          element='label'
          htmlFor={EMAIL_FIELD_ID}
        >
          To contact you if you win!
        </Text>
      </div>
      <TextInput
        aria-describedby={fieldErrors.email
          ?.map((_, i) => `form-email-error-${i}`)
          .join(' ')}
        aria-invalid={!!fieldErrors.email?.length}
        aria-required
        id={EMAIL_FIELD_ID}
        name='email'
        onChange={handleChange}
        placeholder='Enter your email address'
        style={{ height: '3rem' }}
        type='email'
        value={fieldValues.email}
      />
      <div className='mt-8'>
        {fieldErrors.email?.map((error, i) => (
          <Text
            key={i}
            as='body2'
            className='block color-danger500'
            id={`form-email-error-${i}`}
          >
            {error}
          </Text>
        ))}
      </div>
    </div>
  )

  const PDPA_FIELD_ID = 'pdpa'

  const pdpaField = (
    <fieldset className='flex'>
      <Text className='visually-hidden' element='legend'>
        Personal Data Protection Act
      </Text>
      <Checkbox
        aria-describedby={fieldErrors.agreedToPDPA
          ?.map((_, i) => `form-pdpa-error-${i}`)
          .join(' ')}
        checked={fieldValues.agreedToPDPA}
        id={PDPA_FIELD_ID}
        name='agreedToPDPA'
        onChange={handleChange}
        style={{ flex: '0 0 auto' }}
      />
      <div>
        <Text
          as='body1'
          className='block color-dark'
          element='label'
          htmlFor={PDPA_FIELD_ID}
        >
          By submitting this lucky draw entry form, you agree with the
          collection and processing of your personal information by Care to
          Play?, in accordance with the Personal Data Protection Act.
          <br />
          You will be subscribed to our marketing mailing list.
        </Text>
        <div className='mt-4'>
          {fieldErrors.agreedToPDPA?.map((error, i) => (
            <Text
              key={i}
              as='body2'
              className='block color-danger500'
              id={`form-pdpa-error-${i}`}
            >
              {error}
            </Text>
          ))}
        </div>
      </div>
    </fieldset>
  )

  return (
    <div className='flex flex-col h-100'>
      <div className='background-brand900 px-16 py-16'>
        <Text
          as='h5'
          className='color-dark serif fw-800 text-center uppercase'
          element='h1'
        >
          Lucky Draw Entry Form
        </Text>
      </div>
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
            Stand a chance to
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
            Winner will be announced and notified on 19 Feburary 2021.
          </Text>
        </div>
      </div>
      <form
        className='contents'
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          send('submit')
        }}
      >
        <div className='background-brand100 px-16 pt-24'>
          {maritalStatusField}
          {haveChildrenField}
          {emailField}
          {pdpaField}
        </div>
        <div className='background-brand100 px-16'>
          <div className='mx-auto' style={{ width: '64%' }}>
            <div className='AspectRatio _1-1'>
              <Image
                // alt='Hyatt website'
                layout='fill'
                objectFit='cover'
                src={`/assets/gifs/hugging-light.gif`}
              />
            </div>
          </div>
          <Text
            as='h5'
            className='color-dark serif fw-800 text-center'
            element='h1'
          >
            P.S. You only qualify when at least a loved one completes your test!
          </Text>
        </div>
        <div className='background-brand100 px-16 pt-24 pb-48'>
          <div className='mb-16'>
            <button
              className='text-body1 color-dark background-success fw-700 rounded shadow01 px-24 py-16 w-100'
              type='submit'
            >
              Submit lucky draw entry!
            </button>
          </div>
          <button
            className='text-body1 color-dark background-gray100 fw-700 rounded shadow01 px-24 py-16 w-100'
            onClick={skipScreen}
            type='button'
          >
            No thanks.
          </button>
        </div>
      </form>
    </div>
  )
}
