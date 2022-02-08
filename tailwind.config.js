module.exports = {
  mode: 'jit',
  purge: ['./components/**/*.{js,ts,jsx,tsx}', './pages/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      backgroundImage: theme => ({
        'unait-map': "url('/images/13f2b17839783ae123223d9fdc39f236.png')",
      })
    },
  },
  plugins: [],
}
