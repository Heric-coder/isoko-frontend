import { useState, type ChangeEvent, type FormEvent } from 'react'
import { authApi } from '@/api/auth'
import { useAuth } from '@/context/AuthContext'
import { useLanguage } from '@/context/LanguageContext'

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const { t } = useLanguage()
  const [firstName, setFirstName] = useState(user?.first_name || '')
  const [lastName, setLastName] = useState(user?.last_name || '')
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [savedMessage, setSavedMessage] = useState('')

  if (!user) return null

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setProfilePicture(file)
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  const handleSave = async (e: FormEvent) => {
    e.preventDefault()
    await authApi.updateMe({
      first_name: firstName,
      last_name: lastName,
      profile_picture: profilePicture || undefined,
    })
    await refreshUser()
    setProfilePicture(null)
    setPreview(null)
    setSavedMessage('Saved!')
    setTimeout(() => setSavedMessage(''), 2000)
  }

  return (
    <div className="mx-auto max-w-md py-8">
      <h1 className="mb-6 text-xl font-bold">{t('nav_profile')}</h1>
      <form onSubmit={handleSave} className="space-y-4">
        <div className="flex items-center gap-4">
          {preview || user.profile_picture ? (
            <img
              src={preview || user.profile_picture || ''}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500 text-2xl font-bold text-white">
              {user.first_name.charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <label className="label">Profile picture</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="input" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">{t('auth_first_name')}</label>
            <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <label className="label">{t('auth_last_name')}</label>
            <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">{t('auth_email_or_phone')}</label>
          <input className="input" value={user.email || user.phone || ''} disabled />
        </div>
        <button type="submit" className="btn-primary">Save changes</button>
        {savedMessage && <p className="text-sm text-leaf-500">{savedMessage}</p>}
      </form>
    </div>
  )
}