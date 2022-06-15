import React, {CSSProperties} from "react";

export const PayPalIcon = ({style}: { style?: CSSProperties }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fillRule="evenodd"
            strokeLinejoin="round"
            strokeMiterlimit="2"
            clipRule="evenodd"
            viewBox="0 0 512 512"
            style={style}
        >
            <path
                fill="#fff"
                fillRule="nonzero"
                d="M409.71 38.624C385.839 11.584 342.639 0 287.37 0H126.99c-11.296 0-20.896 8.16-22.688 19.2L37.519 439.39c-1.312 8.288 5.152 15.776 13.6 15.776h99.008l24.864-156.48-.768 4.928c1.76-11.04 11.328-19.2 22.624-19.2h47.04c92.448 0 164.8-37.248 185.95-144.99.64-3.2 1.632-9.344 1.632-9.344 6.015-39.872-.033-66.912-21.761-91.456h.002z"
                transform="matrix(.6386 0 0 .68014 92.88 81.4)"
            ></path>
            <path
                fill="#fff"
                fillRule="nonzero"
                d="M456.53 150.5c-22.976 106.08-96.288 162.21-212.64 162.21h-42.176l-31.488 199.3h68.416c9.888 0 18.304-7.136 19.84-16.832l.8-4.224 15.744-98.912 1.024-5.44c1.536-9.696 9.952-16.832 19.808-16.832h12.512c80.864 0 144.16-32.576 162.66-126.82 7.424-37.824 3.84-69.536-14.496-92.448l-.004-.002z"
                transform="matrix(.6386 0 0 .68014 92.88 81.4)"
            ></path>
        </svg>
    );
}