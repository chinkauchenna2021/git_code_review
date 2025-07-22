import { ReactNode } from 'react'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/config'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardNav } from '@/app/(dashboard)/share/DashboardNav'
import { UserMenu } from '@/components/auth/UserMenu'

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/login')
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">DevTeams Copilot</h1>
              </div>
              <UserMenu />
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <DashboardNav />
          
          {/* Main Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}