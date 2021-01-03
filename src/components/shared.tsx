import { classNames } from 'utils/classNames'

export function TextInput(props) {
  return (
    <input
      autoComplete='off'
      className='text-body1 color-dark rounded shadow01 px-24 w-100'
      {...props}
    />
  )
}

export function Text({
  element: E = 'span',
  as = 'body1',
  className,
  ...props
}): JSX.Element {
  return <E className={classNames(`text-${as}`, className)} {...props} />
}

export function Checkbox(props) {
  return <input className='Checkbox' type='checkbox' {...props} />
}

export function Radio(props) {
  return <input className='Radio visually-hidden' type='radio' {...props} />
}

export function Button(props) {
  return <button type='button' {...props} />
}
