
const token = '107A1B44043CE8C882430CB354B09BF6BC3DCF10ECBE1B7DC2385BD38E49EC7DAEBAA01926F8C6C271712F5BA1A43116CDB9220E75B9AFC685860DCD2E1AE10DFC865F8485E8286420B8D6514AEB58FA';
const url = `https://publicapi.abaha.vn/product/index?token=${token}`;

async function test_keys() {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 1, page: 1 })
    });
    const data = await res.json();
    const product = data.data.products[0];
    console.log("Product keys:", Object.keys(product));
    console.log("Product category data:", {
        category_id: product.category_id,
        category: product.category,
        cat_id: product.cat_id,
        categories: product.categories
    });
  } catch (e) { console.error(e); }
}

test_keys();
