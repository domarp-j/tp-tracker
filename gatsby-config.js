module.exports = {
  siteMetadata: {
    title: `Get Me TP`,
    description: `Track availability of toilet paper at stores in the DC-Maryland-Virginia area`,
    author: `Sepehr Sobhani and Pramod Jacob`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-postcss`,
    `gatsby-plugin-netlify`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Get Me TP`,
        short_name: `Get Me TP`,
        description: `Track availability of toilet paper at stores in the DC-Maryland-Virginia area`,
        start_url: `/`,
        background_color: `#fff`,
        display: `minimal-ui`,
        icon: "src/images/tp-roll.png",
      },
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: "UA-59137634-3",
        head: true,
        respectDNT: true,
      },
    },
  ],
};
