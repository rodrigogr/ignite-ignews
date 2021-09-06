import { GetStaticProps } from 'next';
import Head from 'next/head';
import { getPrismicClient } from '../../services/prismic';
import Prismic from '@prismicio/client'

import styles from './styles.module.scss'

export default function Post(){
    return (
        <>
            <Head>
                <title>Posts | Ignews</title>
            </Head>

            <main className={styles.container}>
                <div className={styles.posts}>
                    <a href="">
                        <time>10 de outubro de 2021 </time>
                        <strong>Creating a Monorepo with Lerna & Yarn Workspaces</strong>
                        <p>In this guide, you will learn how to create a Monorepo to manage multiple packages with a shared build, test, and release process.</p>
                    </a>
                    <a href="">
                        <time>10 de outubro de 2021 </time>
                        <strong>Creating a Monorepo with Lerna & Yarn Workspaces</strong>
                        <p>In this guide, you will learn how to create a Monorepo to manage multiple packages with a shared build, test, and release process.</p>
                    </a>
                    <a href="">
                        <time>10 de outubro de 2021 </time>
                        <strong>Creating a Monorepo with Lerna & Yarn Workspaces</strong>
                        <p>In this guide, you will learn how to create a Monorepo to manage multiple packages with a shared build, test, and release process.</p>
                    </a>
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
    })

    // console.log(response);
    // *********** DICA ***********
    // Quando utiliza console.log() pra algum debug debug. Quando usar o log em
    // objeto {} ou array {} que tem conteúdo interno (cascata), onde não
    // onde não conseguimos saber o que é. Ex. data: [Object] ou slugs: [Array]
    // Basta fazer da forma abaixo.
    console.log(JSON.stringify(response, null, 2));

    return {
        props: {

        }
    }
}