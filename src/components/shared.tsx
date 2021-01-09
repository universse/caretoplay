import { forwardRef } from 'react'
import { classNames } from 'utils/classNames'

export function Image(props) {
  return (
    <div className='ImageWrapper'>
      <img decoding='async' {...props} />
    </div>
  )
}

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

export const Button = forwardRef(function (
  {
    element: E = 'button',
    // as = 'body1',
    className,
    ...props
  },
  ref
): JSX.Element {
  return (
    <E
      ref={ref}
      className={classNames(
        'flex justify-center items-center text-body1 color-dark fw-700 rounded shadow01 px-24 py-16',
        // `text-${as}`,
        className
      )}
      {...props}
    />
  )
})

export function Checkbox(props) {
  return <input className='Checkbox' type='checkbox' {...props} />
}

export function Radio(props) {
  return <input className='Radio visually-hidden' type='radio' {...props} />
}
