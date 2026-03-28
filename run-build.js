const { exec } = require('child_process');
const fs = require('fs');

exec('npm run build', { cwd: __dirname }, (error, stdout, stderr) => {
  fs.writeFileSync('build-output.txt', `STDOUT: ${stdout}\n\nSTDERR: ${stderr}\n\nERROR: ${error}`);
});
