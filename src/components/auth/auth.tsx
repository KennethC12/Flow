'use client'

import { useState } from 'react'
import { supabase } from '../../server/db'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { toast } from 'sonner'

export function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      toast.success('Signed in successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      toast.success('Signed out successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign out')
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <form onSubmit={handleSignIn} className="space-y-6">
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      <Button onClick={handleSignOut} variant="outline" className="w-full">
        Sign Out
      </Button>
    </div>
  )
} 