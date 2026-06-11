import Head from 'next/head';
import React from 'react';
import AnimatedText from '@/components/AnimatedText';
import Layout from '@/components/Layout';
import Image from 'next/image';
import profilePic from '../../public/images/profile/maitam.png';
import AnimatedNumbers from '@/components/AnimatedNumbers';
import Skills from '@/components/Skills';
import Experience from '@/components/Experience';
import Education from '@/components/Education';
import TransitionEffect from '@/components/TransitionEffect';

const About = () => {
  return (
    <>
      <Head>
        <title>Developer Portfolio | About Page</title>
        <meta
          name="description"
          content="Learn about Mai Tam (MaiTamDev), a Fullstack Developer and Mobile App Builder specializing in TypeScript (React, Next.js), Flutter, and Python."
        />
      </Head>

      <TransitionEffect />

      <main className='flex w-full flex-col items-center justify-center dark:text-light'>
        <Layout className='pt-16'>
          <AnimatedText
            text="Passion Fuels Purpose!"
            className='mb-16 lg:!text-7xl sm:!text-6xl xs:!text-4xl sm:mb-8'
          />

          <div className='grid w-full grid-cols-8 gap-16 sm:gap-8'>
            {/* Bio Column */}
            <div className='col-span-3 flex flex-col items-start justify-start xl:col-span-4 md:order-2 md:col-span-8'>
              <h2 className='mb-4 text-lg font-bold uppercase text-dark/75 dark:text-light/75'>
                Biography
              </h2>
              <p className='font-medium'>
                Hi, I&apos;m Mai Tam (MaiTamDev), a passionate Fullstack Developer and Mobile App Builder specializing in TypeScript (React, Next.js), Flutter, and Python. Driven by the philosophy of building products that truly matter, I love exploring emerging technologies, resolving intricate bugs, and crafting seamless digital experiences.
              </p>
              <p className='my-4 font-medium'>
                My tech journey centers around AI integration and open-source contributions. I have actively led and contributed to community-focused initiatives like the Anti-Scam security platform, the DHV GUIDING LIGHT Innovation & Startup Project 2025, and experimental AI architectures such as building a custom ChatGPT engine from scratch.
              </p>
              <p className='font-medium'>
                To me, programming is not just about writing clean, compilable code; it is the art of translating abstract ideas into highly responsive, functional, and user-centric systems. I approach every project with a commitment to architecture excellence and look forward to partnering with innovative teams to build the future.
              </p>
            </div>

            {/* Portrait Image Column */}
            <div
              className='col-span-3 relative h-max rounded-2xl border-2 border-solid border-dark bg-light p-8 dark:bg-dark dark:border-light 
              xl:col-span-4 md:order-1 md:col-span-8'
            >
              <div className='absolute top-0 -right-3 -z-10 w-[102%] h-[103%] rounded-[2rem] bg-dark dark:bg-light' />
              <Image
                src={profilePic}
                alt="Mai Tam Portrait"
                className='w-full h-auto rounded-2xl'
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            {/* Statistics Column */}
            <div
              className='col-span-2 flex flex-col items-end justify-between xl:col-span-8 xl:flex-row xl:items-center 
              md:order-3'
            >
              <div className='flex flex-col items-end justify-center xl:items-center'>
                <span className='inline-block text-7xl font-bold md:text-6xl sm:text-5xl xs:text-4xl'>
                  <AnimatedNumbers value={40} />+
                </span>
                <h2 className='text-xl font-medium capitalize text-dark/75 dark:text-light/75 xl:text-center md:text-lg sm:text-base xs:text-sm'>
                  satisfied clients
                </h2>
              </div>

              <div className='flex flex-col items-end justify-center xl:items-center'>
                <span className='inline-block text-7xl font-bold md:text-6xl sm:text-5xl xs:text-4xl'>
                  <AnimatedNumbers value={50} />+
                </span>
                <h2 className='text-xl font-medium capitalize text-dark/75 dark:text-light/75 xl:text-center md:text-lg sm:text-base xs:text-sm'>
                  projects completed
                </h2>
              </div>

              <div className='flex flex-col items-end justify-center xl:items-center'>
                <span className='inline-block text-7xl font-bold md:text-6xl sm:text-5xl xs:text-4xl'>
                  <AnimatedNumbers value={4} />+
                </span>
                <h2 className='text-xl font-medium capitalize text-dark/75 dark:text-light/75 xl:text-center md:text-lg sm:text-base xs:text-sm'>
                  years of experience
                </h2>
              </div>
            </div>
          </div>

          <Skills />
          <Experience />
          <Education />
        </Layout>
      </main>
    </>
  );
};

export default About;
