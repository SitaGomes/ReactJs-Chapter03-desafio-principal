import { GetStaticProps } from 'next';
import Link from "next/link"
import HeaderTag from "next/head"

import { getPrismicClient } from '../services/prismic';
import Prismic from "@prismicio/client"

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import {AiOutlineCalendar, AiOutlineUser} from "react-icons/ai"

import Header from "../components/Header"

import common from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

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
  data: {
    title: string;
    subtitle: string;
    author: string;
  }
};

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({postsPagination}: HomeProps) {

  const [posts, setPosts] = useState<Post[]>(postsPagination.results)

  async function nextPage () {
    try {
      const response = await fetch(postsPagination.next_page)

      const {results} = await response.json()

      const newPost = results.map((post: PostResponse) => {
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

      setPosts([...posts, ...newPost])
    } catch {
      return
    }

  }

  return(
    <>

      <HeaderTag>
        <title>SpaceTraveling</title>
      </HeaderTag>

      <Header />

      <main className={common.Styles}>
        
        {posts.map((post, index) => (
          <Link href={`/post/${post.uid}`} key={index}>
            <div className={styles.Content}>
              <h1>{post.data.title}</h1>
              <p>{post.data.subtitle}</p>
              <section>
                <time>
                  <AiOutlineCalendar />
                  {format(new Date(post.first_publication_date), "dd MMM yyyy").toLowerCase()}
                </time>
                <address>
                  <AiOutlineUser />  
                  {post.data.author}
                </address>
              </section>
            </div>
          </Link>
        ))}

        {postsPagination.next_page && (
          <button 
            className={styles.Button} 
            onClick={nextPage}
            >
              Carregar mais posts
          </button>
        )}
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
      Prismic.Predicates.at("document.type", "post"),
      {pageSize: 1}
  );

  const posts = postsResponse.results.map((post: PostResponse) => {
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
