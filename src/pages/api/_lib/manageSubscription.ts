import { fauna } from "../../../services/fauna";
import {query as q } from 'faunadb';
import { stripe } from "../../../services/stripe";


export async function saveSubscription(
    subscriptionId: string,
    customerId: string,
    createAction = false,
) {
    // Buscar o usuário no basco do FaunaDb com o ID { customerId }
    // Salvar os dados da subscription no FaunaDB
    const userRef = await fauna.query(
       // Selecionar campos esqpecificos
       q.Select(
           "ref", // Qual campo quero
           q.Get(
            q.Match(
                // Busque se user_by_stripe_customer_id for igual a customerId
                q.Index('user_by_stripe_customer_id'),
                customerId
            )
        )
       )
    )
// Obter detalhes da subscription dop usuário
// No webhook o stripe só vai enviar o id da subscription e não todos os dados
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    // Salvar no banco de dados a subscription inteira ou
    // Salvar só dados que definirmos como abaixo.
    const subscriptionData = {
        id: subscription.id,
        userId: userRef,
        status: subscription.status,
        price_id: subscription.items.data[0].price.id, // 1ª posição pq o 
        //usuário vai comprar um produto por vez
    }
    if (createAction) {
        await fauna.query(
            q.Create(
                q.Collection('subscriptions'),
                { data: subscriptionData }
            )
        )
    } else {
        await fauna.query(
            // Update() ou Replace() atualiza um registro no fauna
            // Update() atualiza determinados campos Replace() substitui tudo
            q.Replace(
                q.Select(
                    "ref",
                    q.Get(
                        q.Match(
                            q.Index('subscription_by_id'),
                            subscriptionId
                        )
                    )
                ),
                { data: subscriptionData } // Quais dados quero atualizar
            )
        )
    }
}