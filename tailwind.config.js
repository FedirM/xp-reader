// const { withTV } = require('tailwind-variants/transformer');
const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {}
    },
    plugins: [
        require('tailwindcss-react-aria-components'),
        require('tailwindcss-animate')
    ]
};