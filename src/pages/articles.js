import Head from 'next/head';
import React, { useRef } from 'react';
import Layout from '@/components/Layout';
import AnimatedText from '@/components/AnimatedText';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue } from 'framer-motion';
import TransitionEffect from '@/components/TransitionEffect';

import paginationImg from '../../public/images/articles/pagination component in reactjs.jpg';
import loadingScreenImg from '../../public/images/articles/create loading screen in react js.jpg';
import formValidationImg from '../../public/images/articles/form validation in reactjs using custom react hook.png';
import smoothScrollingImg from '../../public/images/articles/smooth scrolling in reactjs.png';
import modalImg from '../../public/images/articles/create modal component in react using react portals.png';
import todoImg from '../../public/images/articles/todo list app built using react redux and framer motion.png';
import reduxImg from '../../public/images/articles/What is Redux with easy explanation.png';
import hocImg from '../../public/images/articles/What is higher order component in React.jpg';

const FramerImage = motion(Image);

const MovingImg = ({ title, img, link }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const imgRef = useRef(null);

  function handleMouse(event) {
    if (imgRef.current) {
      imgRef.current.style.display = "inline-block";
      // Offset by 20px to prevent cursor hovering directly on top of the image (prevents flicker)
      x.set(event.clientX - 200); 
      y.set(event.clientY + 15);
    }
  }

  function handleMouseLeave() {
    if (imgRef.current) {
      imgRef.current.style.display = "none";
      x.set(0);
      y.set(0);
    }
  }

  return (
    <Link
      href={link}
      target="_blank"
      onMouseMove={handleMouse}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      <h2 className='capitalize text-xl font-semibold hover:underline md:text-lg sm:text-base xs:text-sm'>
        {title}
      </h2>
      <FramerImage
        style={{ x: x, y: y }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1, transition: { duration: 0.2 } }}
        ref={imgRef}
        src={img}
        alt={title}
        className='z-50 w-96 h-auto hidden fixed rounded-lg shadow-xl pointer-events-none md:!hidden'
      />
    </Link>
  );
};

const Article = ({ img, title, date, link }) => {
  return (
    <motion.li
      initial={{ y: 200 }}
      whileInView={{ y: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
      viewport={{ once: true }}
      className='relative w-full p-4 py-6 my-4 rounded-xl flex items-center justify-between 
      bg-light text-dark first:mt-0 border border-solid border-dark border-r-4 border-b-4 
      dark:bg-dark dark:text-light dark:border-light xs:flex-col xs:items-start xs:gap-2'
    >
      <MovingImg title={title} img={img} link={link} />
      <span className='text-primary dark:text-primaryDark font-semibold pl-4 xs:pl-0 xs:text-sm'>
        {date}
      </span>
    </motion.li>
  );
};

const FeaturedArticle = ({ img, title, time, summary, link }) => {
  return (
    <li
      className='col-span-1 flex flex-col items-center justify-between w-full relative rounded-2xl 
      border border-solid border-dark bg-light p-4 shadow-2xl dark:bg-dark dark:border-light'
    >
      <div className='absolute top-0 -right-3 -z-10 w-[102%] h-[102%] rounded-[2rem] rounded-br-[1.9rem] bg-dark dark:bg-light xs:-right-2 xs:w-[101%] xs:h-[101%] xs:rounded-[1.5rem]' />
      
      <Link
        href={link}
        target="_blank"
        className='w-full cursor-pointer overflow-hidden rounded-lg'
      >
        <FramerImage
          src={img}
          alt={title}
          className='w-full h-auto'
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
        />
      </Link>

      <div className='w-full mt-4 flex flex-col items-start justify-between'>
        <Link
          href={link}
          target="_blank"
          className='hover:underline underline-offset-2'
        >
          <h2 className='my-2 w-full text-left text-2xl font-bold dark:text-light md:text-xl sm:text-lg'>
            {title}
          </h2>
        </Link>
        <p className='text-sm mb-2 font-medium'>{summary}</p>
        <span className='text-primary dark:text-primaryDark font-semibold'>{time}</span>
      </div>
    </li>
  );
};

const Articles = () => {
  return (
    <>
      <Head>
        <title>Developer Portfolio | Articles Page</title>
        <meta
          name="description"
          content="Read latest articles about React, Next.js, and web development best practices written by Mai Tam (MaiTamDev)."
        />
      </Head>

      <TransitionEffect />

      <main className='w-full mb-16 flex flex-col items-center justify-center dark:text-light overflow-hidden'>
        <Layout className='pt-16'>
          <AnimatedText
            text="Words Can Change The World!"
            className='mb-16 lg:!text-7xl sm:!text-6xl xs:!text-4xl sm:mb-8'
          />

          {/* Featured Articles Section */}
          <ul className='grid grid-cols-2 gap-16 md:grid-cols-1 md:gap-y-16'>
            <FeaturedArticle
              title="Build A Custom Pagination Component In Reactjs From Scratch"
              summary="Learn how to build a custom pagination component in ReactJS from scratch. Follow this step-by-step guide to integrate Pagination component in your ReactJS project."
              time="9 min read"
              img={paginationImg}
              link="https://devdreaming.com/blogs/build-custom-react-pagination-component-from-scratch"
            />
            <FeaturedArticle
              title="Creating Stunning Loading Screens In React: Build 3 Types Of Loading Screens"
              summary="Learn how to create stunning loading screens in React with 3 different methods. Discover how to use React-Loading, React-Lottie & build a custom loading screen."
              time="10 min read"
              img={loadingScreenImg}
              link="https://devdreaming.com/blogs/create-react-loading-screens"
            />
          </ul>

          {/* Normal Articles Section */}
          <h2 className='font-bold text-4xl w-full text-center my-16 mt-32 dark:text-light'>
            All Articles
          </h2>
          <ul>
            <Article
              title="Form Validation In Reactjs: Build A Reusable Custom Hook For Inputs And Error Handling"
              date="March 22, 2023"
              img={formValidationImg}
              link="https://devdreaming.com/blogs/react-form-validation-custom-hook"
            />
            <Article
              title="Silky Smooth Scrolling In Reactjs: A Step-By-Step Guide For React Developers"
              date="March 15, 2023"
              img={smoothScrollingImg}
              link="https://devdreaming.com/blogs/react-smooth-scrolling-guide"
            />
            <Article
              title="Creating An Efficient Modal Component In React Using Hooks And Portals"
              date="March 08, 2023"
              img={modalImg}
              link="https://devdreaming.com/blogs/react-modal-component-portals"
            />
            <Article
              title="Build A Fabulous Todo List App With React, Redux And Framer-Motion"
              date="March 01, 2023"
              img={todoImg}
              link="https://devdreaming.com/blogs/build-react-todo-list-app"
            />
            <Article
              title="Redux Simplified: A Beginner's Guide For Web Developers"
              date="February 22, 2023"
              img={reduxImg}
              link="https://devdreaming.com/blogs/redux-simplified-beginners-guide"
            />
            <Article
              title="What Is Higher Order Component (Hoc) In React?"
              date="February 15, 2023"
              img={hocImg}
              link="https://devdreaming.com/blogs/what-is-higher-order-component-react"
            />
          </ul>
        </Layout>
      </main>
    </>
  );
};

export default Articles;
