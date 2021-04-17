import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom';

import {
  FiCalendar, FiUser} from "react-icons/fi";
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Head from 'next/head';
import { ReactElement } from 'react';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): ReactElement  {
  const posts = postsPagination.results

  console.log(posts)

  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>
      <main className={styles.contentContainer}>
        <div className={styles.postsContent}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a className={styles.post}>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <ul>
                  <li>
                    <FiCalendar />
                    {post.first_publication_date}
                  </li>
                  <li>
                    <FiUser />
                    {post.data.author}
                  </li>
                </ul>
              </a>
            </Link>
          ))}
        </div>
      </main>

    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type','posts')],
    {
      // fetch: ['posts.next_page', 'posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 2,
      orderings: '[posts.last_publication_date]',
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      slug: post.uid,
      first_publication_date: format(new Date(post.first_publication_date),'dd MMM yyyy',{locale: ptBR,}),
      data: {
        title: post.data.title || null,
        subtitle: post.data.subtitle || null,
        author: post.data.author || null,
      }
    }
  })

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  }

  return {
    props: {
      postsPagination
    }
  }

};
