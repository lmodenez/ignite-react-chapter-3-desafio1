import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Head from 'next/head';
import { ReactElement } from 'react';

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
  return (
    <>
      <Head>
        <title>Posts | Challenge</title>
      </Head>
      <main>
        <div>
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
      pageSize: 3,
    }
  );

  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsPagination = {
    next_page: postsResponse.next_page,
    results: posts,
  };

  console.log(postsPagination)

  return {
    props: {
      postsPagination
    },
    revalidate: 1800,
  };
};
