import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react'
import { useEffect } from 'react'
import { useLoaderData, useSearchParams } from 'react-router-dom'
import { ButtonAnchor, ButtonLink } from '../components/ui/button'

type KnownStatus = 'success' | 'pending' | 'received' | 'error' | 'failed'
type StatusTone = 'positive' | 'warning' | 'danger' | 'neutral'

type StatusPresentation = {
  statusLabel: string
  icon: LucideIcon
  accent: string
  tone: StatusTone
  title: string
  message: string
  checklist?: string[]
  docsCta?: {
    label: string
    href: string
  }
  secondaryCta?: {
    label: string
    to: string
  }
  displayReason?: boolean
}

type ToneVisuals = {
  glow: string
  checklistIconColor: string
  reasonCard: string
  reasonIconColor: string
}

const STATUS_PRESENTATION: Record<KnownStatus | 'unknown', StatusPresentation> =
  {
    success: {
      statusLabel: 'Authorised',
      icon: CheckCircle2,
      tone: 'positive',
      accent: 'from-emerald-500/90 to-emerald-400/60',
      title: 'Payment confirmed',
      message:
        'Your payment has been authorised successfully. You can continue browsing while we prepare your order.',
      checklist: [
        'A confirmation email with your receipt is on its way.',
        'You can review the order from your account at any time.',
      ],
    },
    pending: {
      statusLabel: 'Pending',
      icon: Clock3,
      tone: 'warning',
      accent: 'from-amber-400/90 to-orange-500/60',
      title: 'Payment is still processing',
      message:
        'We have received your payment request and are waiting for your provider to confirm the transaction. This usually only takes a moment.',
      checklist: [
        'You can leave this page open while we finalise the payment.',
        'If nothing changes within a few minutes, contact support with your order reference.',
      ],
    },
    received: {
      statusLabel: 'Received',
      icon: Clock3,
      tone: 'warning',
      accent: 'from-amber-400/90 to-orange-500/60',
      title: 'Payment received',
      message:
        'We have received the payment details and are validating them with your provider right now.',
      checklist: [
        'We will send you an update as soon as the payment clears.',
        'If you close this page, you can always return via the confirmation email.',
      ],
    },
    error: {
      statusLabel: 'Error',
      icon: AlertCircle,
      tone: 'danger',
      accent: 'from-rose-500/90 to-red-600/60',
      title: 'Payment could not be completed',
      message:
        'Something prevented us from finalising your payment. No funds were captured and your order was not created.',
      checklist: [
        'Verify your payment details and try again.',
        'If the issue persists, contact your bank or try a different payment method.',
      ],
      docsCta: {
        label: 'Adyen response handling guide',
        href: 'https://docs.adyen.com/development-resources/response-handling',
      },
      secondaryCta: {
        label: 'Try again',
        to: '/checkout',
      },
      displayReason: true,
    },
    failed: {
      statusLabel: 'Failed',
      icon: AlertCircle,
      tone: 'danger',
      accent: 'from-rose-500/90 to-red-600/60',
      title: 'Payment failed',
      message:
        'The payment was declined by your provider or timed out before completion. You can safely initiate a new payment.',
      checklist: [
        'Double-check the information you entered and submit the payment again.',
        'If you believe this is an error, contact customer support with your reference.',
      ],
      docsCta: {
        label: 'Adyen response handling guide',
        href: 'https://docs.adyen.com/development-resources/response-handling',
      },
      secondaryCta: {
        label: 'Return to checkout',
        to: '/checkout',
      },
      displayReason: true,
    },
    unknown: {
      statusLabel: 'Unknown',
      icon: HelpCircle,
      tone: 'neutral',
      accent: 'from-sky-500/80 to-indigo-500/60',
      title: 'We couldn’t determine the payment status',
      message:
        'The payment status was not recognised. Refresh this page or head back to the checkout to try again.',
      checklist: [
        'Reload this page or reopen the checkout session.',
        'Reach out to support and provide your order reference for assistance.',
      ],
      docsCta: {
        label: 'Adyen response handling guide',
        href: 'https://docs.adyen.com/development-resources/response-handling',
      },
      displayReason: true,
    },
  }

