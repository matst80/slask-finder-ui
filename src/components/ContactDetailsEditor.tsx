import { ChevronDown, ChevronUp, Pencil } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useCheckout, useSetContactDetails } from '../hooks/checkoutHooks'
import { ContactDetails } from '../lib/datalayer/checkout-api'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'

export const ContactDetailsEditor = () => {
  const { data: checkout } = useCheckout()
  const { trigger: saveContactDetails, isMutating } = useSetContactDetails()

  const [formData, setFormData] = useState<ContactDetails>({
    email: '',
    phone: '',
    name: '',
    postalCode: '',
  })

  const [isDirty, setIsDirty] = useState(false)

  const isReadOnly = (checkout?.paymentInProgress ?? 0) > 0

  const hasContactDetails = useMemo(() => {
    const cd = checkout?.contactDetails
    return !!(cd?.email || cd?.phone || cd?.name || cd?.postalCode)
  }, [checkout?.contactDetails])

  // Default open if no contact details filled
  const [isExpanded, setIsExpanded] = useState(!hasContactDetails)

  // Update expanded state when hasContactDetails changes (e.g., after initial load)
  useEffect(() => {
    if (!hasContactDetails) {
      setIsExpanded(true)
    }
  }, [hasContactDetails])

  // Sync form with checkout data when it loads
  useEffect(() => {
    if (checkout?.contactDetails) {
      setFormData({
        email: checkout.contactDetails.email ?? '',
        phone: checkout.contactDetails.phone ?? '',
        name: checkout.contactDetails.name ?? '',
        postalCode: checkout.contactDetails.postalCode ?? '',
      })
    }
  }, [checkout?.contactDetails])

  const handleChange =
    (field: keyof ContactDetails) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }))
      setIsDirty(true)
    }

  const handleSave = async () => {
    // Only send non-empty fields
    const payload: ContactDetails = {}
    if (formData.email) payload.email = formData.email
    if (formData.phone) payload.phone = formData.phone
    if (formData.name) payload.name = formData.name
    if (formData.postalCode) payload.postalCode = formData.postalCode

    await saveContactDetails(payload)
    setIsDirty(false)
    setIsExpanded(false)
  }

  const contactDetails = checkout?.contactDetails

  // Collapsed read-only view
  const CollapsedView = () => (
    <div className="flex items-center justify-between">
      <div className="text-sm text-gray-600">
        {contactDetails?.name && <span>{contactDetails.name}</span>}
        {contactDetails?.email && (
          <span className="ml-2">{contactDetails.email}</span>
        )}
        {contactDetails?.phone && (
          <span className="ml-2">{contactDetails.phone}</span>
        )}
        {contactDetails?.postalCode && (
          <span className="ml-2">{contactDetails.postalCode}</span>
        )}
        {!hasContactDetails && (
          <span className="text-gray-400 italic">No contact details</span>
        )}
      </div>
      {!isReadOnly && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="ml-2"
        >
          <Pencil className="size-4" />
        </Button>
      )}
    </div>
  )

  // Read-only expanded view (when payment in progress)
  const ReadOnlyView = () => (
    <div className="space-y-3 text-sm">
      {contactDetails?.name && (
        <div>
          <span className="font-medium text-gray-500">Name:</span>{' '}
          {contactDetails.name}
        </div>
      )}
      {contactDetails?.email && (
        <div>
          <span className="font-medium text-gray-500">Email:</span>{' '}
          {contactDetails.email}
        </div>
      )}
      {contactDetails?.phone && (
        <div>
          <span className="font-medium text-gray-500">Phone:</span>{' '}
          {contactDetails.phone}
        </div>
      )}
      {contactDetails?.postalCode && (
        <div>
          <span className="font-medium text-gray-500">Postal Code:</span>{' '}
          {contactDetails.postalCode}
        </div>
      )}
    </div>
  )

  // Editable form view
  const EditableForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contact-name">Name</Label>
        <Input
          id="contact-name"
          type="text"
          placeholder="Full name"
          value={formData.name}
          onChange={handleChange('name')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          type="email"
          placeholder="email@example.com"
          value={formData.email}
          onChange={handleChange('email')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-phone">Phone</Label>
        <Input
          id="contact-phone"
          type="tel"
          placeholder="+46 70 123 45 67"
          value={formData.phone}
          onChange={handleChange('phone')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-postalCode">Postal Code</Label>
        <Input
          id="contact-postalCode"
          type="text"
          placeholder="123 45"
          value={formData.postalCode}
          onChange={handleChange('postalCode')}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={handleSave} disabled={isMutating || !isDirty}>
          {isMutating ? 'Saving...' : 'Save'}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setFormData({
              email: checkout?.contactDetails?.email ?? '',
              phone: checkout?.contactDetails?.phone ?? '',
              name: checkout?.contactDetails?.name ?? '',
              postalCode: checkout?.contactDetails?.postalCode ?? '',
            })
            setIsDirty(false)
            if (hasContactDetails) {
              setIsExpanded(false)
            }
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  )

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <button
        className="flex items-center justify-between w-full text-left"
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        <h3 className="font-semibold text-lg">Contact Details</h3>
        {isExpanded ? (
          <ChevronUp className="size-5 text-gray-500" />
        ) : (
          <ChevronDown className="size-5 text-gray-500" />
        )}
      </button>

      <div className="mt-4">
        {!isExpanded ? (
          <CollapsedView />
        ) : isReadOnly ? (
          <ReadOnlyView />
        ) : (
          <EditableForm />
        )}
      </div>
    </div>
  )
}
