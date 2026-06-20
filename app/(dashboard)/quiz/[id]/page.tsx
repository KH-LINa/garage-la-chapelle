import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { QuizQuestion } from '@/lib/types'
import QuizClient from './QuizClient'

export default async function QuizPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*, lessons(id, title, module_id, modules(id, title))')
    .eq('id', params.id)
    .single()

  if (!quiz) notFound()

  const questions = quiz.questions as unknown as QuizQuestion[]
  const lesson = quiz.lessons as {
    id: string
    title: string
    module_id: string
    modules: { id: string; title: string } | null
  } | null

  return (
    <QuizClient
      quiz={{ id: quiz.id, title: quiz.title, passing_score: quiz.passing_score }}
      questions={questions}
      lesson={lesson}
      userId={user!.id}
    />
  )
}
