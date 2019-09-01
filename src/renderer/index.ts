import React from "react";
import ReactDOM from "react-dom";

const App: React.FC = () => {
	return React.createElement("div", null, "ok");
};

ReactDOM.render(React.createElement(App, null), document.getElementById("app"));
