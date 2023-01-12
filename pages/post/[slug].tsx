import { GetStaticProps } from 'next';
import React, { useState } from 'react'
import Header from '../../components/Header';
import {sanityClient, urlFor} from '../../sanity';
import {Post} from '../../typings'
import PortableText from 'react-portable-text';

interface Props {
    post: Post;
}

const  post = ({post}: Props) => {
  return (
    <main >
    <Header/>
    <img src={urlFor(post.mainImage).url()} alt="" className='w-full h-52 object-cover'/>
    <article className='max-w-5xl mx-auto p-5'>
         <h1 className='text-2xl sm:text-3xl mt-10 mb-3'>{post.title}</h1>
         <h2 className='text-xl font-light text-gray-500 mb-2'>{post.description}</h2>

         <div className="flex items-center space-x-2">
             <img src={urlFor(post.author.image).url()} alt="" className='h-10 w-10'/>
             <p className="font-extralight text-sm">
                 Post By <span className='text-red-600'>{post.author.name}</span> - Published at 
                 {new Date(post._createdAt).toLocaleString()}
             </p>
         </div>

         <div className='mt-8'>
             <PortableText   dataset= {process.env.NEXT_PUBLIC_SANITY_DATASET}
                             projectId= {process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
                             content= {post.body}
                             serializers={
                                {
                                 h4: (props: any) => <h4 className='text-xl font-bold my-5'  {...props}/>
                                } 
                             }
              />
         </div>
    </article>
    </main>
  )
}

export default post
export const getStaticPaths = async () => {
    const query = `*[_type == "post"] {
        _id,
        slug {
            current
        }
    }`;

  const  posts = await sanityClient.fetch(query);

  const paths = posts.map( (post: Post) => ({
    params: {
             slug:post.slug.current
            }
  }));
  return {
    paths,
     // We'll pre-render only these paths at build time.
  // { fallback: false } means other routes should 404.
    fallback: "blocking",  // can also be true or 'blocking'
  };
};


/* getStaticProps(): A method that tells the Next component to populate props and render into 
    a static HTML page at build time. 
*/
export const getStaticProps: GetStaticProps = async ({params}) => {
    const query = `*[_type == "post" && slug.current == $slug][0] {
        _id,
       _createdAt,
       title,
       author -> {
        name,
        image
       },
       'comments': *[
         _type == "comment" &&
         post._ref == ^._id &&
         approved == true
       ],
       description,
       mainImage,
       slug,
       body
    }`
    const post = await sanityClient.fetch(query, {
        slug: params?.slug,
    });

    if(!post) {
        return {
            notFound: true
        }
    }

    return {
        props: {
            post,
        },
        revalidate: 60, // After 60 seconds, it will update the old cached version
    }
}

