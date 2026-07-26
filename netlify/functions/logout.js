export default async () => {
  const headers = new Headers();
  headers.set("Location", "/");
  headers.append("Set-Cookie", "horas_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
  return new Response(null, { status: 302, headers });
};

export const config = { path: "/.netlify/functions/logout" };
