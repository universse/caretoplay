import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { get } from 'idb-keyval'

import { firebaseApp } from 'utils/firebaseApp'
import {
  CREATED_URL_PARAM,
  PERSISTED_URL_PARAM,
  STORAGE_KEY,
} from 'utils/quizUtils'

export default function NewQuizSetPage() {
  const router = useRouter()

  useEffect(() => {
    async function createQuizSet() {
      const persistedQuizSet = await get(STORAGE_KEY)
      const quizSetKey = persistedQuizSet?.quizSetKey

      if (quizSetKey) {
        router.replace(
          `/q/${quizSetKey}?${PERSISTED_URL_PARAM}=true`,
          `/q/${quizSetKey}`
        )
      } else {
        const quizSetKey = await firebaseApp?.createQuizSet()

        router.replace(
          `/q/${quizSetKey}?${CREATED_URL_PARAM}=true`,
          `/q/${quizSetKey}`
        )
      }
    }

    createQuizSet()
  }, [router])

  return null
}
