"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ShoppingCart, Lock, User, Mail, Eye, EyeOff } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (email && password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" })
      } else {
        toast({ title: "Welcome back!", description: "You have successfully logged in." })
        router.push("/dashboard")
        router.refresh()
      }
    } else {
      toast({ title: "Error", description: "Please enter your credentials.", variant: "destructive" })
    }
    setLoading(false)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (email && password && name) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" })
      } else if (data.user) {
        toast({ title: "Account created!", description: "Check your email to confirm your account." })
        router.push("/dashboard")
        router.refresh()
      } else {
        toast({ title: "Account created!", description: "Welcome to POS Dashboard." })
        router.push("/dashboard")
        router.refresh()
      }
    } else {
      toast({ title: "Error", description: "Please fill in all fields.", variant: "destructive" })
    }
    setLoading(false)
  }

  const handleDemoLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: "demo@pos.com",
      password: "demo123456",
    })
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } else {
      toast({ title: "Welcome to POS Dashboard", description: "You are now logged in as Demo User." })
      router.push("/dashboard")
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">POS Admin Dashboard</h1>
            <p className="text-gray-500 mt-2">{isLogin ? "Sign in to your account" : "Create your account"}</p>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input id="name" type="text" placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} className="pl-10" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-500">Or</span></div>
            </div>

            <Button type="button" variant="outline" className="w-full mt-4" onClick={handleDemoLogin} disabled={loading}>
              Try Demo Account
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary hover:underline font-medium">
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}