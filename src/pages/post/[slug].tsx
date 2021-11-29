import { GetStaticPaths, GetStaticProps } from 'next';

import Prismic from "@prismicio/client"

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
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
  return(
    <h1>Post</h1>
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

  const post: Post = {
    first_publication_date: response.first_publication_date,
    data: {
      author: response.data.author,
      banner: response.data.banner,
      content: response.data.content,
      title: response.data.title,
    }
  }

  return { 
    revalidate: 60 * 60 * 12,
    props: {post}
  }
};
