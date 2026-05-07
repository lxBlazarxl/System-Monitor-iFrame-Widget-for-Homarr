import "dotenv/config";

export const config = {
  lastfm: {
    apiKey: process.env.LASTFM_API_KEY,
    username: process.env.LASTFM_USERNAME,
  },
};
