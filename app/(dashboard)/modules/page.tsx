import { redirect } from 'next/navigation'

// /modules redirects to /dashboard which already lists modules
export default function ModulesPage() {
  redirect('/dashboard')
}
