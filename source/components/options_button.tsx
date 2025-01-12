import { useCallback } from "preact/hooks";
import browserAPI from "@bpev/bext";

export default function OptionsButton() {
  const onClick = useCallback(() => {
    browserAPI.runtime.openOptionsPage();
  }, []);

  return (
    <button onClick={onClick}>
      Options
    </button>
  );
}
