const getCookie = (name) => {
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    const splited = cookie.split("=");
    if (splited[0].trim() == name) return splited[1];
  }
};

const setUserId = (i = 0) => {
  const userId = getCookie("rl_anonymous_id");
  if (userId) {
    const userDomain = "shopifyCheckout";
    console.log("has set id",userId);
    intellimize.setUserId(userDomain, userId);
    return;
  }
  if (i >= 50) {
    console.warn("no id for intellimize");
    return;
  }
  setTimeout(() => setUserId(i + 1), 100);
};

const handleIntellimize = () => {
  try {
    intellimize.ready(function () {
      setUserId();
    });
  } catch (e) {
    console.error(e);
  }
};

export default handleIntellimize;
