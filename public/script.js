console.log(window.location.href)
if (window.location.href.includes("?email=notUCD"))
  document.getElementById("errorMessage").style.display="inline";
