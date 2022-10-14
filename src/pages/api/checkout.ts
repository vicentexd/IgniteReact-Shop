import { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "../../lib/stripe";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
  const priceId = 'price_1LsVp2Bd5OW7qCTTMUUEgl5T';

  const success_url = `${process.env.NEXT_URL}/success`;
  const cancel_url = `${process.env.NEXT_URL}/`;
 
  const  checkoutSession = await stripe.checkout.sessions.create({
  mode: 'payment',
  success_url,
  cancel_url,
  line_items: [
    {
      price: priceId,
      quantity: 1,
    }
  ]
 });

 return res.status(201).json({
  checkoutUrl: checkoutSession.url
 })
}