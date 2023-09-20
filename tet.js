const { VK, Keyboard, API } = require("vk-io");
const { HearManager } = require("@vk-io/hear");

const api = new API({
  token:
    "vk1.a.o6VRk3rZIApfGObMWdhUh_GnJo9MPp3T_vta-ZS6ZlDG2tzVrUBaFFUZpwq0hIs5G50nRvkiOb-XwPDtyaHgEVo4QtYb85QY0nxBzFCG8POtoNZaaVP9tyfLHoRulISHfiWxibAtCWzy1xrwigrTJ1EF6htWT66P_s7RYtE40u5SbtDWejSZYkXDQH5iV7h2jsQVpavyI7tQ8PYfjBMXtA",
});
const vk = new VK({
  token:
    "vk1.a.o6VRk3rZIApfGObMWdhUh_GnJo9MPp3T_vta-ZS6ZlDG2tzVrUBaFFUZpwq0hIs5G50nRvkiOb-XwPDtyaHgEVo4QtYb85QY0nxBzFCG8POtoNZaaVP9tyfLHoRulISHfiWxibAtCWzy1xrwigrTJ1EF6htWT66P_s7RYtE40u5SbtDWejSZYkXDQH5iV7h2jsQVpavyI7tQ8PYfjBMXtA",
});

vk.updates.on("message_new", async (context) => {
  if (context.text === "Привет") {
    await context.send("Привет!");
  }
  if (context.text === "Посмотреть расписание") {
    fetch("https://api.ursei.su/public/schedule/rest/GetGSSchedIniData")
      .then((response) => response.json())
      .then((commits) => console.log(commits.FormEdu));
  }
  const builder = Keyboard.builder()
    .callbackButton({
      label: "Посмотреть расписание",
      payload: {
        command: "view",
        item: "table",
      },
    })
    .row();

  // Отправка клавиатуры
  await api.messages.send({
    message: "Привет", // Replace with your desired message content
    peer_id: context.peerId, // Replace with the appropriate peer_id
    keyboard: builder,
    random_id: Math.floor(Math.random() * 1000000), // Generate a random_id
  });
});

vk.updates.start();
