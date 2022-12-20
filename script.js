const { Configuration, OpenAIApi } = require('openai')
const github = require('@actions/github')
const axios = require('axios')
const diff = require('diff')

// process.env is set by github repo settings at environments secrets

// start github api
const octokit = github.getOctokit(process.env.GH_TOKEN)
const context = github.context

// start openai api
const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_TOKEN
  })
)

// obtain current PR data
const pullRequest = context.payload.pull_request

// config instructions for each review type for GPT-Edit
const commands = [
  {
    prompt: `Act as a professional copywriter and coder. Make a pull request review for the following PR diff, there should be no grammars and typos being introduced, answer straightforward and direct suggestions you have for improvements`,
    temperature: 0,
  },
  {
    prompt: `Act as a professional copywriter and coder. Make a pull request review for the following PR diff, there should be no grammars and typos being introduced, answer straightforward and direct suggestions you have for improvements`,
    temperature: 0.5,
  },
  {
    prompt: `Act as a professional copywriter and coder. Make a pull request review for the following PR diff, there should be no grammars and typos being introduced, answer straightforward and direct suggestions you have for improvements`,
    temperature: 1,
  },
]

async function start () {
  
  // gets the diff for the current PR
  const prDiff = await axios.get(pullRequest.diff_url)
  
  // gets all lines added in this PR diff
  // not used atm but can be used to send less tokens to GPT API and deal with the 4k token limit on lerger PRs
  
//   const prLinesAdded = diff.parsePatch(prDiff.data).map(block => 
//     block.hunks.map(hunk => 
//       hunk.lines
//         .filter(line => line[0] === '+')
//         .map(line => line.substring(1))
//         .filter(line => line !== '')
//         .reduce((acc, line) => acc + '\n' + line, '')
//         .trim()
//     ).join('\n\n')
//   ).join('\n\n').trim()
  
  // iterates all prompts
  commands.forEach(async (command, i) => {
    
    // delays 5 seconds between each call so we dont spam apis
    await new Promise(resolve => setTimeout(resolve, i * 10000))

    const rawResponse = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: command.prompt + `\n\n${prDiff.data}\n\n`,
      temperature: command.temperature || 0.5,
      top_p: 1,
      max_tokens: 2000,
      frequency_penalty: 0,
      presence_penalty: 0,
    })
    
    const response = rawResponse.data.choices[0].text.trim()
    await octokit.rest.issues.createComment({
      owner: pullRequest.user.login, // only works for the repo owner atm
      repo: pullRequest.head.repo.name,
      issue_number: pullRequest.number,
      body: `### DocuDroid Review\n\nInstructions: *${command.prompt}*\nTemperature: *${command.temperature}*\n\n---\n\n${response}`,
    })

}

start()
