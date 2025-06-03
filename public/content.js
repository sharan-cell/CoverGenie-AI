const waitForElement = (selector, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const interval = 100;
    let elapsed = 0;

    const check = () => {
      const element = document.querySelector(selector);
      if (element) return resolve(element);
      elapsed += interval;
      if (elapsed >= timeout) return reject("Timed out waiting for JD element.");
      setTimeout(check, interval);
    };

    check();
  });
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractJD") {
    const hostname = window.location.hostname;

    if (hostname.includes("linkedin.com")) {
      waitForElement(".jobs-description__container", 5000)
        .then((element) => {
          sendResponse({ jobDescription: element.innerText });
        })
        .catch(() => {
          sendResponse({ jobDescription: "Failed to extract JD from LinkedIn (timeout)." });
        });
      return true; // Important: keep the message channel open for async response
    }

    else if (hostname.includes("naukri.com")) {
      const jdElement = document.querySelector(".styles_JDC__dang-inner-html__h0K4t");
      sendResponse({ jobDescription: jdElement?.innerText || "No JD found on Naukri." });
    }

    else if (hostname.includes("indeed.com")) {
      const jdElement = document.querySelector("#jobDescriptionText");
      sendResponse({ jobDescription: jdElement?.innerText || "No JD found on Indeed." });
    }

    else {
      sendResponse({ jobDescription: "Unsupported site. Currently supports LinkedIn, Naukri, Indeed." });
    }
  }
});
