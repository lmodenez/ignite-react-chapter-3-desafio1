import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom';

import {
  FiCalendar, FiUser} from "react-icons/fi";
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Head from 'next/head';
import { ReactElement, useState } from 'react';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Link from 'next/link';
import Header  from  '../components/Header';

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
  const [posts, setPosts] = useState<Post[]>(postsPagination.results)
  const [morePosts, setMorePosts] = useState(postsPagination.next_page)

  async function handleMorePost(): Promise<void> {
    if(!morePosts){
      return
    }

    const result = await fetch(`${morePosts}`).then(response => response.json())
    setMorePosts(result.next_page)

    const newPosts = result.results.map(post => {
      return {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author,
        }
      }
    })

    setPosts([
      ...posts,
      ...newPosts
    ])
  }

  return (
    <>
      <Head>
        <title>Posts | Ignews</title>
      </Head>
      <Header />
      <main className={styles.contentContainer}>
        <div className={styles.postsContent}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} >
              <a key={post.uid}>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <ul>
                  <li>
                    <FiCalendar />
                    {format(
                      new Date(post.first_publication_date),
                      "dd MMM yyy",
                      { locale: ptBR }
                    )}
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
        {morePosts &&
          <button type="button" className={styles.loadMore} onClick={handleMorePost}>
            Carregar mais posts
          </button>
        }
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
      pageSize: 1,
      orderings: '[posts.last_publication_date]',
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
