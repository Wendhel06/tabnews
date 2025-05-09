import bcryptjs from "bcryptjs";

export async function hash(password) {
  const rounds = getNumberOfRounds();
  return await bcryptjs.hash(password, rounds);
}

function getNumberOfRounds() {
  let rounds = 1;

  if (process.env.NODE_ENV === "production") {
    rounds = 14;
  }

  return rounds;
}

export async function compare(providedPassword, storedPassword) {
  return bcryptjs.compare(providedPassword, storedPassword);
}
