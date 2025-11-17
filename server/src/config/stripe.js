import Stripe from 'stripe';

let stripeInstance = null;

export const initializeStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  
  if (!secretKey) {
    console.warn('⚠ Stripe secret key not configured - payment processing will be disabled');
    return null;
  }

  stripeInstance = new Stripe(secretKey, {
    apiVersion: '2024-04-10',
  });

  console.log('✓ Stripe initialized');
  return stripeInstance;
};

export const getStripeInstance = () => {
  if (!stripeInstance) {
    return initializeStripe();
  }
  return stripeInstance;
};

export default stripeInstance;
