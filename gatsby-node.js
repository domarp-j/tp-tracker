const axios = require("axios")

require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
})

exports.sourceNodes = async ({ actions, createNodeId, createContentDigest }) => {
  const tpRequest = await axios.get(process.env.GATSBY_API_URL)

  tpRequest.data.forEach(tpLocation => {
    const node = {
      store: tpLocation.store,
      address: tpLocation.address,
      available: tpLocation.available,
      id: createNodeId(`TpLocation-${tpLocation.id}-${tpLocation.address}`),
      internal: {
        type: "TpLocation",
        contentDigest: createContentDigest(tpLocation),
      },
    }
    actions.createNode(node)
  })
}
