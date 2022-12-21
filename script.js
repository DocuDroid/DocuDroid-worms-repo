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
console.log(pullRequest.head)

const basePrompt = 'As a professional copywriter, make a review for the following text being added to a markdown codebase, there should be NO GRAMMAR ERRORS and NO TYPOS being introduced, do not allow them to pass. Reply with list of suggestion and reasoning for them. START OF TEXT TO REVIEW:'
// config instructions for each review type for GPT-Edit
const commands = [
  {
    prompt: basePrompt,
    temperature: 0.75,
  },
]

async function start () {
  
  // gets the diff for the current PR
  const prDiff = await axios.get(pullRequest.diff_url)
  
  // gets all lines added in this PR diff
  const prLinesAdded = diff.parsePatch(prDiff.data).map(block => 
    block.hunks.map(hunk => 
      hunk.lines
        .filter(line => line[0] === '+')
        .map(line => line.substring(1))
        .filter(line => line !== '')
        .reduce((acc, line) => acc + '\n' + line, '')
        .trim()
    ).join('\n\n')
  ).join('\n\n').trim()
  
  // iterates all prompts
  commands.forEach(async (command, i) => {
    
    // delays 5 seconds between each call so we dont spam apis
    await new Promise(resolve => setTimeout(resolve, i * 5000))
    
    const prompt = command.prompt + `\n\n${prLinesAdded}\n\n` + 'END OF TEXT TO REVIEW. Answer only with the review now:'
    
    const rawResponse = await openai.createCompletion({
      model: "text-davinci-003",
      top_p: 1,
      max_tokens: 4000 - Math.floor((prompt.length / 3) * 4),
      frequency_penalty: 0,
      presence_penalty: 0,
      prompt,
      temperature: command.temperature || 0.5,
    })
    
    const response = rawResponse.data.choices[0].text.trim()
    await octokit.rest.issues.createComment({
      owner: pullRequest.head.repo.owner.login,
      repo: pullRequest.head.repo.name,
      issue_number: pullRequest.number,
      body: `### DocuDroid Review\n\n${response}`,
    })
  
  })

}

start()
