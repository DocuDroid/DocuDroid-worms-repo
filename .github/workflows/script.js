const { context, github } = require('@actions/github');

// Create a new OpenAPI client
const client = new openapi.Client({
  // Add your OpenAPI service URL here
  url: 'https://example.com/openapi'
});

// Get the list of changed files from the pull request event
const changedFiles = context.payload.pull_request.changed_files;

// Add a comment to the pull request with the OpenAPI response
github.issues.createComment({
  owner: context.payload.repository.owner.login,
  repo: context.payload.repository.name,
  issue_number: context.payload.pull_request.number,
  body: `changedFiles`,
});
