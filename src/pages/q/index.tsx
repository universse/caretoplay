import { useState, useEffect } from 'react'
import Link from 'next/link'
import { get } from 'idb-keyval'

import { FINISHED_QUIZSETS_STORAGE_KEY } from 'utils/quizUtils'

export default function QuizPage(): JSX.Element {
  const [isLoading, setIsLoading] = useState(true)
  const [finishedQuizSets, setFinishedQuizSets] = useState([])

  useEffect(() => {
    get(FINISHED_QUIZSETS_STORAGE_KEY).then((finishedQuizSets) => {
      setIsLoading(false)
      setFinishedQuizSets(Object.entries(finishedQuizSets || {}))
    })
  }, [])

  return (
    <div>
      <Link href='/q/new'>
        <a>New quiz</a>
      </Link>
      {isLoading && <div>spinner</div>}
      <ul>
        {!isLoading &&
          finishedQuizSets.map(([quizSetKey, name]) => (
            <li key={quizSetKey}>
              <Link href={`/q/${quizSetKey}`}>
                <a>{name}'s quiz</a>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  )
}
