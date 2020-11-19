import { useState, useEffect } from 'react'
import Link from 'next/link'
import { get } from 'idb-keyval'

import { FINISHED_QUIZSETS_STORAGE_KEY } from 'utils/quizUtils'

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
      <Link href='/q/new'>
        <a>New quiz</a>
      </Link>
      {isLoading && <div>spinner</div>}
      {!isLoading && hasFinishedQuizSets && (
        <Link href='/q'>
          <a>View finished</a>
        </Link>
      )}
    </div>
  )
}
