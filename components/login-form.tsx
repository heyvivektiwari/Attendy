"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAttendanceStore } from "@/lib/attendance-store"
import { DropdownMenu } from "@radix-ui/react-dropdown-menu" // Unrelated, just to preserve if any imports were there before
import { GraduationCap, Sparkles, Loader2, AlertCircle, CheckCircle2, ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

type View = "login" | "register" | "forgot-password"

function PasswordInput({ value, onChange, placeholder, disabled, id, minLength }: any) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        disabled={disabled}
        minLength={minLength}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        disabled={disabled}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}

export function LoginForm() {
  const [view, setView] = useState<View>("login")
  const [rollNo, setRollNo] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const login = useAttendanceStore((state) => state.login)

  const clearForm = () => {
    setRollNo("")
    setPassword("")
    setName("")
    setEmail("")
    setConfirmPassword("")
    setError("")
    setSuccess("")
  }

  const switchView = (newView: View) => {
    clearForm()
    setView(newView)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        login(data.student.name, data.student.rollNo, data.student.division)
      } else {
        setError(data.message || "Invalid credentials")
      }
    } catch {
      setError("Unable to connect to server. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          rollNo: rollNo.trim(),
          email: email.trim(),
          password: password.trim(),
          division: "A",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message)
        setTimeout(() => switchView("login"), 2000)
      } else {
        setError(data.message || "Registration failed")
      }
    } catch {
      setError("Unable to connect to server. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message)
      } else {
        setError(data.message || "Something went wrong")
      }
    } catch {
      setError("Unable to connect to server. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10 mb-4">
            <GraduationCap className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Attendy</h1>
          <p className="text-muted-foreground">Track your attendance, stay on track</p>
        </div>

        {/* ============ LOGIN VIEW ============ */}
        {view === "login" && (
          <Card className="border-2">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl">Welcome back</CardTitle>
              <CardDescription>Enter your email and password to login</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="loginEmail">Email Address</FieldLabel>
                    <Input
                      id="loginEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="loginPassword">Password</FieldLabel>
                    <PasswordInput
                      id="loginPassword"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e: any) => setPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </Field>
                </FieldGroup>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => switchView("forgot-password")}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Access Dashboard
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchView("register")}
                    className="text-primary hover:underline font-medium"
                  >
                    Register
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ============ REGISTER VIEW ============ */}
        {view === "register" && (
          <Card className="border-2">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <button
                  onClick={() => switchView("login")}
                  className="p-1 rounded-md hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                Create Account
              </CardTitle>
              <CardDescription>Register with your college details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-500 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="regName">Full Name</FieldLabel>
                    <Input
                      id="regName"
                      type="text"
                      placeholder="e.g., Vivek T"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="regRollNo">Roll Number</FieldLabel>
                    <Input
                      id="regRollNo"
                      type="text"
                      placeholder="e.g., SEA156"
                      value={rollNo}
                      onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                      required
                      disabled={isLoading}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="regEmail">Email</FieldLabel>
                    <Input
                      id="regEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="regPassword">Password</FieldLabel>
                    <PasswordInput
                      id="regPassword"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e: any) => setPassword(e.target.value)}
                      disabled={isLoading}
                      minLength={4}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="regConfirmPassword">Confirm Password</FieldLabel>
                    <PasswordInput
                      id="regConfirmPassword"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e: any) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      minLength={4}
                    />
                  </Field>
                </FieldGroup>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchView("login")}
                    className="text-primary hover:underline font-medium"
                  >
                    Login
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* ============ FORGOT PASSWORD VIEW ============ */}
        {view === "forgot-password" && (
          <Card className="border-2">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl flex items-center gap-2">
                <button
                  onClick={() => switchView("login")}
                  className="p-1 rounded-md hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                Forgot Password
              </CardTitle>
              <CardDescription>
                Enter your registered email and we&apos;ll send you a link to reset your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 text-emerald-500 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>{success}</span>
                  </div>
                )}
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="forgotEmail">Email Address</FieldLabel>
                    <Input
                      id="forgotEmail"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </Field>
                </FieldGroup>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={() => switchView("login")}
                    className="text-primary hover:underline font-medium"
                  >
                    Login
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            SE Sem IV Div A (EVEN) - Effective from 05/01/2026
          </p>
          <p className="text-xs text-muted-foreground">
            Lokmanya Tilak College of Engineering
          </p>
        </div>
      </div>
    </div>
  )
}
