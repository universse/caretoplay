import { useEffect } from 'react'
import { useRouter } from 'next/router'

import { firebaseApp } from 'utils/firebaseApp'

export default function NewQuizPage() {
  const router = useRouter()

  useEffect(() => {
    const key = firebaseApp?.createNewQuiz()

    router.replace('/q/[id]', `/q/${key}`)
  }, [router])

  return null
}
