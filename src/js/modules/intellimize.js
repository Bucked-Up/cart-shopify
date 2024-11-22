const getCookie = (name) => {
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const splited = cookie.split("=");
    if (splited[0].trim() == name) return splited[1];
  }
};


const getUserId = (i = 0) => {
  const userId = getCookie("rl_anonymous_id");
  if (userId) return userId;
  if (i >= 50) {
    console.warn("no id for intellimize");
    return;
  }
  setTimeout(() => getUserId(i + 1), 100);
};

const handleIntellimize = () => {
  try {
    intellimize.ready(function () {
      const userId = getUserId()
      const userDomain = "shopifyCheckout";
      intellimize.setUserId(userDomain, userId);
    });
  } catch (e) {
    console.error(e);
  }
};

export default handleIntellimize;
