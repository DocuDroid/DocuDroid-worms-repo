const { Configuration, OpenAIApi } = require('openai')
const github = require('@actions/github')
const axios = require('axios')
const diff = require('diff')

const octokit = github.getOctokit(process.env.GH_TOKEN)
const context = github.context

const configureOpenai = apiKey => new OpenAIApi(
  new Configuration({ apiKey: process.env.OPENAI_TOKEN })
)

const openai = configureOpenai(apiKey)

async function start () {
  
  const res = await axios.get(pullRequest.diff_url)
  
  const body = diff.parsePatch(res.data).map(block => 
    block.hunks.map(hunk => 
      hunk.lines
        .filter(line => line[0] !== '-')
        .reduce((acc, line) => acc + '\n' + line, '')
    ).join('\n\n')
  ).join('\n\n')
  
  const rawResponse = await openai.createEdit({
    model: "text-davinci-edit-001",
    input: body,
    instruction: "fix grammar, don't let a single grammar error pass, this text can't contain grammatical errors",
    temperature: 0.7,
    top_p: 1,
  })
  const response = rawResponse.data.choices[0].text.trim()
  
  const pullRequest = context.payload.pull_request
  
  await octokit.rest.issues.createComment({
    owner: pullRequest.user.login,
    repo: pullRequest.head.repo.name,
    issue_number: pullRequest.number,
    body,
  })
  
}

start()
