import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Appearance, loadStripe, Stripe, StripeElementsOptions } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "./CheckoutForm";
import { LargeSpinner } from "./spinners";

type CheckoutProps = {
    // Consider adding in the Stripe promise here to reduce load time
    setBeginUpload: Dispatch<SetStateAction<boolean>>,
    purchasePriceInCents: number
}


export default function Checkout(props: CheckoutProps) {
    const [clientSecret, setClientSecret] = useState("");
    const [loading, setLoading] = useState(true);
    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

    useEffect(() => {
        // Create PaymentIntent as soon as the page loads
        fetch("/api/payments/create-payment-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: props.purchasePriceInCents }),
        })
            .then((res) => res.json())
            .then((data) => {
                setClientSecret(data.clientSecret);
            });
    }, [props.purchasePriceInCents]);

    const appearance: Appearance = {
        theme: 'stripe',
    };
    const options: StripeElementsOptions = {
        clientSecret,
        appearance,
    };

    return (
        <>
            {clientSecret ? (
                <Elements options={options} stripe={stripePromise}>
                    <CheckoutForm
                        setBeginUpload={props.setBeginUpload}
                        setCheckoutComponentLoading={setLoading}
                    />
                </Elements>
            ) : (
                <LargeSpinner />
            )
        }
        </>
    );
}