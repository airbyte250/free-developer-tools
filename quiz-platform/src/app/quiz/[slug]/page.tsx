import { redirect } from 'next/navigation'

export default async function QuizSlugPage() {
  // All quiz navigation is handled client-side via pushState
  // Direct access to /quiz/2, /quiz/3, /quiz/result etc. redirects to /quiz to start fresh
  redirect('/quiz')
}
