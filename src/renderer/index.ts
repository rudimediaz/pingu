import React from "react";
import ReactDOM from "react-dom";
import { ipcRenderer, IpcMessageEvent } from "electron";

const App: React.FC = () => {
    const [message, setMessage] = React.useState("belum ada backup tercopy");
    React.useEffect(() => {
        ipcRenderer.on("last-backup", (event: IpcMessageEvent, arg: string) => {
            setMessage(arg);
        });
    });
    return React.createElement("div", null, message);
};

ReactDOM.render(React.createElement(App, null), document.getElementById("app"));
