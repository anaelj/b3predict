// ES Module
export async function handler(event, context) {
  // Seu código aqui
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello World" }),
  };
}
