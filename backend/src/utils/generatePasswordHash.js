const bcrypt = require('bcrypt');

async function main() {
  const password = process.argv[2];

  if (!password) {
    console.error('Usage: node src/utils/generatePasswordHash.js <password>');
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);

  process.stdout.write(hash);
}

main().catch(function handleError(error) {
  console.error(error);
  process.exit(1);
});
