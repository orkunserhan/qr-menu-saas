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

export async function signupWithRestaurant(formData: FormData) {
    const supabase = await createClient()

    // 1. Hesap Bilgileri
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // 2. Profil Bilgileri
    const full_name = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const birth_date = formData.get('birth_date') as string

    // 3. Restoran Bilgileri
    const restaurant_name = formData.get('restaurant_name') as string
    const slug = formData.get('restaurant_slug') as string
    const restaurant_phone = formData.get('restaurant_phone') as string
    const address = formData.get('restaurant_address') as string
    const establishment_date = formData.get('establishment_date') as string

    // A. Kullanıcı Oluştur
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: full_name, // Meta data olarak da saklayalım
            }
        }
    })

    if (authError) {
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: "Kullanıcı oluşturulamadı." }
    }

    // B. Profili Güncelle (Profil tablosu trigger ile oluşmuş olabilir veya biz oluştururuz)
    // Trigger yoksa upsert güvenlidir.
    const { error: profileError } = await supabase.from('profiles').upsert({
        id: authData.user.id,
        email: email,
        full_name: full_name,
        phone: phone,
        birth_date: birth_date || null,
        role: 'restaurant_owner' // Varsayılan rol
    })

    if (profileError) {
        console.error('Profile Error:', profileError)
        // Kritik hata değil, devam edebiliriz ama loglayalım.
    }

    // C. İlk Restoranı Oluştur
    const { error: restError } = await supabase.from('restaurants').insert({
        owner_id: authData.user.id,
        name: restaurant_name,
        slug: slug,
        address: address,
        phone: restaurant_phone,
        email: email, // İletişim maili
        establishment_date: establishment_date || null,
        is_active: true
    })

    if (restError) {
        console.error('Restaurant Error:', restError)
        return { error: "Hesap oluşturuldu ama restoran kaydedilemedi: " + restError.message }
    }

    revalidatePath('/', 'layout')
    redirect('/admin')
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/auth/login')
}

export async function resetPassword(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    if (!email) return { error: "E-posta gereklidir." }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/update-password`,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
