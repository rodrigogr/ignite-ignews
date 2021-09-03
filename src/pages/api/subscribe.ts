/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from "next"
import { getSession } from 'next-auth/client' // Acessar usuário nos Cookies
import { fauna } from "../../services/fauna"
import { query as q } from 'faunadb'
import { stripe } from "../../services/stripe"

type User = {
    ref: {
        id: string
    },
    data: {
        stripe_customer_id: string;
    }
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') { // Verifica se o método da requisição é POST
        // Acessando o usuário no cookie da aplicação
        const session = await getSession({ req }) 

        const user = await fauna.query<User>(
            //1° Pesquisa o usuário pelo e-mail
            q.Get(
                q.Match(
                    q.Index('user_by_email'),
                    q.Casefold(session.user.email)
                )
            )
        )
        let customerId = user.data.stripe_customer_id;
        if(!customerId) {
            // Se não existir cria um customer no stripe.
            const stripeCustomer = await stripe.customers.create({
                email: session.user.email,
            })

         // Salva o usuário
            await fauna.query(
                q.Update(
                    q.Ref(q.Collection('users'), user.ref.id ),
                    {
                        data: { 
                            stripe_customer_id: stripeCustomer.id,
                        }
                    }
                )
            )
            customerId = stripeCustomer.id;
        }
       
        //Criando uma sessão no Stripe
        const stripeCheckoutSession = await stripe.checkout.sessions.create({
            customer: customerId, // Quem está comprando o serviço
            payment_method_types: ['card'], // Formas de pagamento
            //ou 'auto' onde configuro no painel do stripe
            line_items: [
                // items no carrinho
                { price: 'price_1JRikhFqyLyR3nu37DK3IDmG', quantity: 1}
            ],
            mode: 'subscription', // pagamento recorrente e não única vez
            allow_promotion_codes: true, // Permite cupoms de desconto
            // Redireciona quando a requisição foi um successo
            success_url: process.env.STRIPE_SUCCESS_URL,
            // Redireciona quando o usuário cancela a requisição 
            cancel_url: process.env.STRIPE_CANCEL_URL,
        })
        return res.status(200).json({ sessionId: stripeCheckoutSession.id})

    } else { // Se o método da requisição não for POST
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allowed')
    }
}