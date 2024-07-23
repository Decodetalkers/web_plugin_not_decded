import browserAPI from "@bpev/bext";

browserAPI.tabs.onUpdated.addListener(() => {
  console.log("tab-updated");
});
