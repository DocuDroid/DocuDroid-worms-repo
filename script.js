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
        .trim()
    ).join('\n\n')
  ).join('\n\n').trim()
  
  // testing new way to review
  const rawResponse1 = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Act as a professional copywriter and coder. Make a pull request review for the following PR diff, make sure there are no grammars and typos being introduced, answer with only suggestions you have for improvements:\n\n${prDiff.data}\n\n`,
    temperature: 0.7,
    top_p: 1,
    max_tokens: 2000,
    frequency_penalty: 0,
    presence_penalty: 0,
  })
  const response1 = rawResponse1.data.choices[0].text.trim()
  await octokit.rest.issues.createComment({
    owner: pullRequest.user.login, // only works for the repo owner atm
    repo: pullRequest.head.repo.name,
    issue_number: pullRequest.number,
    body: `### DocuDroid Review \n\n${response1}`,
  })
  
  // iterates all prompts
  prompts.forEach(async (prompt, i) => {
    
    // delays 5 seconds between each call so we dont spam apis
    await new Promise(resolve => setTimeout(resolve, i * 10000))
                
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
    const responseDiff = diff.diffLines(prLinesAdded.trim(), rawResponse.data.choices[0].text.trim()).map((part) => 
      part.added
        ? 'ADD LINE: ' + part.value
        : part.removed
          ? 'DEL LINE: ' + part.value
          : null
    ).filter(el => el !== null).join('\n')
    
    // create response on github
    await octokit.rest.issues.createComment({
      owner: pullRequest.user.login,
      repo: pullRequest.head.repo.name,
      issue_number: pullRequest.number,
      body: `### DocuDroid Suggestions \n\n **Instructions:** ${prompt.instruction}\n\n---\n#### Suggestions:\n\`\`\`\n${responseDiff}\n\`\`\`\n---\n#### Raw Result:\n\`\`\`\n${response}\n\`\`\``,
    })
  })
 
}

start()
