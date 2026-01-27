import { generateNanoId } from "../utils/helper.js";
import { checkCustomSlug, saveShortUrl } from "../dao/shortUrl.js";

export const createShortUrlWithoutUser = async (url) => {
    const shortUrl = generateNanoId(7);
    if (!shortUrl) throw new Error("Short URL not generated");
    await saveShortUrl(url, shortUrl);
    return shortUrl;
};

export const createShortUrlWithUser = async (url, userId, slug = null) => {
  const shortUrl = slug || generateNanoId(7);
  const exist = await checkCustomSlug(slug);
  if(exist) throw new Error("This custom url is already exist");
  saveShortUrl(url, shortUrl, userId);
  return shortUrl;
};
