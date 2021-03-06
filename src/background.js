const URL = "https://teachablemachine.withgoogle.com/models/7gCZJJ3Cr/";
let model, webcam, ctx, labelContainer, maxPredictions;

async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    model = await tmPose.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    const size = 200;
    const flip = true; // whether to flip the webcam
    webcam = new tmPose.Webcam(size, size, flip); // width, height, flip
    await webcam.setup(); // request access to the webcam
    await webcam.play();
    window.requestAnimationFrame(loop);

    // append/get elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
}

async function loop(timestamp) {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}


function Audio(probability) {
    if (probability >= 1) {
        const audioButton = document.querySelectorAll(".VfPpkd-Bz112c-LgbsSe.yHy1rc.eT1oJ.tWDL4c.uaILN")[0];
        if (audioButton.classList.contains("HNeRed")) {
            audioButton.click();
            window.speechSynthesis.speak(new SpeechSynthesisUtterance('Microphone Off'));
        }
    }
}

function Video(probability) {
    if (probability >= 1) {
        const videoButton = document.querySelectorAll(".VfPpkd-Bz112c-LgbsSe.yHy1rc.eT1oJ.tWDL4c.uaILN")[1];
        if (videoButton.classList.contains("HNeRed")) {
            videoButton.click();
            window.speechSynthesis.speak(new SpeechSynthesisUtterance('Camera Off'));
        }
    }
}

function Escape(probability) {
    if (probability >= 1) {
        const Button0 = document.querySelectorAll(".VfPpkd-Bz112c-LgbsSe.yHy1rc.eT1oJ.tWDL4c.uaILN")[0];
        const Button1 = document.querySelectorAll(".VfPpkd-Bz112c-LgbsSe.yHy1rc.eT1oJ.tWDL4c.uaILN")[1];
        if (Button0.classList.contains("HNeRed")) {
            Button0.click();
            window.speechSynthesis.speak(new SpeechSynthesisUtterance('Microphone Off'));
        }
        if (Button1.classList.contains("HNeRed")) {
            Button1.click();
            window.speechSynthesis.speak(new SpeechSynthesisUtterance('Camera Off'));
        }
    }
}

async function predict() {
    const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
    const prediction = await model.predict(posenetOutput);
    var predictionsArray = prediction.map(function (o, i) {
        return { probability: o.probability.toFixed(2), event: o.className }
    })

    var i;
    var min = predictionsArray[0].probability
    var max = predictionsArray[0].probability
    var event = predictionsArray[0].className;
    var value;
    for (i = 1; i < predictionsArray.length; i++) {
        value = predictionsArray[i].probability
        if (value < min) min = value;
        if (value > max) max = value;
    }
    const index = predictionsArray.findIndex((list) => {
        return list.probability == max;
    })
    event = predictionsArray[index].event;

    if (event === "Audio") {
        Audio(max);
    } else if (event === "Video") {
        Video(max);
    } else if (event === "Escape"){
        Escape(max);
    }
}


const webcamContainer = document.createElement("div");
webcamContainer.id = "webcam-container";
document.body.appendChild(webcamContainer);

init();

const gmeet_url = "https://meet.google.com/*";
const loadMeet_url = "/loadMeet.js";
chrome.runtime.onInstalled.addListener(function (details) {
    chrome.storage.sync.get([
        'mainButton',
        'gmeet_messages',
        'gmeet_participants',
        'gmeet_video',
        'gmeet_entry',
        'gmeet_badge',
       
    ], function (data) {
        data.mainButton == null && chrome.storage.sync.set({ mainButton: true });
        data.gmeet_messages == null && chrome.storage.sync.set({ gmeet_messages: true });
        data.gmeet_participants == null && chrome.storage.sync.set({ gmeet_participants: true });
        data.gmeet_video == null && chrome.storage.sync.set({ gmeet_video: false });
        data.gmeet_entry == null && chrome.storage.sync.set({ gmeet_entry: false });
        data.gmeet_badge == null && chrome.storage.sync.set({ gmeet_badge: false });
        data.general_messages == null && chrome.storage.sync.set({ general_messages: false });
    });
});

chrome.commands.onCommand.addListener(function (command) {
    if (command == 'toggle') {
        chrome.storage.sync.get(['mainButton'], function (data) {
            console.log("Setting the main button element to: ", !data.mainButton);
            chrome.storage.sync.set({ mainButton: !data.mainButton });
            chrome.tabs.query({ url: gmeet_url }, function (tabs) {
                if (tabs.length !== 0)
                    tabs.forEach(function (tab) { chrome.tabs.executeScript(tab.id, { file: loadMeet_url }) });
            });
            
            // add others here too
        });
    }
});