const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms));


async function loading(text, duration = 800) {

  const frames = [
    "◐",
    "◓",
    "◑",
    "◒"
  ];

  let i = 0;

  const timer = setInterval(() => {

    process.stdout.write(
      `\r${frames[i % frames.length]} ${text}`
    );

    i++;

  }, 120);


  await sleep(duration);

  clearInterval(timer);

  process.stdout.write(
    `\r✓ ${text}\n`
  );
}


module.exports = {
  loading
};