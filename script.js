const github = require('@actions/github')
const openai = require('openai')
const axios = require('axios')
const diff = require('diff')

const octokit = github.getOctokit(process.env.TOKEN)
const context = github.context

const pullRequest = context.payload.pull_request;

async function start () {
  
  const res = await axios.get(pullRequest.diff_url)
  
  const body = diff.parsePatch(res.data).map(block => 
    block.hunks.map(hunk => 
      hunk.lines
        .filter(line => line[0] !== '-')
        .reduce((acc, line) => acc + '\n' + line, '')
    ).join('\n\n')
  ).join('\n\n')
  
  await octokit.rest.issues.createComment({
    owner: pullRequest.user.login,
    repo: pullRequest.head.repo.name,
    issue_number: pullRequest.number,
    body,
  })
  
}

start()
