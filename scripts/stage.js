const shell = require('shelljs')

const message = process.argv[3]
const branchName = message.toLowerCase().split(' ').join('-')

/*
eval `ssh-agent -s`
ssh-add ~/.ssh/personal
*/

shell.exec(`git checkout -b ${branchName}`)
shell.exec('git add .')
shell.exec(`git commit -m "${message}"`)
shell.exec(`git push origin ${branchName}`)
