const { Configuration, OpenAIApi } = require('openai')
const github = require('@actions/github')
const axios = require('axios')
const diff = require('diff')

// process.env is set by github repo settings at environments secrets

const octokit = github.getOctokit(process.env.GH_TOKEN)
const context = github.context

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_TOKEN
  })
)

const pullRequest = context.payload.pull_request

const droids = [
  {
    prompt: `You are a professional copywriter who values simplicity and concision. Review the following text for opportunities to reduce wordiness and complexity, and provide a list of specific suggestions for improvement. Remember, the goal is to communicate your message clearly and efficiently, so eliminate any unnecessary or redundant words and phrases.`,
    temperature: 0.1,
    tag: '🤐 Concise Carol',
  },
  {
    prompt: `You are a professional copywriter with a keen eye for detail. Review the following text for grammar errors and typos, and provide a list of specific suggestions for improvement. Remember, the goal is to produce a polished and error-free document, so don't let any mistakes slip through!`,
    temperature: 0.1,
    tag: '🧐 Critical Kate',
  },
  {
    prompt: `You are a professional copywriter with a strong background in technical language and concepts. Review the following text for factual errors or inconsistencies, and provide a list of specific suggestions for improvement. The goal is to produce a technically accurate and reliable document, so pay close attention to the details.`,
    temperature: 0.1,
    tag: '🤖 Technical Tom',
  },
  {
    prompt: `You are a professional copywriter with a balanced and objective approach. Review the following text for both strengths and weaknesses, and provide a list of specific suggestions for improvement. The goal is to produce a well-rounded and high-quality document, so consider all aspects of the text in your review.`,
    temperature: 0.5,
    tag: '😐 Balanced Ben',
  },
  {
    prompt: `You are a professional copywriter who values originality and creativity. Review the following text for opportunities to inject more personality and humor into the language, and provide a list of specific suggestions for improvement. The goal is to make the text more engaging and memorable, so don't be afraid to get creative and think outside the box!`,
    temperature: 0.5,
    tag: '🌈 Quirky Quinn',
  },
  {
    prompt: `You are a professional copywriter with a focus on maintaining a consistent narrator's voice and tone. Review the following text for shifts or inconsistencies in the narrator's voice, and provide a list of specific suggestions for improvement. The goal is to produce a cohesive and immersive narrative, so pay close attention to the overall tone and personality of the text.`,
    temperature: 0.5,
    tag: '🎤 Narrative Nick',
  },
  {
    prompt: `You are a professional copywriter who values refinement and sophistication. Review the following text for opportunities to enhance the overall style and grace of the language, and provide a list of specific suggestions for improvement. The goal is to create a polished and sophisticated document, so consider ways to elevate the language and tone.`,
    temperature: 0.9,
    tag: '🌹 Elegant Emily',
  },
  {
    prompt: `You are a professional copywriter with a flair for the creative and expressive. Review the following text for opportunities to add more personality and flair, and provide a list of specific suggestions for improvement. The goal is to make the text more engaging and memorable, so don't be afraid to get creative!`,
    temperature: 0.9,
    tag: '🎨 Creative Cindy',
  },
  {
    prompt: `You area professional copywriter with a focus on readability and clarity. Review the following text for opportunities to improve the overall clarity and simplicity of the language, and provide a list of specific suggestions for improvement. The goal is to make the text easy to understand and follow, so consider ways to break up long phrases and sentences and eliminate unnecessary or redundant words.`,
    temperature: 0.9,
    tag: '💬 Clear Caroline',
  },
]

const openaiPromptTemplateReview = (droid, prLinesAdded) =>
`######## REVIEW INSTRUCTIONS

${droid.prompt}

########  TEXT TO REVIEW

${prLinesAdded}

########  YOUR REVIEW AS A LIST

`

const openaiPromptTemplateSummary = (reviews) =>
`######## INSTRUCTIONS

Summarize the grammar and style reviews provided in the following list. Include any corrections and typos, as well as key points on strengths, weaknesses, and suggestions for improvement. Try to condense the information as much as possible while still keeping it clear and concise, answer in a - markdown list format:

######## TEXT\n\n${reviews.join('\n\n')}

######## SUMMARY

`
const requestOpenAI = async (config) => {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    top_p: 1,
    max_tokens: 1500,
    frequency_penalty: 0,
    presence_penalty: 0,
    temperature: 0.5,
    ...config
  })
  
  return response.data.choices[0].text.trim()
}

const filterTolLeaveOnlyLinesAdded = (prDiff) => 
  diff.parsePatch(prDiff.data).map(file => 
    file.hunks.map(hunk => 
      hunk.lines
        .filter(line => line[0] === '+')
        .map(line => line.substring(1))
        .filter(line => line !== '')
        .reduce((acc, line) => acc + '\n' + line, '')
        .trim()
    ).join('\n\n')
  ).join('\n\n').trim()


const start = async () => {
  const prDiff = await axios.get(pullRequest.diff_url)
  const prLinesAdded = filterTolLeaveOnlyLinesAdded(prDiff)

  const reviews = await Promise.all(droids.map(async (droid, i) => {
    const review = await requestOpenAI({
      prompt: openaiPromptTemplateReview(droid, prLinesAdded),
      temperature: droid.temperature || 0.5,
    })
    return '## ' + droid.tag + '\n' + review
  }))

  const summary = await requestOpenAI({
    prompt: openaiPromptTemplateSummary(reviews),
    temperature: 0.3,
  })

  await octokit.rest.issues.createComment({
    owner: pullRequest.head.repo.owner.login,
    repo: pullRequest.head.repo.name,
    issue_number: pullRequest.number,
    body: `# 🤖 DocuDroid Review\n\n${summary}\n\n<details><summary>Detailed Reviews</summary><p>\n\n${reviews.join('\n\n')}\n\n</p></details>`,
  })
}

start()
