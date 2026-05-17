export async function GET() {
   return Response.json({
     apiUrl: process.env.API_URL,
   });
 }