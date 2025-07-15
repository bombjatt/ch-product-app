export async function updateShopifyProduct({ admin, productId, title, metafieldData }) {
  // 1️⃣ Update Product Title
  const updateProductMutation = `
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          title
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const updateProductResponse = await admin.graphql(updateProductMutation, {
    variables: { input: { id: productId, title } },
  });
  const updateProductResult = await updateProductResponse.json();
  console.log("✅ Product Update Response:", JSON.stringify(updateProductResult, null, 2));

  if (updateProductResult.data.productUpdate.userErrors.length > 0) {
    throw new Error(JSON.stringify(updateProductResult.data.productUpdate.userErrors));
  }

  // 2️⃣ Update Metafield
  const metafieldMutation = `
    mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
          key
          namespace
          value
          type
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

  const metafieldResponse = await admin.graphql(metafieldMutation, {
    variables: { metafields: [metafieldData] },
  });
  const metafieldResult = await metafieldResponse.json();
  console.log("✅ Metafield Update Response:", JSON.stringify(metafieldResult, null, 2));

  if (metafieldResult.data.metafieldsSet.userErrors.length > 0) {
    throw new Error(JSON.stringify(metafieldResult.data.metafieldsSet.userErrors));
  }

  return {
    updatedProduct: updateProductResult.data.productUpdate.product,
    updatedMetafield: metafieldResult.data.metafieldsSet.metafields[0],
  };
}
