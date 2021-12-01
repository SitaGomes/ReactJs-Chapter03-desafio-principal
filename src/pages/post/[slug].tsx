import { GetStaticPaths, GetStaticProps } from 'next';
import {useRouter} from "next/router";
import HeaderTag from "next/head"

import Prismic from "@prismicio/client"
import {RichText} from "prismic-dom"

import { getPrismicClient } from '../../services/prismic';

import Header from "../../components/Header"

import { format } from 'date-fns';

import {AiOutlineCalendar, AiOutlineUser, AiOutlineClockCircle} from "react-icons/ai"

import common from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({post}: PostProps) {

  const router = useRouter()

  console.log(post)

  if (router.isFallback) {
    return <h1>Carregando...</h1>
  }

  return(
    <>
      <HeaderTag>
        <title>{post.data.title} | SpaceTraveling</title>
      </HeaderTag>

      <Header />

      <img className={styles.Banner} src={post.data.banner.url} alt={post.data.title} />
      
      <main className={`${common.Styles} ${styles.Container}`}>

        <h1>{post.data.title}</h1>

        <div className={styles.PostInfo}>
          <time>
            <AiOutlineCalendar />
            {format(new Date(post.first_publication_date), "dd MMM yyyy")}
          </time>
          <address>
            <AiOutlineUser />  
            {post.data.author}
          </address>
          <p>
            <AiOutlineClockCircle />
            4 Min
          </p>
        </div>

        {post.data.content.map(content => (
          <div key={content.heading} className={styles.Content}>
            <h2>{content.heading}</h2>
            <div dangerouslySetInnerHTML={{__html: RichText.asHtml(content.body)}}/>
          </div>
        ))}
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    Prismic.Predicates.at("document.type", "post")
  );

  const slugs = posts.results.map(post => {
    return {
      uid: post.uid
    }
  })

  return {
    paths: [
      {params: {slug: slugs.find(slug => slug.uid === "como-utilizar-hooks").uid}},
      {params: {slug: slugs.find(slug => slug.uid === "criando-um-app-cra-do-zero").uid}},
    ],
    fallback: true
  }
};

export const getStaticProps: GetStaticProps = async context => {

  const {slug} = context.params;

  const prismic = getPrismicClient();
  const response: Post = await prismic.getByUID("post", String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      author: response.data.author,
      banner: {
        url: response.data.banner.url
      },
      content: response.data.content,
    }
  }

  return { 
    revalidate: 60 * 60 * 12,
    props: {post}
  }
};
