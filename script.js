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

const basePrompt = ' a professional copywriter. Make a review for the following text being added to a markdown codebase, there should be NO GRAMMAR ERRORS and NO TYPOS being introduced, do not allow them to pass. Reply with list of suggestion and reasoning for them, also the line to be fixed. START OF TEXT TO REVIEW:'

const commands = [
  {
    prompt: 'You are Steady Teddy 🤠, ' + basePrompt,
    temperature: 0,
    tag: '🤠 Steady Teddy'
  },
  {
    prompt: 'You are Cool Cole 😎, ' + basePrompt,
    temperature: 0.5,
    tag: '😎 Cool Cole'
  },
  {
    prompt: 'You are Party Jack 🥳, ' + basePrompt,
    temperature: 1,
    tag: '🥳 Party Jack'
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
  const responses = await Promise.all(commands.map(async (command, i) => {
    
    // delays 1 seconds between each call so we dont spam apis
    await new Promise(resolve => setTimeout(resolve, i * 1000))
    
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

    return '**' + command.tag + '**: ' + response
  
  }))

  await octokit.rest.issues.createComment({
    owner: pullRequest.head.repo.owner.login,
    repo: pullRequest.head.repo.name,
    issue_number: pullRequest.number,
    body: `# DocuDroid Review\n\n${responses.join('\n\n')}`,
  })

}

start()
