import { getTopLevelDomain } from "./dataLayer.js";

const handleIntellimize = () => {
  try {
    const cookieConfig = `path=/; domain=${getTopLevelDomain()};max-age=3600`;
    const userId = intellimize.getUserId();
    const userDomain = "shopifyCheckout";
    intellimize.setUserId(userDomain, userId);
    document.cookie = `intellimize_user_id=${userId};${cookieConfig}`;
    console.log(userDomain, userId);
  } catch (e) {
    console.error(e);
  }
};

export default handleIntellimize;
