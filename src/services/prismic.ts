import Prismic from '@prismicio/client'

// Seguindo a documentação do Prismic
export function getPrismicClient(req?: unknown) {
    const prismic = Prismic.client(
        process.env.PRISMIC_ENDPOINT,
        {
            req,
            accessToken: process.env.PRISMIC_ACCESS_TOKEN
        }
    )
    return prismic;
}