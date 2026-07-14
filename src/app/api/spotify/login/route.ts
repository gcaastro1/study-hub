import { NextResponse } from "next/server";

export async function GET() {
  const scope = [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-library-read",
    "user-library-modify",
    "user-read-playback-state",
    "user-modify-playback-state"
  ].join(" ");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID || "",
    scope,
    redirect_uri: process.env.SPOTIFY_REDIRECT_URI || "http://localhost:3000/api/spotify/callback",
  });

  return NextResponse.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
}
