
const simulateBtn = document.getElementById("simulate");

simulateBtn.addEventListener("click", (e) => {
    chrome.tabs.executeScript(null, { file: "jquery/jquery-3.6.0.min.js" }, function() {
        chrome.tabs.executeScript(null, { file: "scripts/background.js" });
    });
})

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        console.log(request.datas)
        if (request.message == "notesDatas") {
            const notesDatas = request.data;
            chrome.tabs.create({ url: chrome.extension.getURL("index.html?datas="+notesDatas) });
        }
    }
)