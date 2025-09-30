'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.user.id)
          .single()

        // Debug logging
        console.log('User ID:', data.user.id)
        console.log('Profile data:', profile)
        console.log('Profile error:', profileError)

        if (profileError) {
          console.error('Profile error details:', profileError)
          setError(`Database error: ${profileError.message}`)
          await supabase.auth.signOut()
          return
        }

        if (!profile) {
          setError('No profile found. Please contact administrator.')
          await supabase.auth.signOut()
          return
        }

        if (!profile.is_admin) {
          setError('Access denied. Admin privileges required.')
          await supabase.auth.signOut()
          return
        }

        // Redirect to admin dashboard (root path for admin project)
        const redirectTo = searchParams.get('redirect') || '/'
        router.push(redirectTo)
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const errorParam = searchParams.get('error')
  const displayError = error || (errorParam === 'access_denied' && 'Access denied. Admin privileges required.') || (errorParam === 'database_error' && 'Database connection error. Please try again.')

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Professional Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-indigo-50/30"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-100/40 to-purple-200/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-100/40 to-pink-200/40 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-indigo-100/20 to-blue-200/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative w-full max-w-md z-10 flex-1 flex flex-col justify-center">
        {/* Back to Welcome Button */}
        <div className="absolute -top-12 md:-top-16 left-0">
          <button
            onClick={() => router.push('/admin/welcome')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium hidden sm:inline">Back to Welcome</span>
          </button>
        </div>
        
        <Card className="bg-white border-2 border-gray-200 shadow-2xl rounded-xl overflow-hidden">
          <CardHeader className="pb-4 bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-lg border border-gray-200 flex-shrink-0">
                  <Image 
                    src="/craft-logo.jpeg" 
                    alt="JulieCraft Logo" 
                  width={32}
                  height={32}
                  className="rounded-lg object-cover"
                />
            </div>
            
              <div className="flex-1">
                <CardTitle className="text-lg font-bold text-blue-600 mb-1">
                JulieCraft Admin
              </CardTitle>
                <CardDescription className="text-blue-500 text-sm">
                Secure access to your handmade business dashboard
              </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 p-4">
            {displayError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800 text-sm">
                  {displayError}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
              <fieldset className="space-y-3">
                <legend className="sr-only">Admin Login Form</legend>
                
                <div className="space-y-1">
                  <Label htmlFor="email" className="block text-sm font-semibold text-gray-900">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your e-mail address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form-type="other"
                    className="h-10 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 sm:text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm shadow-sm"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password" className="block text-sm font-semibold text-gray-900">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-form-type="other"
                      className="h-10 w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg bg-white text-gray-900 sm:text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm shadow-sm"
                      disabled={loading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100 rounded-full"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-3 w-3 text-gray-500" />
                      ) : (
                        <Eye className="h-3 w-3 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
              </fieldset>

              <Button
                type="submit"
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    <span>Access Admin Portal</span>
                  </>
                )}
              </Button>
            </form>

            <div className="text-center pt-3 border-t border-gray-200">
              <button
                onClick={() => {
                  // Forgot password functionality - could open modal or redirect
                  alert('Forgot password functionality - please contact administrator.')
                }}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
              >
                Forgot your password?
              </button>
            </div>
          </CardContent>
        </Card>

      </div>

        {/* Footer */}
      <div className="text-center mt-6 pb-4 z-10">
        <p className="text-gray-600/80 text-xs">
          © {new Date().getFullYear()} JulieCraft • Handmade Business Management
        </p>
      </div>
    </div>
  )
}
