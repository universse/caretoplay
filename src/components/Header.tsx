import Link from 'next/link'

export default function Header() {
  const linkClassName = 'color-brand100 serif text-body2 fw-800'

  return (
    <header>
      <nav
        className='flex items-center justify-between background-gray900 px-16 mS:px-32 shadow02'
        style={{ height: '2.5rem', zIndex: 100 }}
      >
        <Link href='/what-is-acp'>
          <a className={linkClassName}>What is ACP?</a>
        </Link>
        <Link href='/how-to-do-acp'>
          <a className={linkClassName}>How to do my ACP?</a>
        </Link>
        <Link href='/about'>
          <a className={linkClassName}>About us</a>
        </Link>
      </nav>
    </header>
  )
}
