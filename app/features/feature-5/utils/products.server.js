const PRODUCTS_QUERY = `#graphql
  query getProducts($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Product {
        id
        title
        description
        images(first: 1) {
          edges {
            node {
              url
            }
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              price
              inventoryQuantity
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  }
`;

export async function getProductsByIds(admin, productIds) {
  const response = await admin.graphql(PRODUCTS_QUERY, {
    variables: { ids: productIds },
  });
  const json = await response.json();
  return json.data.nodes.filter(Boolean);
}

export function formatProductsForAI(products) {
  return products
    .map((p) => {
      const variants = p.variants.edges.map((e) => e.node);
      const variantInfo = variants
        .map(
          (v) =>
            `  - ${v.title}: $${v.price} (${v.inventoryQuantity > 0 ? `${v.inventoryQuantity} in stock` : "out of stock"})`,
        )
        .join("\n");
      return `${p.title}\n${p.description || "No description"}\nVariants:\n${variantInfo}`;
    })
    .join("\n\n");
}
