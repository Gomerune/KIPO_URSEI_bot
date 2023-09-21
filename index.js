const { VK, Keyboard } = require("vk-io");
const { HearManager } = require("@vk-io/hear");
const moment = require("moment");
const fetch = require("node-fetch");


const vk = new VK({
  token:
    "vk1.a.TYEB8xnSiam065P-Mpw1GZa3O5oj6aF48sSFcI3ip2XbV4FeT0xSOe9meekaOttEvXGepIX98qIOidDT00O6joA_VhSHZABgRVnU0ltg-TQEQjYs9b88knFTDE3Vxw36tLo_g7Pr9i7hk4MVDYyXjxJmq8loESPX3bIJ_P26bqqYah6nWxFxnglTReCne1FrVubSiRQGdo53BRPeCIqoCw",
});

const hearManager = new HearManager();

vk.updates.on("message_new", (context, next) => {
  const { messagePayload } = context;

  context.state.command = messagePayload && messagePayload.command ? messagePayload.command : null;

  return next();
});

vk.updates.on("message_new", hearManager.middleware);

function sliceIntoChunks(arr, chunkSize) {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

const updateData = async () => {
  const data = await fetch("https://api.ursei.su/public/schedule/rest/GetGSSchedIniData")
    .then((response) => response.json())
    .then((commits) => {
      return commits.FormEdu;
    });
  if (data.length == 0) return null;
  return data;
};

const getSchedule = async (id) => {
  const data = await fetch(`https://api.ursei.su/public/schedule/rest/GetGsSched?grpid=${id}`)
    .then((response) => response.json())
    .then((commits) => {
      return commits;
    });
  return data;
};

const tableConstruct = (data) => {
  var now = moment();
  const textArray = new Array();
  data.Month[0].Sched.forEach((element) => {
    dataFromSchedule = element.datePair.split(".");
    data = new Date(dataFromSchedule[2], dataFromSchedule[1] - 1, dataFromSchedule[0]);
    data = moment(data);
    const makeAbbr = (string) =>
      string
        .split(" ")
        .map((word) => word.substring(0, 5))
        .join(" ");
    if (now.day() in [6, 7]) {
      now.add(2, "days");
    }
    if (data.isoWeek() == now.isoWeek()) {
      let table = `---> ${element.dayWeek} ${element.datePair}\n`;
      element.mainSchedule.forEach((el) => {
        table += `${el.TimeStart} | ${makeAbbr(el.SubjName)} | ${el.LoadKindSN.substring(0, 4)} | ${el.Aud}\n`;
      });
      textArray.push(table);
    }
  });
  return textArray;
};

// Simple wrapper for commands
const hearCommand = (name, conditions, handle) => {
  if (typeof handle !== "function") {
    handle = conditions;
    conditions = [`/${name}`];
  }

  if (!Array.isArray(conditions)) {
    conditions = [conditions];
  }

  hearManager.hear([(text, { state }) => state.command === name, ...conditions], handle);
};

// Handle start button
hearCommand("start", (context, next) => {
  context.state.command = "help";

  return Promise.all([next()]);
});

hearCommand("help", async (context) => {
  await context.send({
    message: `Привет-привет, нажми на кнопку и узнай когда у тебя пары ^-^`,
    keyboard: Keyboard.builder().textButton({
      label: "Расписание",
      payload: {
        command: "schedule",
      },
    }),
  });
});

hearCommand("schedule", async (context) => {
  keyboardToSend = new Array();
  data = await updateData();
  if (!data)
    await context.send({
      message: "На серверах УрСЭИ какие-то технические шоколадки.",
    });
  else {
    data.forEach((element) => {
      keyboardToSend.push(
        Keyboard.textButton({
          label: element.FormEduName,
          payload: {
            command: `table`,
            item: element.FormEdu_ID - 1,
          },
        })
      );
    });
    keyboardToSend.push(
      Keyboard.textButton({
        label: "В начало",
        payload: {
          command: `help`,
        },
        color: Keyboard.NEGATIVE_COLOR,
      })
    );
    await context.send({
      message: `Выберите ваш вид обучения.`,
      keyboard: Keyboard.keyboard(sliceIntoChunks(keyboardToSend, 2)),
    });
  }
});

hearCommand("table", async (context) => {
  keyboardToSend = new Array();
  data = await updateData();
  formEdu = context.messagePayload.item;
  curs = data[formEdu];
  curs.arr.forEach((element) => {
    keyboardToSend.push(
      Keyboard.textButton({
        label: `${element.Curs} курс`,
        payload: {
          command: `curs`,
          item: `${formEdu}_${element.Curs - 1}`,
        },
      })
    );
  });
  keyboardToSend.push(
    Keyboard.textButton({
      label: "В начало",
      payload: {
        command: `help`,
      },
      color: Keyboard.NEGATIVE_COLOR,
    })
  );
  await context.send({
    message: `Выберите ваш курс.`,
    keyboard: Keyboard.keyboard(sliceIntoChunks(keyboardToSend, 2)),
  });
});

hearCommand("curs", async (context) => {
  keyboardToSend = new Array();
  data = await updateData();
  ids = context.messagePayload.item.split("_");
  formEdu = ids[0];
  curs = ids[1];
  groups = data[formEdu].arr[curs];

  groups.arr.forEach((element) => {
    keyboardToSend.push(
      Keyboard.textButton({
        label: element.GSName,
        payload: {
          command: `groupSchedule`,
          item: element.GS_ID,
        },
      })
    );
  });
  keyboardToSend.push(
    Keyboard.textButton({
      label: "В начало",
      payload: {
        command: `help`,
      },
      color: Keyboard.NEGATIVE_COLOR,
    })
  );
  await context.send({
    message: `Выберите вашу группу.`,
    keyboard: Keyboard.keyboard(sliceIntoChunks(keyboardToSend, 2)),
  });
});

hearCommand("groupSchedule", async (context) => {
  data = await getSchedule(context.messagePayload.item);
  const text = tableConstruct(data);
  if (data) {
    await context.send({
      message: text.join("\n\n"),
      keyboard: Keyboard.builder().textButton({
        label: "В начало",
        payload: {
          command: `help`,
        },
        color: Keyboard.NEGATIVE_COLOR,
      }),
    });
  } else {
    await context.send({
      message: "На стороне УрСЭИ ошибка.",
    });
  }
});
console.log("Бот запущен!")
vk.updates.start().catch(console.error);
