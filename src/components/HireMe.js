import React from 'react';
import { CircularText } from './Icons';
import Link from 'next/link';

const HireMe = () => {
  return (
    <div
      className='left-4 bottom-4 flex items-center justify-center overflow-hidden fixed 
      md:right-8 md:left-auto md:top-0 md:bottom-auto md:absolute z-20'
    >
      <div className='w-28 h-auto flex items-center justify-center relative md:w-24'>
        <CircularText className={"fill-dark animate-spin-slow dark:fill-light"} />
        <Link
          href="mailto:maitamit062005@gmail.com"
          className='flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 
          bg-dark text-light shadow-md border border-solid border-dark w-12 h-12 rounded-full font-semibold text-[10px]
          hover:bg-light hover:text-dark dark:bg-light dark:text-dark hover:dark:bg-dark hover:dark:text-light 
          hover:dark:border-light md:w-12 md:h-12 md:text-[10px]'
        >
          Hire Me
        </Link>
      </div>
    </div>
  );
};

export default HireMe;
