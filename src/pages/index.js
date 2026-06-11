import Head from 'next/head';
import Image from 'next/image';
import Layout from '@/components/Layout';
import AnimatedText from '@/components/AnimatedText';
import Link from 'next/link';
import { LinkArrow } from '@/components/Icons';
import HireMe from '@/components/HireMe';
import TransitionEffect from '@/components/TransitionEffect';
import profilePic from '../../public/images/profile/maitam.png';

export default function Home() {
  return (
    <>
      <Head>
        <title>Developer Portfolio | Home</title>
        <meta
          name="description"
          content="Writing code is the art of translating imagination into functional reality. As a full-stack engineer, I specialize in building robust digital architectures."
        />
      </Head>
      
      <TransitionEffect />
      
      <main className='flex items-center text-dark w-full min-h-screen dark:text-light'>
        <Layout className='pt-0 md:pt-16 sm:pt-8'>
          <div className="flex items-center justify-between w-full lg:flex-col lg:gap-12">
            {/* Left Side: Profile Pic with Offset Shadow Card */}
            <div className='w-[40%] lg:w-[60%] md:w-[80%] relative h-max rounded-2xl border-2 border-solid border-dark bg-light p-4 dark:bg-dark dark:border-light shadow-2xl'>
              <div className='absolute top-0 -right-3 -z-10 w-[102%] h-[103%] rounded-[2rem] bg-dark dark:bg-light' />
              <Image
                src={profilePic}
                alt="Developer Profile"
                className='w-full h-auto rounded-2xl'
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
              />
            </div>
            
            {/* Right Side: Description and Call to Actions */}
            <div className='w-[55%] flex flex-col items-center self-center lg:w-full lg:text-center pl-4 lg:pl-0'>
              <AnimatedText
                text="Logic Meets Creativity: Designing The Future With Code."
                className='!text-5xl xl:!text-4xl lg:!text-center lg:!text-5xl md:!text-4xl sm:!text-3xl !text-left'
              />
              <p className='my-4 text-base font-medium text-dark/75 dark:text-light/75 leading-relaxed md:text-sm sm:text-xs'>
                Writing code is the art of translating imagination into functional reality. As a full-stack engineer, 
                I specialize in building robust digital architectures, transforming complex algorithmic challenges 
                into elegant, high-performance web experiences.
              </p>
              
              <div className='flex items-center self-start mt-4 lg:self-center'>
                <Link
                  href="/CV_MAITRANTHIENTAM.pdf"
                  target={"_blank"}
                  className='flex items-center bg-dark text-light p-2.5 px-6 rounded-lg text-lg font-semibold 
                  hover:bg-light hover:text-dark border-2 border-solid border-transparent hover:border-dark 
                  dark:bg-light dark:text-dark hover:dark:bg-dark hover:dark:text-light hover:dark:border-light 
                  md:p-2 md:px-4 md:text-base'
                  download={true}
                >
                  Resume <LinkArrow className={"w-6 ml-1"} />
                </Link>
                <Link
                  href="mailto:maitamit062005@gmail.com"
                  target={"_blank"}
                  className='ml-4 text-lg font-medium capitalize text-dark underline dark:text-light md:text-base'
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </Layout>
        
        <HireMe />
      </main>
    </>
  );
}
