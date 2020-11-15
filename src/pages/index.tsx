import { useState, useEffect } from 'react'
import Link from 'next/link'
import { get } from 'idb-keyval'

import { FINISHED_QUIZSETS_STORAGE_KEY } from 'utils/quizUtils'
import { restRequest } from 'nodeUtils/restRequest'

export default function IndexPage(): JSX.Element {
  const [isLoading, setIsLoading] = useState(true)
  const [hasFinishedQuizSets, setFinishedQuizSets] = useState(false)

  useEffect(() => {
    get(FINISHED_QUIZSETS_STORAGE_KEY).then((hasFinishedQuizSets) => {
      setIsLoading(false)
      setFinishedQuizSets(!!hasFinishedQuizSets)
    })
    // restRequest('/api/complete', {
    //   body: { quizSetKey: '043DETML8A0S' },
    // })
    //   .then(console.log)
    //   .catch((e) => {
    //     console.log('error')
    //     console.log(e)
    //   })
  }, [])

  return (
    <div>
      <Link href='/q/new'>New quiz</Link>
      {isLoading && <div>spinner</div>}
      {!isLoading && hasFinishedQuizSets && (
        <Link href='/q'>View finished</Link>
      )}
    </div>
  )
}
