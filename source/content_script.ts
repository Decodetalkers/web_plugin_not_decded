/**
 * BigDaddy script: https://github.com/ivebencrazy/BigDaddy
 * Replaces all instances of the word "data" with "daddy".
 */

/// <reference lib="dom" />

globalThis.alert("Running Sample Browser Extension");

document.body.style.border = "5px solid red";

Array.prototype.forEach.call(
  document.getElementsByTagName("*"),
  replaceNode,
);

// Create a floating button element
const button = document.createElement("button");
button.textContent = "Strike";
button.id = "floating-button";
button.style.position = "absolute";
button.style.zIndex = "999";
document.body.appendChild(button);

// Hide the button by default
button.style.display = "none";
button.textContent = "hello";

// Add event listener to show the button on text selection
document.addEventListener("mouseup", (e) => {
  const selection = globalThis.getSelection();
  if (!selection) {
    return;
  }
  if (selection.toString().trim()) {
    // Show the button near the selected text
    const { x, y } = e;
    button.style.left = `${x + 10}px`;
    button.style.top = `${y + 10}px`;
    button.style.display = "block";
  } else {
    // Hide the button if no text is selected
    button.style.display = "none";
  }
});

// Add click listener to strike through the selected text
button.addEventListener("click", () => {
  const selection = globalThis.getSelection();
  if (!selection) {
    return;
  }
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const span = document.createElement("span");
    span.style.textDecoration = "line-through";
    span.textContent = selection.toString();

    // Replace the selected text with the styled span
    range.deleteContents();
    range.insertNode(span);

    // Clear the selection and hide the button
    selection.removeAllRanges();
    button.style.display = "none";
  }
});

function replaceNode(element: Element) {
  const stack: Node[] = [element];
  const textNodes: Node[] = [];
  let el = stack.pop();
  while (el) {
    Array.prototype.forEach.call(el.childNodes, (n: Node) => {
      const { nodeName, nodeType } = n;
      // skip parent
      const parentNodeName = n?.parentNode?.nodeName;
      // finall it will comes to "#text"
      if (
        nodeName === "INPUT" || nodeName === "TEXTAREA" ||
        parentNodeName === "INPUT" || parentNodeName == "TEXTAREA"
      ) {
        return;
      } else if (nodeType === 1) stack.push(n); // is element node
      else if (nodeType === 3) textNodes.push(n); // is text node
    });
    el = stack.pop();
  }

  textNodes.forEach((textNode: Node) => {
    if (textNode?.parentNode && textNode?.nodeValue) {
      textNode.parentNode.replaceChild(
        document.createTextNode(
          textNode.nodeValue
            .replace(/data/g, "daddy")
            .replace(/Data/g, "Daddy"),
        ),
        textNode,
      );
    }
  });
}

//// document https://developer.mozilla.org/en-US/docs/Web/API/Document/selectionchange_event
//document.addEventListener("selectionchange", async () => {
//  const selection = globalThis.getSelection()?.toString();
//  if (selection) {
//    console.log(selection);
//    const url = new URL("https://translate.googleapis.com/translate_a/single");
//    const search = new URLSearchParams();
//    search.append("client", "gtx");
//    search.append("ie", "UTF-8");
//    search.append("oe", "UTF-8");
//    search.append("dt", "t");
//    search.append("sl", "auto");
//    search.append("tl", "zh");
//    search.append("q", selection);
//    url.search = search.toString();
//
//    const response = await fetch(url);
//    console.log(response.status); // e.g. 200
//    console.log(response.statusText); // e.g. "OK"
//    const jsonData = await response.json();
//    console.log(jsonData);
//  }
//});
