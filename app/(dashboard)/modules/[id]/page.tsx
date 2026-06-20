import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import ProgressBar from '@/components/ProgressBar'

export default async function ModulePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: module }, { data: progress }] = await Promise.all([
    supabase
      .from('modules')
      .select('*, lessons(*, quizzes(id))')
      .eq('id', params.id)
      .eq('is_published', true)
      .single(),
    supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user!.id),
  ])

  if (!module) notFound()

  const completedIds = new Set(progress?.filter((p) => p.completed).map((p) => p.lesson_id) ?? [])
  const lessons = module.lessons ?? []
  const done = lessons.filter((l: { id: string }) => completedIds.has(l.id)).length

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 flex items-center gap-2">
        <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{module.title}</span>
      </nav>

      {/* Module header */}
      <Card>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{module.title}</h1>
        <p className="text-gray-600 mb-4">{module.description}</p>
        <ProgressBar value={done} max={lessons.length || 1} label={`${done} / ${lessons.length} leçons`} />
      </Card>

      {/* Lessons list */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Leçons</h2>
        <div className="space-y-3">
          {lessons
            .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
            .map((lesson: {
              id: string
              title: string
              duration_minutes: number | null
              quizzes: { id: string }[]
              order_index: number
            }, idx: number) => {
              const isCompleted = completedIds.has(lesson.id)
              const hasQuiz = (lesson.quizzes?.length ?? 0) > 0

              return (
                <Link key={lesson.id} href={`/lessons/${lesson.id}`}>
                  <Card padding="sm" className="flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer group">
                    {/* Status icon */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {isCompleted ? (
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs font-bold text-gray-500">{idx + 1}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`font-medium group-hover:text-blue-600 transition-colors ${isCompleted ? 'text-gray-500' : 'text-gray-900'}`}>
                        {lesson.title}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        {lesson.duration_minutes && (
                          <span className="text-xs text-gray-400">{lesson.duration_minutes} min</span>
                        )}
                        {hasQuiz && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Quiz</span>
                        )}
                      </div>
                    </div>

                    <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Card>
                </Link>
              )
            })}
        </div>
      </div>
    </div>
  )
}
