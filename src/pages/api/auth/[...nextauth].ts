import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import { query as q } from 'faunadb'
import { fauna } from '../../../services/fauna'

export default NextAuth({
  // Configure one or more authentication providers
  //Exemplo do Github
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      scope: 'read:user' // Quais informações desejo ter acesso do usuário
    }),
  ],
   callbacks: {
    async signIn(user, account, profile) {
      //Inserção no Banco
      const { email } = user;
      try {
        // O Faunadb possui vários métodos, como if, map, se existe, etc.
        // Sintaxe FQL
        await fauna.query(
          // Se 
         q.If(
           //não existe o usuário
           q.Not(
             q.Match(
               // procurar o usuário de pelo índice
               q.Index('user_by_email'),
               q.Casefold(user.email)
             )
           ),
           // Insere usuário se não existir
           q.Create(
            q.Collection('users'), // Nome da tabela
            { data: { email } } // Informação que desejo guardar
          ),
          // Busca usuário se existir
          q.Get(
            q.Match(
              q.Index('user_by_email'),
               q.Casefold(user.email)
            )
          )
         )
        )
        //return true
      } 
      finally {
        return true // Evitará que o usuário faça login se a aplicação não 
        //interagir com o BD
      }
    },
  }
})