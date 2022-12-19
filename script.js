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
const prompts = [
  {
    instruction: "fix all typos and grammar so it doesn't have any errors, the text should have no typos at all",
    temperature: 0.2,
  },
  {
    instruction: "review this text like a professional copywriter for the best acessibility possible",
    temperature: 1,
  },
  {
    instruction: "improve text clarity and readability, maintain the meaning",
    temperature: 1,
  },
]

async function start () {
  
  // gets the diff for the current PR
  const prDiff = await axios.get(pullRequest.diff_url)
  
  // gets all lines added in this PR diff, ignores lines removes to save tokens space for GPT-Edit api
  const prLinesAdded = diff.parsePatch(prDiff.data).map(block => 
    block.hunks.map(hunk => 
      hunk.lines
        .filter(line => line[0] === '+')
        .map(line => line.substring(1))
        .filter(line => line !== '')
        .reduce((acc, line) => acc + '\n' + line, '')
    ).join('\n\n')
  ).join('\n\n').trim()
  
  // iterates all prompts
  prompts.forEach(async (prompt, i) => {
    
    // delays 5 seconds between each call so we dont spam apis
    await new Promise(resolve => setTimeout(resolve, i * 5000))
                
    // sends text added in PR to GPT-Edit for revision, prompts can override all default values here
    const rawResponse = await openai.createEdit({
      model: "text-davinci-edit-001",
      input: prLinesAdded,
      temperature: 0.7,
      top_p: 1,
      ...prompt,
    })
    const response = rawResponse.data.choices[0].text.trim()

    // create response diff between text added and text reviewed by GPT-Edit, sending the entire gpt-edit response would be to cumbersome to read it all again.
    const responseDiff = diff.diffWords(prLinesAdded, rawResponse.data.choices[0].text).map((part) => 
      part.added
        ? 'ADD WORD: ' + part.value
        : part.removed
          ? 'DEL WORD: ' + part.value
          : null
    ).filter(el => el !== null).join('\n')
    
    // create response on github
    await octokit.rest.issues.createComment({
      owner: pullRequest.user.login,
      repo: pullRequest.head.repo.name,
      issue_number: pullRequest.number,
      body: `DocuDroid was instructed to: \`${prompt.instruction}\`  \n\n**Diff:**\n\`\`\`\n${responseDiff}\n\`\`\`  \n\n**Result:**\n\`\`\`\n${response}\n\`\`\``,
    })
  })
 
}

start()
