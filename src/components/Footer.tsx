import Icon from 'components/Icon'

export default function Footer() {
  return (
    <footer>
      <div
        className='flex items-center justify-center background-gray900 px-16 mS:px-32'
        style={{ height: '2.5rem' }}
      >
        <a
          className='flex color-brand100 text-caption'
          href='https://www.instagram.com/caretoplay.sg/'
          rel='noopener noreferrer'
          target='_blank'
        >
          <Icon fill='var(--brand100)' icon='instagram' size='medium' />
          @caretoplay.sg
        </a>
        <div style={{ flex: '0 0 1rem' }} />
        <a
          className='flex color-brand100 text-caption'
          href='mailto:caretoplay.sg@gmail.com'
        >
          <Icon fill='var(--brand100)' icon='mail' size='medium' />
          caretoplay.sg@gmail.com
        </a>
      </div>
    </footer>
  )
}
