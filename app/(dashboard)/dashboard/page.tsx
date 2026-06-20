import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import Card from '@/components/ui/Card'
import ProgressBar from '@/components/ProgressBar'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: modules }, { data: progress }] = await Promise.all([
    supabase.from('modules').select('*, lessons(id)').eq('is_published', true).order('order_index'),
    supabase.from('user_progress').select('*').eq('user_id', user!.id).eq('completed', true),
  ])

  const completedIds = new Set(progress?.map((p) => p.lesson_id) ?? [])
  const totalLessons = modules?.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0) ?? 0
  const completedCount = completedIds.size

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 mt-1">Continuez votre apprentissage là où vous vous êtes arrêté.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-gray-500">Modules disponibles</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{modules?.length ?? 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Leçons complétées</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{completedCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Progression globale</p>
          <p className="text-3xl font-bold text-purple-600 mt-1">
            {totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0}%
          </p>
        </Card>
      </div>

      {/* Progress global */}
      {totalLessons > 0 && (
        <Card>
          <h2 className="text-sm font-medium text-gray-700 mb-3">Progression totale</h2>
          <ProgressBar value={completedCount} max={totalLessons} color="blue" />
          <p className="text-xs text-gray-500 mt-2">{completedCount} / {totalLessons} leçons terminées</p>
        </Card>
      )}

      {/* Modules */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Mes modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules?.map((module) => {
            const lessonCount = module.lessons?.length ?? 0
            const done = module.lessons?.filter((l: { id: string }) => completedIds.has(l.id)).length ?? 0
            return (
              <Link key={module.id} href={`/modules/${module.id}`}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    {done === lessonCount && lessonCount > 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                        Terminé
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{module.description}</p>
                  <ProgressBar value={done} max={lessonCount || 1} color="blue" />
                  <p className="text-xs text-gray-400 mt-2">{done} / {lessonCount} leçons</p>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
