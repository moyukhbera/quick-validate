
let debugLevel = "warn";

const log = (level, message) => {
    var levels = ["info", "warn", "error"];
    if (levels.indexOf(level) >= levels.indexOf(debugLevel)) {
        if (typeof message !== "string") {
            message = JSON.stringify(message);
        }
        console.log(level + ": " + message);
    }
}

export const setLogLevel = (logLevel) => {
    debugLevel = logLevel;
};

export const debug = (msg) => {
    log("debug", msg);
};

export const info = (msg) => {
    log("info", msg);
};

export const warn = (msg) => {
    log("warn", msg);
};

export const error = (msg) => {
    log("error", msg);
};