import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Legacy route from the Stripe paywall era. Paywall has been removed for
 * App Store v1, so this page can no longer grant `has_paid` (that would be a
 * trivial revenue bypass — any logged-in user could navigate here directly).
 * It now just redirects home.
 */
export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  return null;
}
