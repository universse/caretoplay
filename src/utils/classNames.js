export function classNames() {
  const classes = []
  const length = arguments.length
  for (let i = 0; i < length; i++) {
    !!arguments[i] && classes.push(arguments[i])
  }
  return classes.join(' ')
}
