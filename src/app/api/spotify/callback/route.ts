import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url));
  }

  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI || "http://localhost:3000/api/spotify/callback",
    }),
  });

  const data = await response.json();

  if (data.error) {
    return NextResponse.redirect(new URL("/?error=spotify_auth_failed", request.url));
  }

  // Redirect back to dashboard with the tokens in the URL (or store in cookies)
  // For simplicity, we'll pass it in URL so the client can save it
  const redirectUrl = new URL("/dashboard", request.url);
  redirectUrl.searchParams.set("spotify_access_token", data.access_token);
  redirectUrl.searchParams.set("spotify_refresh_token", data.refresh_token);
  redirectUrl.searchParams.set("spotify_expires_in", data.expires_in);

  return NextResponse.redirect(redirectUrl);
}
