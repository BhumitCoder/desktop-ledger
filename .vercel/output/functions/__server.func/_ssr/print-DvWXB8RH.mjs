//#region node_modules/.nitro/vite/services/ssr/assets/print-DvWXB8RH.js
/**
* Open the print dialog with a meaningful document title — when the user
* chooses "Save as PDF", the browser suggests this as the filename
* (e.g. INV-0042.pdf instead of the app name).
*/
function printWithName(name) {
	const prev = document.title;
	document.title = name;
	const restore = () => {
		document.title = prev;
		window.removeEventListener("afterprint", restore);
	};
	window.addEventListener("afterprint", restore);
	window.print();
	setTimeout(restore, 3e3);
}
//#endregion
export { printWithName as t };
