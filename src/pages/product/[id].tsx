import Image from "next/future/image";
import { ImageContainer, ProductContainer, ProductDetails } from "../../styles/pages/product";

import { GetStaticPaths, GetStaticProps } from "next";
import Stripe from "stripe";
import teste from '../../assets/camisetas/1.png';
import { stripe } from "../../lib/stripe";
import axios from "axios";
import { useState } from "react";

type ProductObj = {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  description: string;
  defaultPriceId: string;
}

interface ProductProps {
  product:ProductObj,
}

export default function Product({ product }: ProductProps) {
  const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false)

  const handlerBuyProduct = async () => {
    try {
      setIsCreatingCheckoutSession(true);
      const response = await axios.post('/api/checkout', {
        priceId: product.defaultPriceId,
      })

      const { checkoutUrl } = response.data;

      window.location.href = checkoutUrl;
    } catch (error) {
      setIsCreatingCheckoutSession(false);

      alert('Falha ao redirecionar ao checkout!')
    }
  }

  return (
   <ProductContainer>
    <ImageContainer>
      <Image alt="" src={product.imageUrl} width={520} height={480}  />
    </ImageContainer>

    <ProductDetails>
      <h1>{product.name}</h1>
      <span>{product.price}</span>

      <p>{product.description}</p>
    
      <button disabled={isCreatingCheckoutSession} onClick={handlerBuyProduct}>
        Comprar agora
      </button>
    </ProductDetails>
   </ProductContainer>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
      paths: [
        {
          params: {id: 'prod_MbjJqMZZvgfvh9'}
        }
      ],
      fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {
  const product = await stripe.products.retrieve(params.id, {
    expand: ['default_price'],
  })

  const price = product.default_price as  Stripe.Price

    return {
      props: {
        product: {
          id: product.id,
          name: product.name,
          imageUrl: product.images[0],
          description: product.description,
          price: new Intl.NumberFormat('pt-BR', { 
            style: 'currency',
            currency: 'BRL',
           }).format(price.unit_amount / 100),
           defaultPriceId: price.id,
        },
      },
      revalidate: 60 * 60 * 2, // 2 hours
    }
}
