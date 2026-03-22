import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  FiUser,
  FiLock,
  FiGlobe,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiX,
  FiTrash2,
} from 'react-icons/fi'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { changePassword, deleteAccount, updateProfile } from '../../services/authService.js'
import { clearUser, setUser } from '../../store/slices/authSlice.js'
import { useToast } from '../../components/ui/ToastProvider.jsx'
import { getServerMessage } from '../../utils/errorUtils.js'
import LoadingIndicator from '../../components/ui/LoadingIndicator.jsx'
import DropdownSelect from '../../components/ui/DropdownSelect'
import { getPrimaryButtonClass } from '../../components/ui/buttonStyles.js'

const PASSWORD_REQUIREMENTS = [
  {
    id: 'length',
    label: 'At least 10 characters',
    test: (value) => value.length >= 10,
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (value) => /[A-Z]/.test(value),
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    test: (value) => /[a-z]/.test(value),
  },
  {
    id: 'number',
    label: 'One number',
    test: (value) => /[0-9]/.test(value),
  },
  {
    id: 'special',
    label: 'One symbol (e.g. !@#$%)',
    test: (value) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
  },
]

const Settings = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, token } = useSelector((state) => state.auth)
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileData, setProfileData] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
  })
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [currency, setCurrency] = useState(user?.currency ?? 'ETB')
  const [isSavingPreferences, setIsSavingPreferences] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [showDeletePassword, setShowDeletePassword] = useState(false)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deleteErrorTimeout, setDeleteErrorTimeout] = useState(null)

  const currencyOptions = useMemo(
    () => [
      { label: 'USD ($)', value: 'USD' },
      { label: 'EUR (€)', value: 'EUR' },
      { label: 'GBP (£)', value: 'GBP' },
      { label: 'ETB (Br)', value: 'ETB' },
      { label: 'KES (KSh)', value: 'KES' },
      { label: 'NGN (₦)', value: 'NGN' },
      { label: 'ZAR (R)', value: 'ZAR' },
      { label: 'INR (₹)', value: 'INR' },
      { label: 'CAD (C$)', value: 'CAD' },
      { label: 'AUD (A$)', value: 'AUD' },
      { label: 'JPY (¥)', value: 'JPY' },
    ],
    []
  )

  useEffect(() => {
    setProfileData({
      name: user?.name ?? '',
      email: user?.email ?? '',
    })
  }, [user?.email, user?.name])

  useEffect(() => {
    setCurrency(user?.currency ?? 'ETB')
  }, [user?.currency])

  const hasProfileChanges = useMemo(() => {
    const currentName = (user?.name ?? '').trim()
    const currentEmail = (user?.email ?? '').trim().toLowerCase()
    return (
      profileData.name.trim() !== currentName ||
      profileData.email.trim().toLowerCase() !== currentEmail
    )
  }, [profileData.email, profileData.name, user?.email, user?.name])

  const canSaveProfile =
    Boolean(token) &&
    Boolean(profileData.name.trim()) &&
    Boolean(profileData.email.trim()) &&
    hasProfileChanges &&
    !isSavingProfile

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    if (!token) {
      showToast('You must be signed in to update your profile.', { type: 'error' })
      return
    }

    setIsSavingProfile(true)
    try {
      const response = await updateProfile(
        { name: profileData.name, email: profileData.email },
        token
      )
      dispatch(setUser({ user: response.data.user, token }))
      setProfileData({
        name: response.data.user?.name ?? '',
        email: response.data.user?.email ?? '',
      })
      showToast('Profile updated successfully.', { type: 'success' })
    } catch (err) {
      const message = getServerMessage(err, 'Unable to update your profile.')
      showToast(message, { type: 'error' })
    } finally {
      setIsSavingProfile(false)
    }
  }

  useEffect(() => {
    if (activeTab !== 'security') {
      setShowPasswordForm(false)
      setIsChangingPassword(false)
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    }
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'profile') {
      setIsDeleteModalOpen(false)
      setDeletePassword('')
      setShowDeletePassword(false)
      setIsDeletingAccount(false)
      setDeleteError('')
      if (deleteErrorTimeout) {
        clearTimeout(deleteErrorTimeout)
        setDeleteErrorTimeout(null)
      }
    }
  }, [activeTab, deleteErrorTimeout])

  const passwordRequirementState = useMemo(
    () =>
      PASSWORD_REQUIREMENTS.map((requirement) => ({
        ...requirement,
        isValid: requirement.test(passwordData.newPassword),
      })),
    [passwordData.newPassword]
  )

  const canSubmitPassword =
    Boolean(token) &&
    Boolean(passwordData.currentPassword) &&
    Boolean(passwordData.newPassword) &&
    Boolean(passwordData.confirmPassword) &&
    passwordData.newPassword === passwordData.confirmPassword &&
    passwordRequirementState.every((requirement) => requirement.isValid) &&
    !isChangingPassword

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!token) {
      showToast('You must be signed in to change your password.', { type: 'error' })
      return
    }

    const unmet = passwordRequirementState.filter((requirement) => !requirement.isValid)
    if (unmet.length) {
      const message = `Password must include ${unmet.map((requirement) => requirement.label).join(', ')}`
      showToast(message, { type: 'error' })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Passwords must match.', { type: 'error' })
      return
    }

    setIsChangingPassword(true)
    try {
      const response = await changePassword(
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
        },
        token
      )
      showToast(response.data?.message ?? 'Password updated successfully.', { type: 'success' })
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordForm(false)
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
    } catch (err) {
      const message = getServerMessage(err, 'Unable to change password.')
      showToast(message, { type: 'error' })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const hasPreferenceChanges = useMemo(() => {
    return String(currency || 'ETB').toUpperCase() !== String(user?.currency || 'ETB').toUpperCase()
  }, [currency, user?.currency])

  const canSavePreferences = Boolean(token) && hasPreferenceChanges && !isSavingPreferences

  const handlePreferencesSave = async () => {
    if (!token) {
      showToast('You must be signed in to update preferences.', { type: 'error' })
      return
    }

    setIsSavingPreferences(true)
    try {
      const response = await updateProfile({ currency }, token)
      dispatch(setUser({ user: response.data.user, token }))
      setCurrency(response.data.user?.currency ?? currency)
      showToast('Preferences updated successfully.', { type: 'success' })
    } catch (err) {
      const message = getServerMessage(err, 'Unable to update preferences.')
      showToast(message, { type: 'error' })
    } finally {
      setIsSavingPreferences(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!token) {
      showToast('You must be signed in to delete your account.', { type: 'error' })
      return
    }
    if (!deletePassword.trim()) {
      showToast('Password is required to delete your account.', { type: 'error' })
      return
    }

    setIsDeletingAccount(true)
    try {
      const response = await deleteAccount({ password: deletePassword }, token)
      showToast(response.data?.message ?? 'Account deleted successfully.', { type: 'success' })
      dispatch(clearUser())
      navigate('/signin')
      setIsDeleteModalOpen(false)
      setDeletePassword('')
      setShowDeletePassword(false)
    } catch (err) {
      const message = getServerMessage(err, 'Unable to delete your account.')
      showToast(message, { type: 'error' })
      setDeleteError(message)
      if (deleteErrorTimeout) {
        clearTimeout(deleteErrorTimeout)
      }
      const timeoutId = setTimeout(() => {
        setDeleteError('')
      }, 4000)
      setDeleteErrorTimeout(timeoutId)
    } finally {
      setIsDeletingAccount(false)
    }
  }

  return (
    <>
      <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30 sm:p-6"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-600/90 dark:text-emerald-300/90">
          Settings
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">Settings</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Manage your account preferences</p>
      </motion.div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Settings sections"
        className="flex w-full flex-wrap gap-2 rounded-2xl border border-slate-200/60 bg-white p-2 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
      >
        <button
          id="settings-tab-profile"
          type="button"
          role="tab"
          aria-selected={activeTab === 'profile'}
          aria-controls="settings-panel-profile"
          onClick={() => setActiveTab('profile')}
          className={[
            'rounded-xl px-4 py-2 text-sm font-semibold transition',
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-trackit-accent to-emerald-500 text-white shadow-lg shadow-emerald-500/30'
              : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/50',
          ].join(' ')}
        >
          Profile Info
        </button>
        <button
          id="settings-tab-security"
          type="button"
          role="tab"
          aria-selected={activeTab === 'security'}
          aria-controls="settings-panel-security"
          onClick={() => setActiveTab('security')}
          className={[
            'rounded-xl px-4 py-2 text-sm font-semibold transition',
            activeTab === 'security'
              ? 'bg-gradient-to-r from-trackit-accent to-emerald-500 text-white shadow-lg shadow-emerald-500/30'
              : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/50',
          ].join(' ')}
        >
          Security
        </button>
        <button
          id="settings-tab-preferences"
          type="button"
          role="tab"
          aria-selected={activeTab === 'preferences'}
          aria-controls="settings-panel-preferences"
          onClick={() => setActiveTab('preferences')}
          className={[
            'rounded-xl px-4 py-2 text-sm font-semibold transition',
            activeTab === 'preferences'
              ? 'bg-gradient-to-r from-trackit-accent to-emerald-500 text-white shadow-lg shadow-emerald-500/30'
              : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/50',
          ].join(' ')}
        >
          Preferences
        </button>
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              id="settings-panel-profile"
              role="tabpanel"
              aria-labelledby="settings-tab-profile"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
            >
              <div className="flex items-center gap-3 mb-6">
                <FiUser className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Profile Information</h2>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    className="w-full rounded-xl border border-slate-200/60 bg-white px-4 py-3 text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="w-full rounded-xl border border-slate-200/60 bg-white px-4 py-3 text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!canSaveProfile}
                  aria-busy={isSavingProfile}
                  className={`${getPrimaryButtonClass(!canSaveProfile)} w-auto px-6`}
                >
                  {isSavingProfile ? (
                    <>
                      <LoadingIndicator />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </form>

              <div className="mt-10 border-t border-slate-200/60 pt-6 dark:border-trackit-border/60">
                <div className="flex items-center gap-3">
                  <FiTrash2 className="h-5 w-5 text-rose-500" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    Delete account
                  </h3>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="mt-4 rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-700"
                >
                  Delete account
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              key="security"
              id="settings-panel-security"
              role="tabpanel"
              aria-labelledby="settings-tab-security"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
            >
              <div className="flex items-center gap-3 mb-6">
                <FiLock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Security</h2>
              </div>

              {!showPasswordForm ? (
                <button
                  type="button"
                  onClick={() => setShowPasswordForm(true)}
                  className="rounded-xl border border-slate-200/60 bg-white px-6 py-3 font-medium text-slate-900 transition hover:bg-slate-50 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50 dark:hover:bg-slate-800/50"
                >
                  Change Password
                </button>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Current password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="w-full rounded-xl border border-slate-200/60 bg-white px-4 py-3 pr-10 text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                      >
                        {showCurrentPassword ? (
                          <FiEyeOff className="h-4 w-4" />
                        ) : (
                          <FiEye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      New password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="w-full rounded-xl border border-slate-200/60 bg-white px-4 py-3 pr-10 text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                      >
                        {showNewPassword ? (
                          <FiEyeOff className="h-4 w-4" />
                        ) : (
                          <FiEye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <div className="mt-3 rounded-xl border border-slate-200/60 bg-white/60 p-4 dark:border-trackit-border/60 dark:bg-slate-900/40">
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">
                        Password requirements
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {passwordRequirementState.map((requirement) => (
                          <div key={requirement.id} className="flex items-center gap-2 text-sm">
                            {requirement.isValid ? (
                              <FiCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <FiX className="h-4 w-4 text-rose-500" />
                            )}
                            <span
                              className={
                                requirement.isValid
                                  ? 'text-slate-700 dark:text-slate-200'
                                  : 'text-slate-500 dark:text-slate-400'
                              }
                            >
                              {requirement.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Confirm new password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="w-full rounded-xl border border-slate-200/60 bg-white px-4 py-3 pr-10 text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      >
                        {showConfirmPassword ? (
                          <FiEyeOff className="h-4 w-4" />
                        ) : (
                          <FiEye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword ? (
                      <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">
                        Passwords do not match.
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={!canSubmitPassword}
                      aria-busy={isChangingPassword}
                      className={`${getPrimaryButtonClass(!canSubmitPassword)} w-auto px-6`}
                    >
                      {isChangingPassword ? (
                        <>
                          <LoadingIndicator />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false)
                        setIsChangingPassword(false)
                        setShowCurrentPassword(false)
                        setShowNewPassword(false)
                        setShowConfirmPassword(false)
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                      }}
                      className="rounded-xl border border-slate-200/60 bg-white px-6 py-3 font-medium text-slate-900 transition hover:bg-slate-50 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50 dark:hover:bg-slate-800/50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          )}

          {activeTab === 'preferences' && (
            <motion.div
              key="preferences"
              id="settings-panel-preferences"
              role="tabpanel"
              aria-labelledby="settings-tab-preferences"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm dark:border-trackit-border/60 dark:bg-slate-900/30"
            >
              <div className="flex items-center gap-3 mb-6">
                <FiGlobe className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Preferences</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Currency
                  </label>
                  <DropdownSelect
                    value={currency}
                    options={currencyOptions}
                    onChange={(next) => setCurrency(String(next))}
                    ariaLabel="Preferred currency"
                  />
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handlePreferencesSave}
                    disabled={!canSavePreferences}
                    aria-busy={isSavingPreferences}
                    className={`${getPrimaryButtonClass(!canSavePreferences)} w-auto px-6`}
                  >
                    {isSavingPreferences ? (
                      <>
                        <LoadingIndicator />
                        Saving...
                      </>
                    ) : (
                      'Save Preferences'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      </div>
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
            className="mx-4 w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl dark:border-trackit-border/70 dark:bg-slate-900/90"
          >
            <h3 id="delete-account-title" className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Delete account
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              This permanently deletes your account, transactions, and AI chat history. This action cannot be undone.
            </p>
            <div className="mt-5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Enter your password to confirm
              </label>
              <div className="relative">
                <input
                  type={showDeletePassword ? 'text' : 'password'}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/60 bg-white px-4 py-3 pr-10 text-slate-900 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-trackit-border/60 dark:bg-slate-900/60 dark:text-slate-50"
                />
                <button
                  type="button"
                  onClick={() => setShowDeletePassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  aria-label={showDeletePassword ? 'Hide password' : 'Show password'}
                >
                  {showDeletePassword ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {deleteError ? (
              <p className="mt-3 text-sm text-rose-600 dark:text-rose-400">{deleteError}</p>
            ) : null}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setDeletePassword('')
                  setShowDeletePassword(false)
                  setDeleteError('')
                  if (deleteErrorTimeout) {
                    clearTimeout(deleteErrorTimeout)
                    setDeleteErrorTimeout(null)
                  }
                }}
                className="rounded-2xl border border-slate-200/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 dark:border-transparent dark:bg-slate-800/60 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={!deletePassword.trim() || isDeletingAccount}
                aria-busy={isDeletingAccount}
                className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeletingAccount ? (
                  <>
                    <LoadingIndicator />
                    Deleting...
                  </>
                ) : (
                  'Delete account'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Settings
