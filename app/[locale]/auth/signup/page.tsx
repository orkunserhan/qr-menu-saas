'use client'

import { signupWithRestaurant } from '../actions'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'
import Link from 'next/link'

export default function SignupPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError(null);

        try {
            const result = await signupWithRestaurant(formData);
            if (result?.error) {
                setError(result.error);
                setLoading(false);
            }
            // On success, server action will redirect
        } catch (e: any) {
            setError("An error occurred: " + (e.message || "Unknown error"));
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 font-sans">
            <div className="w-full max-w-2xl space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                        🚀 Become a Restaurant Owner
                    </h2>
                    <p className="mt-2 text-gray-500">
                        Sign up now to create your digital menu and start taking orders.
                    </p>
                </div>

                <form className="space-y-6" action={handleSubmit}>

                    {/* SECTION 1: ADMIN INFO */}
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b pb-2">1. Admin Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input id="full_name" name="full_name" label="Full Name" placeholder="Ex: John Smith" required />
                            <Input id="email" name="email" type="email" label="Email (for Login)" placeholder="contact@company.com" required />
                            <Input id="password" name="password" type="password" label="Password" placeholder="••••••••" required />
                            <Input id="phone" name="phone" type="tel" label="Phone Number" placeholder="+1 555 123 4567" required />
                            <Input id="birth_date" name="birth_date" type="date" label="Date of Birth" required />
                        </div>
                    </div>

                    {/* SECTION 2: RESTAURANT INFO */}
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-4 border-b border-blue-200 pb-2">2. Restaurant Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Input id="restaurant_name" name="restaurant_name" label="Venue Name" placeholder="Ex: Blue Point" required />
                            </div>
                            <Input id="restaurant_slug" name="restaurant_slug" label="Short Link (Slug)" placeholder="blue-point" required />
                            <Input id="restaurant_phone" name="restaurant_phone" type="tel" label="Restaurant Phone" placeholder="+1 212 123 4567" required />
                            <div className="md:col-span-2">
                                <Input id="restaurant_address" name="restaurant_address" label="Address" placeholder="Street, City, Country..." required />
                            </div>
                            <Input id="establishment_date" name="establishment_date" type="date" label="Founded Date (Optional)" />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm p-3 bg-red-50 rounded-lg border border-red-100">
                            {error}
                        </div>
                    )}

                    <Button type="submit" fullWidth disabled={loading} size="lg" className="text-lg">
                        {loading ? "Creating Account..." : "🎉 Complete Registration"}
                    </Button>
                </form>

                <div className="text-center">
                    <Link href="/auth/login" className="text-sm text-gray-500 hover:text-black underline transition-colors">
                        Already have an account? Log in
                    </Link>
                </div>
            </div>
        </div>
    )
}
