'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { QuizQuestion } from '@/lib/types'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

interface Props {
  quiz: { id: string; title: string; passing_score: number }
  questions: QuizQuestion[]
  lesson: { id: string; title: string; module_id: string; modules: { id: string; title: string } | null } | null
  userId: string
}

type QuizState = 'start' | 'playing' | 'result'

export default function QuizClient({ quiz, questions, lesson, userId }: Props) {
  const router = useRouter()
  const [state, setState] = useState<QuizState>('start')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null))
  const [submitting, setSubmitting] = useState(false)
  const [score, setScore] = useState(0)

  const currentQuestion = questions[currentIndex]
  const isLast = currentIndex === questions.length - 1
  const passed = score >= quiz.passing_score

  function handleSelect(optionIndex: number) {
    if (selected !== null) return
    setSelected(optionIndex)
    const updated = [...answers]
    updated[currentIndex] = optionIndex
    setAnswers(updated)
  }

  function handleNext() {
    if (!isLast) {
      setCurrentIndex((i) => i + 1)
      setSelected(answers[currentIndex + 1] ?? null)
    } else {
      submitQuiz()
    }
  }

  async function submitQuiz() {
    setSubmitting(true)
    const correctCount = answers.filter((a, i) => a === questions[i].correct_answer).length
    const pct = Math.round((correctCount / questions.length) * 100)
    setScore(pct)

    const supabase = createClient()
    await supabase.from('user_progress').upsert({
      user_id: userId,
      lesson_id: lesson!.id,
      completed: pct >= quiz.passing_score,
      quiz_score: pct,
      completed_at: pct >= quiz.passing_score ? new Date().toISOString() : null,
    })

    setState('result')
    setSubmitting(false)
    router.refresh()
  }

  function restart() {
    setCurrentIndex(0)
    setSelected(null)
    setAnswers(Array(questions.length).fill(null))
    setScore(0)
    setState('playing')
  }

  if (state === 'start') {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <nav className="text-sm text-gray-500 flex items-center gap-2 flex-wrap">
          <Link href="/dashboard" className="hover:text-blue-600">Tableau de bord</Link>
          <span>/</span>
          {lesson?.modules && (
            <>
              <Link href={`/modules/${lesson.modules.id}`} className="hover:text-blue-600">{lesson.modules.title}</Link>
              <span>/</span>
            </>
          )}
          <span className="text-gray-900 font-medium">{quiz.title}</span>
        </nav>

        <Card className="text-center space-y-4">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
            <span>{questions.length} questions</span>
            <span>·</span>
            <span>Score minimum : {quiz.passing_score}%</span>
          </div>
          <Button size="lg" className="w-full" onClick={() => setState('playing')}>
            Commencer le quiz
          </Button>
          {lesson && (
            <Link href={`/lessons/${lesson.id}`} className="block text-sm text-gray-500 hover:text-blue-600">
              ← Retour à la leçon
            </Link>
          )}
        </Card>
      </div>
    )
  }

  if (state === 'result') {
    return (
      <div className="max-w-xl mx-auto space-y-6">
        <Card className="text-center space-y-6">
          {/* Score circle */}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto text-3xl font-bold ${
            passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {score}%
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {passed ? '🎉 Félicitations !' : 'Essayez encore'}
            </h2>
            <p className="text-gray-600 mt-1">
              {passed
                ? `Vous avez réussi avec ${score}% (minimum requis : ${quiz.passing_score}%).`
                : `Vous avez obtenu ${score}%. Il faut au moins ${quiz.passing_score}% pour valider.`}
            </p>
          </div>

          {/* Answer review */}
          <div className="text-left space-y-3">
            {questions.map((q, i) => {
              const userAnswer = answers[i]
              const correct = q.correct_answer
              const isCorrect = userAnswer === correct
              return (
                <div key={q.id} className={`p-3 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className="text-sm font-medium text-gray-900 mb-1">{q.question}</p>
                  <p className="text-xs text-gray-600">
                    {isCorrect ? '✓ Correct' : `✗ Votre réponse : "${userAnswer !== null ? q.options[userAnswer] : 'aucune'}" — Bonne réponse : "${q.options[correct]}"`}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="secondary" className="flex-1" onClick={restart}>
              Recommencer
            </Button>
            {lesson?.modules && (
              <Link href={`/modules/${lesson.modules.id}`} className="flex-1">
                <Button className="w-full">Retour au module</Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Progress */}
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentIndex + 1} sur {questions.length}</span>
          <span>{Math.round(((currentIndex) / questions.length) * 100)}% terminé</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 mb-6">{currentQuestion.question}</h2>

        <div className="space-y-3">
          {currentQuestion.options.map((option, i) => {
            let style = 'border-gray-200 hover:border-purple-400 hover:bg-purple-50 cursor-pointer'

            if (selected !== null) {
              if (i === currentQuestion.correct_answer) {
                style = 'border-green-400 bg-green-50'
              } else if (i === selected && selected !== currentQuestion.correct_answer) {
                style = 'border-red-400 bg-red-50'
              } else {
                style = 'border-gray-200 opacity-60'
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
                className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${style}`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0 border-current">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm text-gray-900">{option}</span>
                </div>
              </button>
            )
          })}
        </div>

        {selected !== null && (
          <div className="mt-4">
            <Button
              size="lg"
              className="w-full"
              loading={submitting && isLast}
              onClick={handleNext}
            >
              {isLast ? 'Voir les résultats' : 'Question suivante →'}
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
