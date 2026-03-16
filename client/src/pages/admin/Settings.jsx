import React, { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FiBell, FiLock, FiSave, FiSliders, FiZap } from 'react-icons/fi'
import { useToast } from '../../components/ui/ToastProvider.jsx'

const settingsVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

const Toggle = ({ label, description, checked, onChange }) => (
  <div className="flex items-start justify-between gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-trackit-border dark:bg-slate-950">
    <div>
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{label}</p>
      {description ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{description}</p> : null}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        'relative h-8 w-14 rounded-full border transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-300',
        checked
          ? 'border-emerald-500 bg-emerald-500/90'
          : 'border-slate-300 bg-white dark:border-trackit-border dark:bg-slate-900/50',
      ].join(' ')}
      aria-pressed={checked}
    >
      <span
        className={[
          'absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-white shadow transition',
          checked ? 'left-7' : 'left-1',
        ].join(' ')}
      />
    </button>
  </div>
)

const Field = ({ label, hint, children }) => (
  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-trackit-border dark:bg-slate-950">
    <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{label}</p>
    {hint ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{hint}</p> : null}
    <div className="mt-4">{children}</div>
  </div>
)

const Settings = () => {
  const { showToast } = useToast()

  const initial = useMemo(
    () => ({
      security: {
        requireMfaForAdmins: false,
        lockoutEnabled: false,
        passwordPolicy: 'basic',
      },
      notifications: {
        incidentEmails: 'none',
        weeklyDigest: false,
      },
      product: {
        publicSignup: false,
        aiAssistant: false,
        maintenanceMode: false,
      },
      data: {
        retentionDays: 30,
        allowUserDeletion: false,
      },
    }),
    []
  )

  const [config, setConfig] = useState(initial)
  const [isSaving, setSaving] = useState(false)

  const update = (sectionKey, fieldKey, value) => {
    setConfig((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        [fieldKey]: value,
      },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await new Promise((r) => setTimeout(r, 500))
      showToast('Saved settings (mock). Wire this to backend endpoints next.', { type: 'success' })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setConfig(initial)
    showToast('Reset to defaults (mock).', { type: 'success' })
  }

  const inputClasses =
    'w-full rounded-xl border border-slate-200/60 bg-white px-4 py-3 text-sm font-semibold text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-trackit-border/60 dark:bg-slate-950 dark:text-slate-100'

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
    >
      <motion.section
        className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30"
        variants={settingsVariant}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Settings</p>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">Platform configuration (mock)</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Configure security, alerts, feature flags, and data retention.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleReset}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-trackit-border dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900/40"
            >
              Reset
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-trackit-accent to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/35 transition disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FiSave className="h-4 w-4" />
              {isSaving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      </motion.section>

      <motion.section className="grid gap-6 lg:grid-cols-2" variants={settingsVariant}>
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Security</p>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Access and policies</h3>
            </div>
            <FiLock className="h-5 w-5 text-emerald-500 dark:text-emerald-300" />
          </div>
          <div className="mt-6 space-y-4">
            <Toggle
              label="Require MFA for admins"
              description="Protect privileged accounts by requiring MFA enrollment."
              checked={config.security.requireMfaForAdmins}
              onChange={(v) => update('security', 'requireMfaForAdmins', v)}
            />
            <Toggle
              label="Enable login lockout"
              description="Temporarily lock accounts after repeated failed logins."
              checked={config.security.lockoutEnabled}
              onChange={(v) => update('security', 'lockoutEnabled', v)}
            />
            <Field label="Password policy" hint="Choose the minimum password strength for sign-ups and resets.">
              <select
                value={config.security.passwordPolicy}
                onChange={(e) => update('security', 'passwordPolicy', e.target.value)}
                className={inputClasses}
              >
                <option value="basic">Basic</option>
                <option value="strong">Strong (recommended)</option>
                <option value="strict">Strict</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Notifications</p>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Alerts and digests</h3>
            </div>
            <FiBell className="h-5 w-5 text-emerald-500 dark:text-emerald-300" />
          </div>
          <div className="mt-6 space-y-4">
            <Field label="Incident emails" hint="Control which incidents generate email notifications.">
              <select
                value={config.notifications.incidentEmails}
                onChange={(e) => update('notifications', 'incidentEmails', e.target.value)}
                className={inputClasses}
              >
                <option value="none">Off</option>
                <option value="high">High only</option>
                <option value="medium">Medium + High</option>
                <option value="all">All</option>
              </select>
            </Field>
            <Toggle
              label="Weekly digest"
              description="Send a weekly platform summary to admins."
              checked={config.notifications.weeklyDigest}
              onChange={(v) => update('notifications', 'weeklyDigest', v)}
            />
          </div>
        </div>
      </motion.section>

      <motion.section className="grid gap-6 lg:grid-cols-2" variants={settingsVariant}>
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Feature flags</p>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Ship safely</h3>
            </div>
            <FiZap className="h-5 w-5 text-emerald-500 dark:text-emerald-300" />
          </div>
          <div className="mt-6 space-y-4">
            <Toggle
              label="Public sign-up"
              description="Allow new users to register without an invite."
              checked={config.product.publicSignup}
              onChange={(v) => update('product', 'publicSignup', v)}
            />
            <Toggle
              label="AI assistant"
              description="Enable the AI assistant page in the user dashboard."
              checked={config.product.aiAssistant}
              onChange={(v) => update('product', 'aiAssistant', v)}
            />
            <Toggle
              label="Maintenance mode"
              description="Temporarily block user sign-in and show a maintenance banner."
              checked={config.product.maintenanceMode}
              onChange={(v) => update('product', 'maintenanceMode', v)}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm shadow-black/5 dark:border-trackit-border dark:bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Data</p>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Retention and deletion</h3>
            </div>
            <FiSliders className="h-5 w-5 text-emerald-500 dark:text-emerald-300" />
          </div>
          <div className="mt-6 space-y-4">
            <Field label="Retention window (days)" hint="How long to retain audit logs and operational records.">
              <input
                type="number"
                min={30}
                max={3650}
                value={config.data.retentionDays}
                onChange={(e) =>
                  update('data', 'retentionDays', Number.parseInt(e.target.value, 10) || 0)
                }
                className={inputClasses}
              />
            </Field>
            <Toggle
              label="Allow user-initiated deletion"
              description="Expose a self-serve account deletion option to end users."
              checked={config.data.allowUserDeletion}
              onChange={(v) => update('data', 'allowUserDeletion', v)}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Note: This is UI-only for now; wire to backend config endpoints next.
            </p>
          </div>
        </div>
      </motion.section>
    </motion.div>
  )
}

export default Settings
