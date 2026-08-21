const {showLogo} = require("./logo");
const {loading} = require("./spinner");


async function startup(){

    await showLogo();

    await loading(
        "Awakening Dark runtime",
        700
    );

}


module.exports = {
    startup,
    loading
};