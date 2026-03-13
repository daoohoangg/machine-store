async function test() {
  try {
    const token = '107A1B44043CE8C882430CB354B09BF6BC3DCF10ECBE1B7DC2385BD38E49EC7DAEBAA01926F8C6C271712F5BA1A43116CDB9220E75B9AFC685860DCD2E1AE10DFC865F8485E8286420B8D6514AEB58FA';
    const response = await fetch(`https://publicapi.abaha.vn/product/index?token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        limit: 1,
        page: 1
      })
    });
    const text = await response.text();
    console.log(text);
  } catch (error) {
    console.error(error.message);
  }
}
test();
