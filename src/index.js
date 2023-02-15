const Votaciones = require("./Votaciones");

async function main() {
  try {
    const votaciones = new Votaciones();
    // connect
    await votaciones.connect_client();
    await votaciones.generateVoters();
    for (let voter of votaciones._voters) {
      await votaciones.vote(
        voter,
        votaciones._candidates[
          Math.floor(Math.random() * votaciones._voters.length)
        ]
      );
    }
    console.log(await votaciones.winner());
    await votaciones.disconnect_client();
  } catch (error) {
    console.log(error);
  }
}

main();
