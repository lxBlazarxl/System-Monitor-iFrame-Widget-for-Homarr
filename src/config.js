import 'dotenv/config';

export const config = {
  lastfm: {
    apiKey: process.env.LASTFM_API_KEY,
    username: process.env.LASTFM_USERNAME
  },
  r2: {
    endpoint: process.env.R2_ENDPOINT,
    accessKey: process.env.R2_ACCESS_KEY,
    secretKey: process.env.R2_SECRET_KEY,
    bucketName: process.env.R2_BUCKET_NAME
  },
  cloudflare: {
    accountId: process.env.CF_ACCOUNT_ID,
    token: process.env.CF_GRAPHQL_TOKEN
  },
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    refreshToken: process.env.SPOTIFY_REFRESH_TOKEN
  }
};
