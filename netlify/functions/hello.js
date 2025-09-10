exports.handler = async () => {
  return {
    statusCode: 200,
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ok: true,
      msg: "Hello from Netlify Functions (Node)!",
    }),
  };
};
