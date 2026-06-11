import Head from 'next/head';
import React from 'react';
import Layout from '@/components/Layout';
import AnimatedText from '@/components/AnimatedText';
import Link from 'next/link';
import Image from 'next/image';
import { GithubIcon } from '@/components/Icons';
import { motion } from 'framer-motion';
import TransitionEffect from '@/components/TransitionEffect';

import antiScamImg from '../../public/images/projects/anti-scam.png';
import nineRouterImg from '../../public/images/projects/9router.png';
import dhvGuidingLightImg from '../../public/images/projects/dhv-guiding-light.png';
import scsGoImg from '../../public/images/projects/scs-go.png';
import aiotElearningImg from '../../public/images/projects/aiot-elearning.png';
import buildChatgptImg from '../../public/images/projects/build-chatgpt.png';

const FramerImage = motion(Image);

const FeaturedProject = ({ type, title, summary, img, link, github }) => {
  return (
    <article
      className='w-full flex items-center justify-between relative rounded-3xl rounded-br-2xl border border-solid border-dark bg-light p-12 shadow-2xl dark:bg-dark dark:border-light 
      lg:flex-col lg:p-8 xs:rounded-2xl xs:rounded-br-3xl xs:p-4'
    >
      <div className='absolute top-0 -right-3 -z-10 w-[101%] h-[103%] rounded-[2.5rem] rounded-br-[1.9rem] bg-dark dark:bg-light xs:-right-2 sm:h-[102%] xs:w-full xs:rounded-[1.5rem]' />
      
      <Link
        href={link}
        target="_blank"
        className='w-1/2 cursor-pointer overflow-hidden rounded-lg lg:w-full'
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

      <div className='w-1/2 flex flex-col items-start justify-between pl-6 lg:w-full lg:pl-0 lg:pt-6'>
        <span className='text-primary dark:text-primaryDark font-medium text-xl xs:text-base'>
          {type}
        </span>
        <Link
          href={link}
          target="_blank"
          className='hover:underline underline-offset-2'
        >
          <h2 className='my-2 w-full text-left text-4xl font-bold dark:text-light sm:text-sm md:text-2xl'>
            {title}
          </h2>
        </Link>
        <p className='my-2 font-medium text-dark dark:text-light sm:text-sm'>
          {summary}
        </p>
        <div className='mt-2 flex items-center'>
          <Link href={github} target="_blank" className='w-10'>
            <GithubIcon />
          </Link>
          <Link
            href={link}
            target="_blank"
            className='ml-4 rounded-lg bg-dark text-light p-2 px-6 text-lg font-semibold dark:bg-light dark:text-dark sm:px-4 sm:text-base'
          >
            Visit Project
          </Link>
        </div>
      </div>
    </article>
  );
};

const Project = ({ type, title, img, link, github }) => {
  return (
    <article
      className='w-full flex flex-col items-center justify-center relative rounded-2xl border border-solid border-dark bg-light p-6 shadow-2xl dark:bg-dark dark:border-light 
      xs:p-4'
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
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </Link>

      <div className='w-full flex flex-col items-start justify-between mt-4'>
        <span className='text-primary dark:text-primaryDark font-medium text-lg lg:text-base md:text-sm'>
          {type}
        </span>
        <Link
          href={link}
          target="_blank"
          className='hover:underline underline-offset-2'
        >
          <h2 className='my-2 w-full text-left text-3xl font-bold dark:text-light lg:text-2xl sm:text-xl'>
            {title}
          </h2>
        </Link>
        <div className='w-full mt-2 flex items-center justify-between'>
          <Link
            href={link}
            target="_blank"
            className='text-lg font-semibold underline md:text-base'
          >
            Visit
          </Link>
          <Link href={github} target="_blank" className='w-8 md:w-6'>
            <GithubIcon />
          </Link>
        </div>
      </div>
    </article>
  );
};

const Projects = () => {
  return (
    <>
      <Head>
        <title>Developer Portfolio | Projects Page</title>
        <meta
          name="description"
          content="Explore my latest Next.js and React projects showing innovative web development capabilities."
        />
      </Head>

      <TransitionEffect />

      <main className='w-full mb-16 flex flex-col items-center justify-center dark:text-light'>
        <Layout className='pt-16'>
          <AnimatedText
            text="Imagination Trumps Knowledge!"
            className='mb-16 lg:!text-7xl sm:!text-6xl xs:!text-4xl sm:mb-8'
          />

          <div className='grid grid-cols-12 gap-24 gap-y-32 xl:gap-x-16 lg:gap-x-8 md:gap-y-24 sm:gap-x-0'>
            {/* Featured Project 1 */}
            <div className='col-span-12'>
              <FeaturedProject
                title="Anti-Scam Platform"
                img={antiScamImg}
                summary="A high-fidelity modern security scanning platform built with TypeScript, designed to detect and report online scams, protect digital assets, and analyze threat logs in real-time. Features interactive visual reporting and community verification hooks."
                link="https://anti-scam-kappa.vercel.app"
                github="https://github.com/maitamdev/Anti-Scam"
                type="Featured Project"
              />
            </div>

            {/* Normal Project 1 & 2 */}
            <div className='col-span-6 sm:col-span-12'>
              <Project
                title="DHV Guiding Light Web App"
                img={dhvGuidingLightImg}
                link="https://dhv-guiding-light.vercel.app/"
                github="https://github.com/maitamdev"
                type="Education Tech Project"
              />
            </div>
            <div className='col-span-6 sm:col-span-12'>
              <Project
                title="SCS GO EV Optimizer"
                img={scsGoImg}
                link="https://github.com/maitamdev"
                github="https://github.com/maitamdev"
                type="Smart City Project"
              />
            </div>

            {/* Featured Project 2 */}
            <div className='col-span-12'>
              <FeaturedProject
                title="9router: Universal AI Gateway"
                img={nineRouterImg}
                summary="An advanced AI router proxy connecting development environments (Claude Code, Cursor, Copilot) to over 40 AI API providers and 100+ large language models. Reduces latency and implements smart fallback routing rules."
                link="https://9router.com"
                github="https://github.com/maitamdev/9router"
                type="Featured AI Tooling"
              />
            </div>

            {/* Normal Project 3 & 4 */}
            <div className='col-span-6 sm:col-span-12'>
              <Project
                title="AIoT E-Learning Platform"
                img={aiotElearningImg}
                link="https://aiot-elearning-platform.vercel.app"
                github="https://github.com/maitamdev/aiot-elearning-platform"
                type="IoT & AI Integration"
              />
            </div>
            <div className='col-span-6 sm:col-span-12'>
              <Project
                title="Build ChatGPT From Scratch"
                img={buildChatgptImg}
                link="https://github.com/maitamdev/build-chatgpt-from-scratch"
                github="https://github.com/maitamdev/build-chatgpt-from-scratch"
                type="Machine Learning Engine"
              />
            </div>
          </div>
        </Layout>
      </main>
    </>
  );
};

export default Projects;
