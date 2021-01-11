import Link from 'next/link'

export default function Header() {
  const linkClassName = 'color-brand100 serif text-body2 fw-800'

  return (
    <header className='sticky top-0' style={{ zIndex: 100 }}>
      <nav
        className='flex items-center justify-between background-gray900 px-16 mS:px-32 shadow02'
        style={{ height: '2.5rem' }}
      >
        <Link href='/what-is-acp'>
          <a className={linkClassName}>What is ACP?</a>
        </Link>
        <Link href='/how-to-do-acp'>
          <a className={linkClassName}>How to do ACP?</a>
        </Link>
        <Link href='/about'>
          <a className={linkClassName}>About us</a>
        </Link>
      </nav>
    </header>
  )
}
