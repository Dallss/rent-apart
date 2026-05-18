export async function GET() {
   return Response.json({
     apiUrl: process.env.BACKEND_API_URL,
   });
 }