import { GetStaticProps } from 'next';
import Head from 'next/head';
import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'; // Acesso a API do Prismic
import { RichText } from 'prismic-dom';
import Link from 'next/link';
import styles from './styles.module.scss';

type Post = {
    slug: string;
    title: string;
    excerpt: string;
    updatedAt: string;
};
interface postsProps {
    posts: Post[]
}

export default function Post({ posts }){
    return (
        <>
            <Head>
                <title>Posts | Ignews</title>
            </Head>
            <main className={styles.container}>
                <div className={styles.posts}>
                    {posts.map(post => (
                        // eslint-disable-next-line react/jsx-key
                        <Link href={`/posts/${post.slug}`}>
                            <a key={post.slug}>
                                <time>{post.updatedAt}</time>
                                <strong>{post.title}</strong>
                                <p>{post.excerpt}</p>
                            </a>
                        </Link>
                    ))}
                </div>
            </main>
        </>
    );
}
// Página será estática, não sendo atualizada o tempo todo. No nosso caso 
// atualizaremos a cada hora ou mais. Porque não faz sentido toda vez que um
// usuário acessar, a página de posts ser atualizada, indo no Prismic e trazer
// os dados. 
export const getStaticProps: GetStaticProps = async () => {
    // Usando a API do Prismic
    const prismic = getPrismicClient();
    //Buscar todos os documents, que o tipo seja posts
    const response = await prismic.query([
        Prismic.predicates.at('document.type', 'post')
    ], {
        fetch: ['posts.title', 'posts.content'], // Data e ID do Posts ja vem
        pageSize: 100,
    });

    // Formataçao dos dados
    const posts =  response.results.map( post => {
        return {
            slug: post.uid,
            title: RichText.asText(post.data.title),
            // Hack Pegando o 1º parágrafo - Irá percorrer o Array de content
            // até encontrar o primeiro em que o tyoe seja paragraph.
            // Caso o parágrafo seja encontrado, pegará o texto, senão retornará
            // uma string vazia
            excerpt: post.data.content.find( content => content.type === 'paragraph')?.text ?? '',
            updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })
        };
    });

    // console.log(response);
    // *********** DICA ***********
    // Quando utiliza console.log() pra algum debug debug. Quando usar o log em
    // objeto {} ou array {} que tem conteúdo interno (cascata), onde não
    // onde não conseguimos saber o que é. Ex. data: [Object] ou slugs: [Array]
    // Basta fazer da forma abaixo.
    console.log(JSON.stringify(response, null, 2));

    return {
        props: {
            posts
        }
    }
}