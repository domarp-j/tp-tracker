module.exports = {
  siteMetadata: {
    title: `Get Me TP`,
    description: `Track availability of toilet paper at Walmart, Target, and Walgreens stores in the DC-Maryland-Virginia area`,
    author: `Sepehr Sobhani and Pramod Jacob`,
  },
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Get Me TP`,
        short_name: `Get Me TP`,
        description: `Track availability of toilet paper at Walmart, Target, and Walgreens stores in the DC-Maryland-Virginia area`,
        start_url: `/`,
        background_color: `#fff`,
        display: `minimal-ui`,
        icon: "src/images/tp-roll.png",
      },
    },
    `gatsby-plugin-postcss`,
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
};
