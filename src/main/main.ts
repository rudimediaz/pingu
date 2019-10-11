import { app, BrowserWindow, dialog, Tray, Menu } from "electron";
import { join, resolve } from "path";
import _ from "highland";
import {
    backupDirectories,
    _access,
    _readdir,
    transport,
    transportDirectories,
    _copyFile
} from "./libs/Directory";

let win: BrowserWindow;
let tray: Tray;

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

const scan = () => {
    const timeOut = (normal = 5000) => {
        let init = normal;

        const get = () => init;
        const setNormal = () => {
            init = 5000;
        };
        const setHalt = () => {
            init = 1000 * 60 * 2;
        };

        return Object.freeze({ get, setNormal, setHalt });
    };

    const scanTimeOut = timeOut();

    _(backupDirectories)
        .map<Dir>(rootpath => ({
            rootpath: resolve(rootpath),
            accessStatus: false
        }))
        .flatMap(dir => _access(dir))
        .flatMap(dir => _readdir(dir))
        .flatMap(backupFile => transport(transportDirectories, backupFile))
        .flatMap(tsDir => _access(tsDir))
        .doto(tsDir => {
            if ((tsDir as Tsdir).accessStatus === true) {
                scanTimeOut.setHalt();
                // dialog.showMessageBox({
                //     message:
                //         "flash disk terdeteksi, jangan dicabut sebelum selesai mengkopi"
                // });

                tray.displayBalloon({
                    title: "Notifikasi",
                    content:
                        "flash disk terdeteksi, jangan dicabut sebelum selesai mengkopi"
                });
            } else {
                scanTimeOut.setNormal();
            }
        })
        .flatMap(tsDir => _copyFile(tsDir as Tsdir))
        .doto(tsDir => {
            if ((tsDir as Tsdir).isTransported === true) {
                let postMessage = `backup sudah tersalin pada ${new Date().toLocaleString(
                    "id"
                )}`;
                tray.displayBalloon({
                    content: `backup sudah tersalin. scan selanjutnya akan bejalan setelah ${scanTimeOut.get() /
                        (1000 * 60)} menit`,
                    title: "Notifikasi"
                });

                tray.setToolTip(
                    `backup sudah tersalin pada ${new Date().toLocaleString(
                        "id"
                    )}`
                );

                // dialog.showMessageBox({
                //     message: postMessage
                // });

                tray.on("click", () => {
                    dialog.showMessageBox({
                        message: postMessage
                    });
                });
            } else {
                scanTimeOut.setNormal();
            }
        })
        .done(() => setTimeout(scan, scanTimeOut.get()));
};

app.once("ready", scan);

app.on("ready", () => {
    tray = new Tray(join(__dirname, "../../resources/pingu.ico"));
    // win = new BrowserWindow({
    //     webPreferences: {
    //         nodeIntegration: true
    //     },
    //     show: false,
    //     useContentSize: true,
    //     height: 100,
    //     width: 400,
    //     frame: false
    // });

    // win.loadFile(join(__dirname, "../../static/index.html"));

    const contextMenu = Menu.buildFromTemplate([
        {
            label: "keluar",
            click: app.quit
        }
    ]);

    tray.setContextMenu(contextMenu);

    tray.setHighlightMode("always");
});
