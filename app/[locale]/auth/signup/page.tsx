import { redirect } from 'next/navigation';

// Açık kayıt kapatıldı. Kullanıcılar yalnızca Super Admin daveti ile eklenir.
export default function SignupPage() {
    redirect('/auth/login');
}