const TONE_VISUALS: Record<StatusTone, ToneVisuals> = {
  positive: {
    glow: 'from-emerald-500/20 via-emerald-400/10 to-transparent',
    checklistIconColor: 'text-emerald-200',
    reasonCard: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
    reasonIconColor: 'text-emerald-200',
  },
  warning: {
    glow: 'from-amber-400/25 via-orange-400/10 to-transparent',
    checklistIconColor: 'text-amber-200',
    reasonCard: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    reasonIconColor: 'text-amber-200',
  },
  danger: {
    glow: 'from-rose-500/25 via-red-500/15 to-transparent',
    checklistIconColor: 'text-rose-200',
    reasonCard: 'border-rose-400/40 bg-rose-500/10 text-rose-100',
    reasonIconColor: 'text-rose-200',
  },
  neutral: {
    glow: 'from-sky-500/25 via-indigo-500/15 to-transparent',
    checklistIconColor: 'text-sky-200',
    reasonCard: 'border-sky-400/30 bg-sky-500/10 text-sky-100',
    reasonIconColor: 'text-sky-200',
  },
}

const BULLET_ICONS: Record<StatusTone, LucideIcon> = {
  positive: CheckCircle2,
  warning: Clock3,
  danger: AlertCircle,
  neutral: HelpCircle,
}

const isKnownStatus = (value: string): value is KnownStatus => {
  return ['success', 'pending', 'received', 'error', 'failed'].includes(
    value as KnownStatus,
  )
}

export const AdyenReturn = () => {
  const rawStatus = useLoaderData() as string | undefined
  const normalizedStatus = (rawStatus ?? '').toLowerCase()
  const statusKey = isKnownStatus(normalizedStatus)
    ? normalizedStatus
    : 'unknown'
  const presentation =
    STATUS_PRESENTATION[statusKey as keyof typeof STATUS_PRESENTATION]
  const [searchParams] = useSearchParams()
  const reason = searchParams.get('reason')?.trim()
  const showReason = Boolean(presentation.displayReason && reason)
  const toneVisual = TONE_VISUALS[presentation.tone]
  const Icon = presentation.icon
  const BulletIcon = BULLET_ICONS[presentation.tone]
  const ReasonIcon = presentation.tone === 'danger' ? AlertCircle : HelpCircle

  useEffect(() => {
    document.title = `${presentation.title} • Adyen payment`
  }, [presentation.title])

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-gradient-to-b from-slate-800 via-slate-900 to-transparent opacity-70" />
      <div
        className={`pointer-events-none absolute left-1/2 top-0 h-[620px] w-[620px] -translate-x-1/2 bg-gradient-to-br ${toneVisual.glow} opacity-80 blur-3xl`}
      />
      <div className="relative mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center px-6 pb-20 pt-32 sm:px-10">
        <div className="w-full rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_48px_120px_-60px_rgba(15,23,42,0.9)] backdrop-blur-xl sm:p-12">
          <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-5">
              <div
                className={`rounded-2xl bg-gradient-to-br ${presentation.accent} p-4 text-white shadow-lg shadow-black/40`}
              >
                <Icon className="h-10 w-10" />
              </div>
              <div className="space-y-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-white/70">
                  <span>Payment status</span>
                  <span className="text-white/90">
                    {presentation.statusLabel}
                  </span>
                </span>
                <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                  {presentation.title}
                </h1>
                <p className="text-base leading-relaxed text-white/80 sm:text-lg">
                  {presentation.message}
                </p>
              </div>
            </div>
          </header>

          {presentation.checklist && presentation.checklist.length > 0 && (
            <ul className="mt-8 grid gap-4 text-base text-white/80">
              {presentation.checklist.map((item) => {
                return (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className={`mt-[0.15rem] rounded-full bg-white/10 p-1 ${toneVisual.checklistIconColor}`}
                    >
                      <BulletIcon className="h-4 w-4" />
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                )
              })}
            </ul>
          )}

          {showReason && (
            <div
              className={`mt-8 flex items-start gap-3 rounded-2xl border px-5 py-4 text-sm leading-relaxed shadow-inner ${toneVisual.reasonCard}`}
            >
              <ReasonIcon
                className={`mt-0.5 h-5 w-5 shrink-0 ${toneVisual.reasonIconColor}`}
              />
              <div>
                <p className="font-semibold tracking-wide">
                  Additional details
                </p>
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">
                  {reason}
                </p>
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink
              to="/"
              size="lg"
              className="shadow-lg shadow-blue-950/30"
            >
              Return home
            </ButtonLink>
            {presentation.secondaryCta && (
              <ButtonLink
                to={presentation.secondaryCta.to}
                variant="outline"
                className="border-white/30 bg-white/10 text-white hover:bg-white/15"
              >
                {presentation.secondaryCta.label}
              </ButtonLink>
            )}
            {presentation.docsCta && (
              <ButtonAnchor
                variant="outline"
                size="default"
                to={presentation.docsCta.href}
                target="_blank"
                rel="noreferrer"
                className="border-white/20 text-white hover:bg-white/15"
              >
                {presentation.docsCta.label}
              </ButtonAnchor>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
