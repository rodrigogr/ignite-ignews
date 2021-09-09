import { getSession } from "next-auth/client";
import { RichText } from 'prismic-dom';
import { getPrismicClient } from "../../services/prismic";
import Head from 'next/head';
import { GetServerSideProps } from "next";
import styles from './post.module.scss';

interface PostProps {
    post: {
        slug: string;
        title: string;
        content: string;
        updatedAt: string;
    }
}

export default function Post({post}: PostProps){
    console.log(post.content);
    return (
        <>
            <Head>
                <title>{post.title} | Ignews</title>
            </Head>
            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updatedAt}</time>
                    <div 
                        className={styles.postContent}
                        dangerouslySetInnerHTML={{__html: post.content}} />
                </article>
            </main>
        </>
    )
}
//Pra acessar o conteúdo total do post, e não o preview, a pessoa precisa estar
//logada e precisa assinar a aplicação. Como getStaticProps é uma página 
//estática, e páginas estáticas não são protegidas, é necessário usar então
//o getServersideProps. Por mais que esse método for na API do prismic toda hora
//pra buscar o conteúdo do post, botamos na balança o que é mais importante, a
//segurança das informações ou otimização.

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
    const session = await getSession({req});
    const {slug} = params;

    if (!session.activeSubscription){
        return {
            redirect: {
                destination: '/',
                permanent: false,
            }
        }
    }

    const prismic = getPrismicClient(req);
    const response = await prismic.getByUID('post', String(slug), {})
    // console.log(response.data.content)
    const post = {
        slug,
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content),
        updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    };
    return {
        props: {
            post
        }
    }
}