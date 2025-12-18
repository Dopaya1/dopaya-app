import { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentFormProps {
  clientSecret: string;
  totalAmount: number;
  projectTitle: string;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Inner Payment Form Component
 * Has access to Stripe context via Elements wrapper
 */
function PaymentFormInner({ 
  totalAmount, 
  projectTitle,
  onSuccess, 
  onCancel 
}: Omit<PaymentFormProps, 'clientSecret'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error('[Payment] Stripe not loaded');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      console.log('[Payment] Confirming payment...');
      
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href, // Fallback only
        },
        redirect: 'if_required', // CRITICAL: Stay on page!
      });

      if (error) {
        console.error('[Payment] Error:', error);
        setErrorMessage(error.message || 'Payment failed. Please try again.');
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('[Payment] ✅ Success!', paymentIntent.id);
        onSuccess();
      } else {
        console.error('[Payment] Unexpected status:', paymentIntent?.status);
        setErrorMessage('Payment status unclear. Please contact support.');
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('[Payment] Exception:', err);
      setErrorMessage(err.message || 'An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Project Info */}
      <div className="text-center pb-4 border-b border-gray-200">
        <p className="text-sm text-gray-600">Supporting</p>
        <p className="text-lg font-semibold text-gray-900">{projectTitle}</p>
        <p className="text-2xl font-bold text-[#f2662d] mt-2">
          ${totalAmount.toFixed(2)}
        </p>
      </div>

      {/* Stripe Payment Element */}
      <div className="min-h-[200px]">
        <PaymentElement 
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay']
          }}
        />
      </div>

      {/* Legal Info: Impaktera & Withdrawal Right */}
      <div className="text-xs bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-gray-700 leading-relaxed">
          ℹ️ Your payment goes to <strong className="text-gray-900">Impaktera</strong>{' '}
          (Swiss nonprofit), which allocates funds to {projectTitle}. 
          You have a 14-day withdrawal right.{' '}
          <a 
            href="https://impaktera.org/terms" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#f2662d] underline hover:text-[#d44d1a]"
          >
            View Terms
          </a>
        </p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-[#FFC107] hover:bg-[#FFD54F] text-gray-900 font-semibold"
          style={{ backgroundColor: "#FFC107" }}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${totalAmount.toFixed(2)}`
          )}
        </Button>
      </div>

      {/* Security Badge */}
      <p className="text-xs text-center text-gray-500">
        🔒 Secured by Stripe • Your payment information is encrypted
      </p>
    </form>
  );
}

/**
 * Outer Component - Wraps form in Stripe Elements Provider
 */
export function EmbeddedPaymentForm({ 
  clientSecret, 
  totalAmount, 
  projectTitle,
  onSuccess, 
  onCancel 
}: PaymentFormProps) {
  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#f2662d',
        borderRadius: '8px',
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentFormInner 
        totalAmount={totalAmount}
        projectTitle={projectTitle}
        onSuccess={onSuccess} 
        onCancel={onCancel} 
      />
    </Elements>
  );
}

