import { getTopLevelDomain } from "./dataLayer.js";

const cookieConfig = `path=/; domain=${getTopLevelDomain()};max-age=3600`;

const getCookie = (name) => {
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const splited = cookie.split("=");
    if (splited[0].trim() == name) return splited[1];
  }
};

const getUserId = () => {
  let userId = getCookie("intellimize_user_id");
  if (!userId) {
    userId = `${Date.now()}${Math.floor(10000 + Math.random() * 90000)}`;
    document.cookie = `intellimize_user_id=${userId};${cookieConfig}`;
  }
  return userId;
};

const handleIntellimize = () => {
  try {
    intellimize.ready(function () {
      const userId = getUserId();
      const userDomain = "shopifyCheckout";
      intellimize.setUserId(userDomain, userId);
    });
  } catch (e) {
    console.error(e);
  }
};

export default handleIntellimize;
