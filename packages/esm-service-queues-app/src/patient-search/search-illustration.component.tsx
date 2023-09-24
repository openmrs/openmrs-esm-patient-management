import React from 'react';

export default function SearchIllustration({ width = '62', height = '48' }) {
  return (
    <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
      <defs>
        <path
          d="M36.001 3.218C47.482 9.838 51.403 24.52 44.782 36 38.162 47.482 23.48 51.403 12 44.782.518 38.162-3.403 23.48 3.218 12 9.838.518 24.52-3.403 36 3.218z"
          id="a"
        />
      </defs>
      <g fill="none" fillRule="evenodd">
        <path d="M36.001 3.218C47.482 9.838 51.403 24.52 44.782 36 38.162 47.482 23.48 51.403 12 44.782.518 38.162-3.403 23.48 3.218 12 9.838.518 24.52-3.403 36 3.218z" />
        <mask id="b" fill="#fff">
          <use xlinkHref="#a" />
        </mask>
        <use fill="#CEE6E5" xlinkHref="#a" />
        <path
          d="M38 48v-2.618c0-6.696-4.58-12.296-10.72-13.798a8.159 8.159 0 0 0 4.76-7.427C32.04 19.653 28.44 16 24 16c-4.44 0-8.04 3.653-8.04 8.157a8.159 8.159 0 0 0 4.76 7.427C14.58 33.086 10 38.686 10 45.382v2.598"
          fill="#9ACBCA"
          mask="url(#b)"
        />
        <path fill="#9ACBCA" d="m45.34 35 17.124 10.33-1.55 2.57L43.79 37.568z" />
      </g>
    </svg>
  );
}
