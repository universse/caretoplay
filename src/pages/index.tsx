import { useState, useEffect } from 'react'
import Link from 'next/link'
import { get, set } from 'idb-keyval'

import { FINISHED_QUIZSETS_STORAGE_KEY } from 'utils/quizUtils'

export default function IndexPage(): JSX.Element {
  const [isLoading, setIsLoading] = useState(true)
  const [hasFinishedQuizSets, setFinishedQuizSets] = useState(false)

  useEffect(() => {
    async function getFinishedQuizSets() {
      const finishedQuizSets = await get(FINISHED_QUIZSETS_STORAGE_KEY)

      if (finishedQuizSets) {
        for (const key of Object.keys(finishedQuizSets)) {
          if (typeof finishedQuizSets[key] === 'string') {
            finishedQuizSets[key] = { name: finishedQuizSets[key] }
          }
        }

        await set(FINISHED_QUIZSETS_STORAGE_KEY, finishedQuizSets)
      }

      setIsLoading(false)
      setFinishedQuizSets(!!finishedQuizSets)
    }

    getFinishedQuizSets()
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
