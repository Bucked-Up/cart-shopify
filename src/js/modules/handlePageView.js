const sendPageView = async () => {
  try {
    const body = { page: window.location.pathname };
    const response = await fetch("https://webhook-processor-production-0316.up.railway.app/webhook/conversion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(response.statusMessage);
  } catch (e) {
    console.error("Error on pageView: ", e);
  }
};

const handlePageView = async () => {
  const pageViewKey = "pageViewSent";
  if (!sessionStorage.getItem(pageViewKey)) {
    sessionStorage.setItem(pageViewKey, "true");
    sendPageView();
  }
};

export default handlePageView;
