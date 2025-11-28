import { CoreConfiguration } from '@adyen/adyen-web'

export const adyenConfig: Partial<CoreConfiguration> = {
  clientKey: 'test_M6LOH6NGD5DA5ATLXYXD7M432IME5URR',
  environment: 'test',
  locale: 'en_US',
  countryCode: 'NL',
  showPayButton: true,
}
export const paymentMethodsConfiguration = {
  card: {
    showBrandIcon: true,
    hasHolderName: true,
    holderNameRequired: true,
    placeholders: {
      cardNumber: '1234 5678 9012 3456',
      expiryDate: 'MM/YY',
      securityCodeThreeDigits: '123',
      securityCodeFourDigits: '1234',
      holderName: 'J. Smith',
    },
  },
}
