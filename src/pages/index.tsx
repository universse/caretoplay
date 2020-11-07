import { useEffect } from 'react'
import Link from 'next/link'

import restRequest from 'utils/restRequest'

export default function IndexPage() {
  // useEffect(() => {
  //   restRequest('/api/redeem', {
  //     body: { email: 'shjneeulrjch@gmail.com', name: 'Phuoc' },
  //   })
  //     .then(console.log)
  //     .catch((e) => {
  //       console.log('error')
  //       console.log(e)
  //     })
  // }, [])

  return <Link href='/q'>New quiz</Link>
}
