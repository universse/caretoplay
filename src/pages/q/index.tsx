import { useEffect } from 'react'
import { useRouter } from 'next/router'

import { firebaseApp } from 'utils/firebaseApp'
import { CREATED_URL_PARAM } from 'utils/quizUtils'

export default function NewQuizSetPage() {
  const router = useRouter()

  useEffect(() => {
    firebaseApp
      ?.createQuizSet()
      .then((key) =>
        router.replace(`/q/${key}?${CREATED_URL_PARAM}=true`, `/q/${key}`)
      )
  }, [router])

  return null
}
