'use client'

import { useState } from 'react'
import { supabase } from '../../server/db'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { toast } from 'sonner'
import { useAuth } from './auth-context'

export function AuthForm() {
  const { loading: authLoading } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isSignUp) {
        // Sign up
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })

        if (authError) throw authError

        // Create user profile
        if (authData.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert({
              id: authData.user.id,
              email: authData.user.email!,
              full_name: fullName,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              study_preferences: {
                preferred_study_times: [],
                preferred_study_duration: 25, // Default 25 minutes
                preferred_break_duration: 5, // Default 5 minutes
                preferred_subjects: [],
              },
              onboarding_completed: false,
              subscription_tier: 'free',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })

          if (profileError) throw profileError
        }

        toast.success('Account created successfully! Please check your email for verification.')
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
        toast.success('Signed in successfully!')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          {isSignUp ? 'Create an account' : 'Sign in to your account'}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {isSignUp ? 'Sign in' : 'Sign up'}
          </button>
        </p>
      </div>

      <form onSubmit={handleAuth} className="mt-8 space-y-6">
        <div className="space-y-4">
          {isSignUp && (
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1"
                placeholder="John Doe"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              placeholder="••••••••"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Loading...' : isSignUp ? 'Sign up' : 'Sign in'}
        </Button>
      </form>
    </div>
  )
} 