/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
        montserrat: ['Montserrat', 'sans-serif'],
        josefin:[ 'Josefin Sans', 'sans-serif'],
        lato:['Lato','sans-serif']
      },
     
    },
  },
  plugins: [],
  
}