import { GetStaticPaths, GetStaticProps } from 'next';
import {useRouter} from "next/router";
import HeaderTag from "next/head"
import Link from "next/link"

import Prismic from "@prismicio/client"
import {RichText} from "prismic-dom"

import { getPrismicClient } from '../../services/prismic';

import Header from "../../components/Header"
import Comments from "../../components/Comments"

import {AiOutlineCalendar, AiOutlineUser, AiOutlineClockCircle} from "react-icons/ai"

import common from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { format, intlFormat } from 'date-fns';

interface ResponsePost {
  first_publication_date: string | null;
  last_publication_date: string | null;
  slugs: string[];
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
interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
  next_post: string | null;
  previous_post: string | null;
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

  if (router.isFallback) {
    return <h1>Carregando...</h1>
  }

  console.log(post)

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
            4 min
          </p>
        
        </div>

        <div className={styles.DateUpdate}>
          {post.last_publication_date && 
            <>
              * editado em {format(new Date(post.last_publication_date), "dd MMM yyyy")}, às {intlFormat(new Date(post.last_publication_date), {hour: "2-digit", minute: "2-digit", hour12: false})}
            </>
          }
          
        </div>

        {post.data.content.map(content => (
          <div key={content.heading} className={styles.Content}>
            <h2>{content.heading}</h2>
            <div dangerouslySetInnerHTML={{__html: RichText.asHtml(content.body)}}/>
          </div>
        ))}
      </main>

      <footer className={`${common.Styles} ${styles.Footer}`}>
        <div className={styles.Hr} />
        
        <div className={styles.PostLink} >

          {
            post?.previous_post &&
              <Link href={`/post/${post.previous_post}`}>
                <button>
                  {post.previous_post}
                  <span>Post anterior</span> 
                </button>
              </Link>
          }
          
          {
            post?.next_post && 
              <Link href={`/post/${post.next_post}`}>
                <button>
                  {post.next_post}
                  <span style={{justifyContent: 'end'}}>Próximo post</span>
                </button>
              </Link>
          }
          

        </div>
        
        <Comments />
      </footer>
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
  const response: ResponsePost = await prismic.getByUID("post", String(slug), {});

  const post = {
    last_publication_date: response.last_publication_date,
    first_publication_date: response.first_publication_date,
    previous_post: response?.slugs[1] || null,
    next_post: response?.slugs[2] || null,
    data: {
      title: response.data.title,
      author: response.data.author,
      banner: {
        url: response.data.banner.url
      },
      content: response.data.content,
    }
  }

  console.log(post)

  return { 
    revalidate: 60 * 60 * 12,
    props: {post}
  }
};
