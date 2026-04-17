"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import api from '@/lib/api';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  confirm_password: z.string(),
  pdpa_consent: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Privacy Policy (PDPA)' }),
  }),
}).refine((d) => d.password === d.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await api.post('/auth/register', {
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        pdpa_consent: data.pdpa_consent,
      });
      router.push(`/${locale}/login?registered=true`);
    } catch (err) {
      setError('root', { message: (err as Error).message });
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/60 p-8">
        <div className="flex justify-center mb-6">
          <Image 
            src="/images/tna-logo.png" 
            alt="TNA Medical" 
            width={80} 
            height={80} 
            className="h-16 w-auto"
            priority
          />
        </div>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2 text-center">
          Create Account
        </h1>
        <p className="text-gray-500 text-center mb-8 text-sm">
          Join TNA Supplement today
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          <div>
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input id="full_name" type="text" autoComplete="name" {...register('full_name')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              placeholder="Somchai Jaidee" />
            {errors.full_name && <p className="mt-1 text-sm text-red-500">{errors.full_name.message}</p>}
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="reg-email" type="email" autoComplete="email" {...register('email')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              placeholder="you@example.com" />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input id="reg-password" type="password" autoComplete="new-password" {...register('password')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              placeholder="••••••••" />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input id="confirm_password" type="password" autoComplete="new-password" {...register('confirm_password')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
              placeholder="••••••••" />
            {errors.confirm_password && <p className="mt-1 text-sm text-red-500">{errors.confirm_password.message}</p>}
          </div>

          {/* PDPA Consent — required by Thai data privacy law */}
          <div className="flex items-start gap-3 bg-orange-50 rounded-xl p-4 border border-orange-100">
            <input id="pdpa_consent" type="checkbox" {...register('pdpa_consent')}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
            <label htmlFor="pdpa_consent" className="text-sm text-gray-700">
              I have read and agree to the{' '}
              <a href="/privacy-policy" target="_blank" className="text-orange-600 font-semibold hover:underline">
                Privacy Policy
              </a>{' '}
              and consent to the collection and use of my personal data as required by the{' '}
              <strong>PDPA (Personal Data Protection Act)</strong>.
            </label>
          </div>
          {errors.pdpa_consent && <p className="text-sm text-red-500">{errors.pdpa_consent.message}</p>}

          {errors.root && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 text-center">
              {errors.root.message}
            </div>
          )}

          <button id="register-submit" type="submit" disabled={isSubmitting}
            className="w-full bg-white text-orange-600 border-2 border-orange-500 px-8 py-3 rounded-2xl font-bold hover:bg-orange-50 hover:shadow-[0_10px_20px_rgba(249,115,22,0.2)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50">
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href={`/${locale}/login`} className="text-orange-600 font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </main>
  );
}
