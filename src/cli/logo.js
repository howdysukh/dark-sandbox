const sleep = ms =>
  new Promise(resolve => setTimeout(resolve, ms));


const logo = `
██████╗   █████╗  ██████╗  ██╗  ██╗
██╔══██╗ ██╔══██╗ ██╔══██╗ ██║ ██╔╝
██║  ██║ ███████║ ██████╔╝ █████╔╝ 
██║  ██║ ██╔══██║ ██╔══██╗ ██╔═██╗
██████╔╝ ██║  ██║ ██║  ██║ ██║  ██╗
╚═════╝  ╚═╝  ╚═╝ ╚═╝  ╚═╝ ╚═╝  ╚═╝
`;


async function showLogo() {

    console.clear();


    const lines = logo.split("\n");


    for (let i = 0; i < lines.length; i++) {

        console.log(lines[i]);

        await sleep(80);

    }


    await sleep(300);


    console.log(`
        DARK LANGUAGE ENGINE
              0.1.0
    `);

}


module.exports = {
    showLogo
};