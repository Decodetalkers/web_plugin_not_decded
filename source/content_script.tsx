/**
 * BigDaddy script: https://github.com/ivebencrazy/BigDaddy
 * Replaces all instances of the word "data" with "daddy".
 */

/// <reference lib="dom" />

import { dynamicCSS } from "@nobody/styled-components-deno";
import { useEffect, useState } from "preact/hooks";
import { render } from "preact";

globalThis.alert("Running Sample Browser Extension");

document.body.style.border = "5px solid red";

Array.prototype.forEach.call(
  document.getElementsByTagName("*"),
  replaceNode,
);

type ButtonInfo = {
  visible?: boolean;
  x: number;
  y: number;
};

const FloatButton = dynamicCSS<ButtonInfo>`
  position: absolute;
  display: ${({ visible }) => {
  if (visible) {
    return "block";
  }
  return "none";
}};
  zIndex: 999;
  left: ${({ x }) => x.toString()}px;
  top: ${({ y }) => y.toString()}px;
`;

function TranslateBtn() {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      const selection = globalThis.getSelection();
      if (selection?.toString().trim()) {
        setPosition({ x: e.pageX + 10, y: e.pageY + 10 });
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  const handleClick = () => {
    const selection = globalThis.getSelection();
    if (selection?.rangeCount) {
      const range = selection.getRangeAt(0);
      const span = document.createElement("span");
      span.style.textDecoration = "line-through";
      span.textContent = selection.toString();
      range.deleteContents();
      range.insertNode(span);
      selection.removeAllRanges();
    }
    setVisible(false);
  };

  if (!visible) return null;
  return (
    <button
      className={FloatButton({
        visible: visible,
        x: position.x,
        y: position.y,
      })}
      onClick={handleClick}
    >
      Hello
    </button>
  );
}
const root = document.createElement("div");
root.id = "floating-button";

document.body.appendChild(root);
render(<TranslateBtn />, root);

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
