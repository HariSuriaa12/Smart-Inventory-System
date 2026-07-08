import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '@/store/hooks'
import { login } from '@/store/slices/authSlice'
import { useForm } from '@/hooks'
import { Button, Input, Alert } from '@/components'
import { validateEmail, validatePassword } from '@/utils/validators'
import { Lock, Mail } from 'lucide-react'

export const LoginPage = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [apiError, setApiError] = useState<string | null>(null)

  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: (values) => {
      const errors: Record<string, string> = {}

      if (!values.username) {
        errors.username = 'Username is required'
      }

      if (!values.password) {
        errors.password = 'Password is required'
      } 
      // else if (values.password.length < 6) {
      //   errors.password = 'Password must be at least 6 characters'
      // }

      return errors
    },
    onSubmit: async (formValues) => {
      setApiError(null)
      try {
        const response = await dispatch(login(formValues))

        if (response.type === login.fulfilled.type) {
          navigate('/app/dashboard', { replace: true })
        } else {
          setApiError('Login failed. Please check your credentials.')
        }
      } catch (error: any) {
        setApiError(error.message || 'An error occurred during login')
      }
    },
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-8 right-1/4 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      {/* Login Container */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <span className="text-3xl">📦</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Smart Inventory</h1>
            <p className="text-primary-100">Sign in to your account</p>
          </div>

          {/* Form Content */}
          <div className="px-8 py-8">
            {/* Error Alert */}
            {apiError && (
              <Alert variant="error" dismissible onDismiss={() => setApiError(null)} className="mb-6">
                {apiError}
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <Input
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.username ? errors.username : undefined}
                    className="pl-10"
                    fullWidth
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <Input
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.password ? errors.password : undefined}
                    className="pl-10"
                    fullWidth
                  />
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                className="w-full mt-8"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo Credentials</span>
              </div>
            </div>

            {/* Demo Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Username:</span> admin
              </p>
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Password:</span> password
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Version <span className="font-semibold">1.0.0</span>
            </p>
          </div>
        </div>

        {/* Support Text */}
        <div className="text-center mt-6">
          <p className="text-white text-sm">
            Having trouble signing in? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  )
}
