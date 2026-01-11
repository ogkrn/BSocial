import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

interface VerifyForm {
  otp: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  username: string;
  branch: string;
  year: string;
}

const branches = [
  'Computer Science (CSE)',
  'Electronics (ECE)',
  'Mechanical (ME)',
  'Civil (CE)',
  'Electrical (EE)',
  'Information Technology (IT)',
  'Other',
];

const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Alumni'];

export default function VerifyOtp() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { pendingEmail, login, setPendingEmail } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<VerifyForm>();

  // Redirect if no pending email
  if (!pendingEmail) {
    return <Navigate to="/register" replace />;
  }

  const onSubmit = async (data: VerifyForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.completeRegister({
        email: pendingEmail,
        otp: data.otp,
        password: data.password,
        fullName: data.fullName,
        username: data.username,
        branch: data.branch,
        year: data.year,
      });

      const { user, accessToken } = response.data.data;
      login(user, accessToken);
      setPendingEmail(null);
      toast.success('Account created successfully! 🎉');
      navigate('/feed');
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Verification failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete your profile</h2>
      <p className="text-gray-600 mb-6">
        Verify your email and set up your account
      </p>

      <div className="bg-gray-50 rounded-lg p-3 mb-6">
        <p className="text-sm text-gray-600">
          Code sent to: <span className="font-medium text-gray-900">{pendingEmail}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* OTP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Verification Code
          </label>
          <input
            type="text"
            className="input text-center text-2xl tracking-widest"
            placeholder="000000"
            maxLength={6}
            {...register('otp', {
              required: 'OTP is required',
              pattern: {
                value: /^\d{6}$/,
                message: 'OTP must be 6 digits',
              },
            })}
          />
          {errors.otp && (
            <p className="text-red-500 text-sm mt-1">{errors.otp.message}</p>
          )}
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            className="input"
            placeholder="John Doe"
            {...register('fullName', {
              required: 'Full name is required',
              minLength: { value: 2, message: 'Name too short' },
            })}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username
          </label>
          <input
            type="text"
            className="input"
            placeholder="johndoe"
            {...register('username', {
              required: 'Username is required',
              minLength: { value: 3, message: 'Username too short' },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: 'Only letters, numbers, and underscores',
              },
            })}
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
          )}
        </div>

        {/* Branch & Year */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <select className="input" {...register('branch')}>
              <option value="">Select branch</option>
              {branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select className="input" {...register('year')}>
              <option value="">Select year</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input pr-10"
              placeholder="Create a strong password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: 'Must include uppercase, lowercase, and number',
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            className="input"
            placeholder="Confirm your password"
            {...register('confirmPassword', {
              required: 'Please confirm password',
              validate: (val) =>
                val === watch('password') || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Create Account'
          )}
        </button>
      </form>
    </div>
  );
}
