/* eslint-disable import/no-anonymous-default-export */
import { NextApiRequest, NextApiResponse } from "next";
import { Readable } from "stream";
import Stripe from "stripe";
import { stripe } from "../../services/stripe";
import { saveSubscription } from "./_lib/manageSubscription";

//Não precisa decorar, código copiado
// Cada vez que pegamos um valor da requisição, armazenamos no array chunks. 
async function buffer(readable: Readable) {
    const chunks = []; // pedaços da string

    for await (const chunk of readable ){
        chunks.push(
            typeof chunk === "string" ? Buffer.from(chunk) : chunk
        );
    }
    // Concatena todos os chunks e converte em buffer.
    return Buffer.concat(chunks);
}
// Precisamos exportar no Next uma config, como a requisição nesse caso está em 
// formato stream (readable), precisamos desabilitar o entendimento padrão do 
// Next para as requisições como Json, envio de formulário, etc.
export const config = {
    api: {
        bodyParser: false
    }
}
// Determinar quais eventos são relevantes para nós.
const relevantEvents = new Set([
    // O checkout.session.completed e customer.subscription.created acabam 
    // criando um cliente cada. Gerando assim dois registros iguais. 
    // Para resolver isso existem duas formas.
    // 1ª Se a única forma de assinar nossa aplicação for em nosso site, não
    // precisamos ouvir o evento customer.subscription.created.
    // 2ª Se existir mais formas de assinar o produto teremos que fazer um if na
    //query do fauna, se existir não cria.
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
])

export default async(req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'POST') {
        // buf recebe os dados da requisição
        const buf = await buffer(req); // req é um Readable por padrão
        // Pego na documentação
        const secret = req.headers['stripe-signature'];

        let event: Stripe.Event; // Eventos que vem do webhook
        try {
            event = stripe.webhooks.constructEvent(buf, secret, process.env.STRIPE_WEBHOOK_SECRET);
        } catch(err) {
            return res.status(400).send(`Webhook error: ${err.message}`);
        }

        const { type } = event; // ou const type = event.type;
        if (relevantEvents.has(type)) {
            try {
                switch (type) {
                    // As três verificações caem na mesma lógica a seguir 
                    case 'customer.subscription.updated':
                    case 'customer.subscription.deleted':

                        const subscription = event.data.object as Stripe.Subscription;

                        await saveSubscription(
                            subscription.id,
                            subscription.customer.toString(),
                            // True caso seja customer.subscription.created
                            false
                        )

                        break;
                    case 'checkout.session.completed':
                        const checkoutSession = event.data.object as Stripe.Checkout.Session;
                        await saveSubscription(
                            checkoutSession.subscription.toString(),
                            checkoutSession.customer.toString(),
                            true
                        )
                        break;
                    default:
                        throw new Error('Unhandled event.');
                }
            } catch (err) {
                return res.json({ error: 'Webhook handler failed.'})
            }
            
            
        }

        res.json({ received: true} ); // status (200) já é o padrão quando json
    } else { // Se o método da requisição não for POST
        res.setHeader('Allow', 'POST')
        res.status(405).end('Method not allowed')
    }
}