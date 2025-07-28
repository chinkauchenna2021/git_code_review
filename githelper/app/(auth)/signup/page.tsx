'use client'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth/config'
import {LoginForm}  from '@/components/auth/LoginForm'
import { getSession } from 'next-auth/react'
import { Suspense, useEffect } from 'react'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { SignInForm } from '@/components/auth/BetterSignInForm'
import { SignUpForm } from '@/components/auth/BetterSignUpForm'



export default  function SignupPage() {
// useEffect(() => {
//   // Check if user is already authenticated
//   (async () => {  
//       const session = await getSession()
//        console.log(session)

//     })()


// },[] )
  // Redirect if already authenticated
  // if (session) {
  //   redirect('/dashboard')
  // }

  return(
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><LoadingSpinner /></div>}>
     <SignUpForm />
     </Suspense>
  ) 

}

