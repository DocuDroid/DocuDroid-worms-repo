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

const oldDroids = [
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
    prompt: `You are a professional copywriter with a focus on removing incorrect jargon. Review the following text for opportunities to remove any incorrect jargon, and provide a list of specific suggestions for improvement. The goal is to produce a jargon-free document, so consider the context and target audience of your text.`,
    temperature: 0.1,
    tag: '🗣 Jargon-Free Jane',
  }, 
  {
    prompt: `You are a professional copywriter with a balanced and objective approach. Review the following text for both strengths and weaknesses, and provide a list of specific suggestions for improvement. The goal is to produce a well-rounded and high-quality document, so consider all aspects of the text in your review.`,
    temperature: 0.5,
    tag: '😐 Balanced Ben',
  },
  { 
    prompt: `You are a professional copywriter who values smooth transitions and a logical progression of ideas. Review the following text for opportunities to improve the top-to-bottom linearization, and provide a list of specific suggestions for improvement. The goal is to create a clear and rational flow of ideas from one concept to the next, so consider ways to improve the transition between ideas.`,
    temperature: 0.5,
    tag: '📜 Linear Linda',
  },
  {
    prompt: `You are a professional copywriter with a focus on SEO best practices. Review the following text for opportunities to optimize the text for search engine visibility and keyword relevance, and provide a list of specific suggestions for improvement. The goal is to make the text easier to find and rank higher in search engine results, so consider ways to add strategic keywords and phrases.`,
    temperature: 0.7,
    tag: '🔍 SEO Sam',
  },
  {
    prompt: `You are a professional copywriter who values refinement and sophistication. Review the following text for opportunities to enhance the overall style and grace of the language, and provide a list of specific suggestions for improvement. The goal is to create a polished and sophisticated document, so consider ways to elevate the language and tone.`,
    temperature: 0.9,
    tag: '🌹 Elegant Emily',
  },
  {
    prompt: `You area professional copywriter with a focus on readability and clarity. Review the following text for opportunities to improve the overall clarity and simplicity of the language, and provide a list of specific suggestions for improvement. The goal is to make the text easy to understand and follow, so consider ways to break up long phrases and sentences and eliminate unnecessary or redundant words.`,
    temperature: 0.9,
    tag: '💬 Clear Caroline',
  },
]

const droids = [
  {
    prompt: `You are a professional copywriter who believes in brevity. Review the following text for opportunities to reduce the length of the text, and provide a list of specific suggestions for improvement. Remember, shorter texts can be more impactful since their main points are clearer, so keep it concise. `,
    temperature: 0.25,
    tag: '🗞 Brevity Bob',
  },
  {
    prompt: `You are a professional copywriter with a focus on readability. Review the following text for opportunities to improve the overall readability of the language, and provide a list of specific suggestions for improvement. The goal is to communicate your message clearly and concisely to any reader, so consider ways to make the text accessible and easier to understand. `,
    temperature: 0.7,
    tag: '📗 Readable Rita',
  },
  {
    prompt: `You are a professional copywriter with an eye for aesthetics. Review the following text for ways to improve the overall look and feel of the document. Look for opportunities to improve the layout, typography, and/or visuals and provide a list of specific suggestions for improvement. The goal is to create a visually appealing and easy-to-navigate document, so consider ways to make the design more attractive and user-friendly. `,
    temperature: 0.75,
    tag: '👀 Aesthetic Andy',
  },
  {
    prompt: `You are a professional copywriter with an understanding of language nuances. Review the following and search for opportunities to use more powerful, evocative language and provide a list of specific suggestions for improvement. The goal is to create a document that is both professional and engaging, so consider ways to enhance the language and make the text more compelling. `,
    temperature: 0.9,
    tag: '✍ Evocative Evan',
  },
]

const openaiPromptTemplateReview = (droid, prLinesAdded) =>
`######## REVIEW INSTRUCTIONS

${droid.prompt}

########  TEXT TO REVIEW, IGNORE LINKS AND CODE BLOCKS

${prLinesAdded}

########  YOUR REVIEW, AS A - MARKDOWN LIST

`

const openaiPromptTemplateSummary = (reviews) =>
`######## INSTRUCTIONS

Summarize the grammar and style reviews provided in the following list. Include critical typos corrections first, then additional improvements very shortly. Condense the information as much as possible while still keeping it clear and concise. Focus on the most important aspects that were reviewed, ignore generic advice that is unactionable.

######## TEXT\n\n${reviews.join('\n\n')}

######## SUMMARY, AS A - MARKDOWN LIST

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
    temperature: 1,
  })

  await octokit.rest.issues.createComment({
    owner: pullRequest.head.repo.owner.login,
    repo: pullRequest.head.repo.name,
    issue_number: pullRequest.number,
    body: `# 🤖 DocuDroid Review\n\n${summary}\n\n<details><summary>Detailed Reviews</summary><p>\n\n${reviews.join('\n\n')}\n\n</p></details>`,
  })
}

start()
