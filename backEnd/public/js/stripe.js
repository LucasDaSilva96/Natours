var stripe = Stripe(
  'pk_test_51OxxnrLF8bVK9sNB77xKNhVK4UZT3Q92gkvoZlGBnUYnvPuxwQTrATF9gNmXxpuUBUN0vFCNB6IqSXwabjCsdyMY00mFKicbyE'
);

import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from endpoint/API
    const session = await axios(
      `http://localhost:8000/api/v1/booking/checkout-session/${tourId}`
    );

    // 2) Create checkout from + process/charge credit card
    await stripe.redirectToCheckout({ sessionId: session.data.session.id });
  } catch (err) {
    showAlert(err.message);
  }
};
