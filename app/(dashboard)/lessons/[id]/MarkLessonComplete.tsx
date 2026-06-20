'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

interface Props {
  lessonId: string
  userId: string
  isCompleted: boolean
}

export default function MarkLessonComplete({ lessonId, userId, isCompleted }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(isCompleted)

  async function handleComplete() {
    setLoading(true)
    const supabase = createClient()

    await supabase.from('user_progress').upsert({
      user_id: userId,
      lesson_id: lessonId,
      completed: true,
      completed_at: new Date().toISOString(),
    })

    setDone(true)
    setLoading(false)
    router.refresh()
  }

  if (done) {
    return (
      <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-50 border border-green-200 text-green-700 rounded-lg font-medium">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        Leçon complétée
      </div>
    )
  }

  return (
    <Button className="flex-1" size="lg" onClick={handleComplete} loading={loading}>
      Marquer comme terminée
    </Button>
  )
}
