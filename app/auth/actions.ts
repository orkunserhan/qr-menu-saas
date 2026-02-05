'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    // Formdan verileri al
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Supabase ile giriş yap
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
        // redirect('/auth/login?error=' + encodeURIComponent(error.message)) // Alternatif: error'u query string ile dön
    }

    revalidatePath('/', 'layout')
    redirect('/admin')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/admin')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
}
