"use client";
import { redirect } from 'next/navigation'
import Dashboard from '@/components/DashBoard'
import { useUser } from '@/lib/store/user'

export default function Page() {
  const { user } = useUser()

  if (user?.isAdmin) {
    redirect('/scan')
  }

  return (
    <Dashboard user={user} />
  )
}