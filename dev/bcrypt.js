import bcrypt from "bcrypt";

// CREATE SALT AND HASH WHEN USER CREATES PASSWORD
const salt = await bcrypt.genSalt();
console.log(`salt: ${salt}`);
const hash = await bcrypt.hash("password", salt);
console.log(`hash: ${hash}`);

const databaseHash =
  " $2b$10$D21iAtWJhhEmaqTJlHPgs.IpYuXQ/s.WwxBDNaOEVMDo6GMpGG3ja";
console.log(await bcrypt.compare(password, databaseHash));
