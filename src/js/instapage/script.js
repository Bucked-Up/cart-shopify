const handleLpParams = () =>{
  const getTopLevelDomain = () => {
    const fullDomain = window.location.hostname;
    const domainRegex = /\.([a-z]{2,})\.([a-z]{2,})$/;
    const match = fullDomain.match(domainRegex);
    if (match) {
      return `.${match[1]}.${match[2]}`;
    } else {
      return fullDomain;
    }
  };
  const urlParams = new URLSearchParams(window.location.search);
  const cookieConfig = `path=/; domain=${getTopLevelDomain()};max-age=3600`;
  const origin = window.location.pathname.replace("/", "").replace("/", "");
  urlParams.forEach((value, key) => {
    document.cookie = `${key}=${value};${cookieConfig}`;
  });
  localStorage.setItem("first_page", origin);
}

handleLpParams();
