import { GetStaticProps } from 'next';
import Link from "next/link"
import Header from "next/head"

import { getPrismicClient } from '../services/prismic';
import Prismic from "@prismicio/client"

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import {AiOutlineCalendar, AiOutlineUser} from "react-icons/ai"

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface PostResponse {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
    banner: {
      url: string
    }
    content: [{
      heading: string,
      body: string,
    }]
  };
}

interface Post {
  uid?: string;
  first_publication_date: string | null;
  title: string;
  subtitle: string;
  author: string;
};

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination}: HomeProps) {

  console.log(postsPagination)

  return(
    <>

      <Header>
        <title>SpaceTraveling</title>
      </Header>

      <main className={styles.Container}>
        
        <img src="/logo.svg" alt="Space Traveling logo" />

        {postsPagination.results.map(post => (
          <Link href={`/posts/${post.uid}`} key={post.uid}>
            <div className={styles.Content}>
              <h1>{post.title}</h1>
              <p>{post.subtitle}</p>
              <section>
                <time>
                  <AiOutlineCalendar />
                  {post.first_publication_date}
                </time>
                <address>
                  <AiOutlineUser />  
                  {post.author}
                </address>
              </section>
            </div>
          </Link>
        ))}
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
      Prismic.Predicates.at("document.type", "post"),
      {pageSize: 3}
  );

  const posts: Post[] = postsResponse.results.map((post: PostResponse) => {
    return {
      uid: post.uid,
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
      first_publication_date: format(new Date(post.first_publication_date), "dd MMM yyyy", {locale: ptBR}).toUpperCase(),
    }
  }) 

  const next_page = postsResponse.next_page

  return { 
    props: {
      postsPagination: {
        results: posts,
        next_page 
      }
    },
    revalidate: 60 * 60 * 24 //1 day
      
  }
};
