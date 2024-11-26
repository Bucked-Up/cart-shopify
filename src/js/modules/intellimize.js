let userId;

const getUserId = () => userId;

const setUserId = (i = 0) => {
  try {
    userId = intellimize.getUserId();
    if (userId) {
      const userDomain = "shopifyCheckout";
      intellimize.setUserId(userDomain, userId);
      return;
    }
    if (i >= 50) {
      console.warn("no id for intellimize");
      return;
    }
    setTimeout(() => setUserId(i + 1), 100);
  } catch (e) {
    setTimeout(() => setUserId(i + 1), 100);
  }
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
export { getUserId };
