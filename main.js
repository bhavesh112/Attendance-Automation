require("hazardous");
const { BrowserWindow, app, ipcMain } = require("electron");
const pie = require("puppeteer-in-electron");
const puppeteer = require("puppeteer-core");
const Store = require("electron-store");
const fs = require("fs");
const schedule = require("node-schedule");
const store = new Store();
const AutoLaunch = require("auto-launch");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  win.loadFile("index.html");
}
let x = "";
const main = async (withHome, alreadyInitialized, schedule) => {
  if (!alreadyInitialized) {
    await pie.initialize(app);
  }
  const date = new Date();
  const browser = await pie.connect(app, puppeteer);
  if (withHome) createWindow();
  if (
    date.getDay() === 0 ||
    (date.getDay() === 6 && Math.floor((date.getDate() - 1) / 7) % 2)
  ) {
    app.quit();
  }
  if (store.get("username") && store.get("password") && schedule) {
    const window = new BrowserWindow();
    const url = "https://fyntunesol.greythr.com/";
    await window.loadURL(url);
    const page = await pie.getPage(browser, window);
    try {
      await page.waitForSelector(".form-container");
      await page.waitForSelector("input");
      await page.$eval("input", (el) => {
        el.focus();
      });
      await page.keyboard.type(store.get("username"));
      await page.keyboard.press("Tab");
      await page.keyboard.type(store.get("password"));
      await page.keyboard.press("Enter");
      await page.waitForSelector(".home-dashboard");
      await page.waitForSelector(".btn");
      x = await page.$eval(".btn", (el) => {
        let y = el.innerText;
        el.click();
        return y;
      });
      window.destroy();
    } catch (error) {
      const date = new Date();
      fs.appendFile(
        app.getPath("documents") + "/attendance-log.txt",
        `${error} at ${date.getHours()}:${date.getMinutes()} on ${date.getDate()}/${
          date.getMonth() + 1
        }\n`,
        (e) => {
          if (e) {
            console.log(e);
          }
        }
      );
      window.destroy();
    }
  }
};
main(true, false, false);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("ready", () => {
  let autoLaunch = new AutoLaunch({
    name: "attendance-electron",
    path: app.getPath("exe"),
  });
  autoLaunch.isEnabled().then((isEnabled) => {
    if (!isEnabled) autoLaunch.enable();
  });
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on("userDetails", (event, arg) => {
  console.log(arg);
  store.set("username", arg.username);
  store.set("password", arg.password);
  main(false, true);
  event.returnValue = true;
});
ipcMain.on("loaded", (event, arg) => {
  if (store.get("username")) {
    event.returnValue = store.get("username");
  } else event.returnValue = false;
});
ipcMain.on("override", async (event, arg) => {
  const date = new Date();
  if (arg) {
    let inner = await main(false, true, true);

    fs.appendFile(
      app.getPath("documents") + "/attendance-log.txt",
      `${x} at ${date.getHours()}:${date.getMinutes()} on ${date.getDate()}/${
        date.getMonth() + 1
      }\n`,
      (e) => {
        if (e) {
          console.log(e);
        }
      }
    );
  }
});
schedule.scheduleJob({ hour: 10, minute: 33 }, async () => {
  const date = new Date();
  let inner = await main(false, true, true);
  fs.appendFile(
    app.getPath("documents") + "/attendance-log.txt",
    `\n ${x} at ${date.getHours()}:${date.getMinutes()} on ${date.getDate()}/${
      date.getMonth() + 1
    }\n`,
    (e) => {
      if (e) {
        console.log(e);
      }
    }
  );
});
schedule.scheduleJob({ hour: 19, minute: 00 }, async () => {
  const date = new Date();
  let inner = await main(false, true, true);
  fs.appendFile(
    app.getPath("documents") + "/attendance-log.txt",
    `\n ${x} at ${date.getHours()}:${date.getMinutes()} on ${date.getDate()}/${
      date.getMonth() + 1
    }\n`,
    (e) => {
      if (e) {
        console.log(e);
      }
    }
  );
});
