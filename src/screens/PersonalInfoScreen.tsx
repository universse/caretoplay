import { useActor } from '@xstate/react'

import Icon from 'components/Icon'
import { Text, TextInput, Radio } from 'components/shared'
import { FormService } from 'machines/formMachine'

const AGES = [
  '< 20',
  '20 - 25',
  '26 - 30',
  '31 - 35',
  '36 - 40',
  '41 - 45',
  '46 - 50',
  '51 - 55',
  '56 - 60',
  '61 - 65',
  '> 65',
]

export default function PersonalInfoForm({
  personalInfoService,
}: {
  personalInfoService: FormService
}): JSX.Element {
  const [
    {
      matches,
      context: { fieldValues, fieldErrors },
      value,
    },
    send,
  ] = useActor(personalInfoService)

  const NAME = 'name'

  const handleChange = (e) => {
    if (e.target.type.includes('checkbox')) {
      send({ type: 'change', field: e.target.name, value: e.target.checked })
    } else {
      send({ type: 'change', field: e.target.name, value: e.target.value })
    }
  }

  return (
    <div className='flex flex-col h-100'>
      <form
        className='contents'
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          send('submit')
        }}
      >
        <div className='flex-expand background-brand100 px-16 py-48'>
          <div className='mb-32'>
            <div className='mb-4'>
              <Text
                as='h5'
                className='block serif color-dark fw-800'
                element='label'
                htmlFor={NAME}
              >
                Your name?
              </Text>
            </div>
            <TextInput
              aria-describedby={fieldErrors.name
                ?.map((_, i) => `form-name-error-${i}`)
                .join(' ')}
              aria-invalid={!!fieldErrors.name?.length}
              aria-required
              as='text'
              id={NAME}
              name='name'
              onChange={handleChange}
              placeholder='Or nickname, it’s cool.'
              style={{ height: '3rem' }}
              type='text'
              value={fieldValues.name}
            />
            <div className='mt-8'>
              {fieldErrors.name?.map((error, i) => (
                <Text
                  key={i}
                  as='body2'
                  className='block color-danger500'
                  id={`form-name-error-${i}`}
                >
                  {error}
                </Text>
              ))}
            </div>
          </div>
          <fieldset>
            <div className='mb-4'>
              <Text
                as='h5'
                className='serif color-dark fw-800'
                element='legend'
              >
                Your age?
              </Text>
            </div>
            <div
              className='flex flex-wrap'
              style={{ margin: '0 -0.75rem -0.75rem 0' }}
            >
              {AGES.map((value, i) => {
                const optionId = `age-${i}`

                return (
                  <div
                    key={i}
                    className='mb-12 mr-12'
                    style={{
                      height: '2.5rem',
                      flex: '1 1 calc(26%)',
                    }}
                  >
                    <Radio
                      aria-describedby={fieldErrors.age
                        ?.map((_, i) => `form-age-error-${i}`)
                        .join(' ')}
                      checked={value === fieldValues.age}
                      id={optionId}
                      name='age'
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
              <div
                className='mr-12'
                style={{
                  flex: '1 1 calc(26%)',
                }}
              />
            </div>
            <div className='mt-8'>
              {fieldErrors.age?.map((error, i) => (
                <Text
                  key={i}
                  as='body2'
                  className='block color-danger500'
                  id={`form-age-error-${i}`}
                >
                  {error}
                </Text>
              ))}
            </div>
          </fieldset>
        </div>
        <div
          className='flex justify-end items-center px-16 background-brand100'
          style={{ flex: '0 0 5rem' }}
        >
          <button
            className='flex items-center text-button lowercase color-dark fw-700'
            style={{ height: '3rem' }}
            type='submit'
          >
            Next
            <Icon fill='var(--dark)' icon='chevron-right' size='large' />
          </button>
        </div>
      </form>
    </div>
  )
}
