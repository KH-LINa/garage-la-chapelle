import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import MarkLessonComplete from './MarkLessonComplete'

export default async function LessonPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: lesson }, { data: progressRow }] = await Promise.all([
    supabase
      .from('lessons')
      .select('*, modules(id, title), quizzes(id, title)')
      .eq('id', params.id)
      .eq('is_published', true)
      .single(),
    supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user!.id)
      .eq('lesson_id', params.id)
      .single(),
  ])

  if (!lesson) notFound()

  const isCompleted = progressRow?.completed ?? false
  const module = lesson.modules as { id: string; title: string } | null
  const quiz = (lesson.quizzes as { id: string; title: string }[] | null)?.[0]

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
        <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>
        <span>/</span>
        {module && (
          <>
            <Link href={`/modules/${module.id}`} className="hover:text-blue-600">{module.title}</Link>
            <span>/</span>
          </>
        )}
        <span className="text-gray-900 font-medium">{lesson.title}</span>
      </nav>

      {/* Lesson header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
          {lesson.duration_minutes && (
            <p className="text-sm text-gray-500 mt-1">{lesson.duration_minutes} minutes de lecture</p>
          )}
        </div>
        {isCompleted && (
          <span className="flex-shrink-0 text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
            ✓ Complétée
          </span>
        )}
      </div>

      {/* Video placeholder */}
      {lesson.video_url && (
        <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden">
          <iframe
            src={lesson.video_url}
            className="w-full h-full"
            allowFullScreen
            title={lesson.title}
          />
        </div>
      )}

      {/* Content */}
      <Card>
        <div className="prose prose-gray max-w-none">
          {lesson.content?.split('\n').map((paragraph: string, i: number) => (
            <p key={i} className="text-gray-700 leading-relaxed mb-3 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <MarkLessonComplete
          lessonId={lesson.id}
          userId={user!.id}
          isCompleted={isCompleted}
        />

        {quiz && (
          <Link
            href={`/quiz/${quiz.id}`}
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Passer le quiz – {quiz.title}
          </Link>
        )}
      </div>

      {/* Navigation */}
      {module && (
        <Link href={`/modules/${module.id}`} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour au module
        </Link>
      )}
    </div>
  )
}
