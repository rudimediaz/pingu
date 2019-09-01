import { app, BrowserWindow } from "electron";
import { join } from "path";

let win: BrowserWindow;

const createWindow = () => {
	win = new BrowserWindow({
		webPreferences: {
			nodeIntegration: true
		},
		show: false
	});

	win.loadFile(join(__dirname, "../../static/index.html"));
	win.on("ready-to-show", () => win.show());
};

app.on("ready", () => {});
