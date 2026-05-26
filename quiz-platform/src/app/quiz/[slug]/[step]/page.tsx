import { redirect } from 'next/navigation'

export default async function QuizStepPage() {
  // All quiz navigation is handled client-side via pushState
  // Direct access to sub-routes redirects to /quiz to start fresh
  redirect('/quiz')
}
