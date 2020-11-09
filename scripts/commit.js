const shell = require('shelljs')

const commitMessage = process.argv[3]

/*
eval `ssh-agent -s`
ssh-add ~/.ssh/personal
*/

shell.exec('git add .')
shell.exec(`git commit -m "${commitMessage}"`)
shell.exec('git push -f')
// shell.exec('git push -f origin master')
