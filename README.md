# DocuDroid

Writing bot at your service 🤖

<img src="https://cdn.discordapp.com/attachments/1009590950894505994/1053057379517878352/Worms_profile_picture_for_robot_that_helps_with_writing_ios_app_a37f5420-29eb-484c-b6fd-7a4f6c0269f1.png" width="300px" />

Avoid pushing grammar errors to prod!

This Github workflow action sends any new text added in a PR to GPT Edit for grammar review.

## Add to your repo

1) Copy the .yml and .js files to your repo to the same paths. Use one of the [releases](https://github.com/MarcoWorms/DocuDroid/releases) to guarantee that you are using a stable version of DocuDroid.
2) In your repo settings go to "enviroments" and add a github token as `GH_TOKEN` and openai token as `OPENAI_TOKEN`
3) It's done, new PRs opened against your repo will have a reply with grammar fixes for new text added
4) If you want to change the Edit prompt being sent to OpenAI change this [line](https://github.com/MarcoWorms/actions-test/blob/main/script.js#L34)

## Example PR

![image](https://user-images.githubusercontent.com/7863230/208171299-ca2a1afe-322e-42c1-a7ad-48cf1778dd3b.png)

## Example suggestion for the PR above

![image](https://user-images.githubusercontent.com/7863230/208171338-8dd5c13c-255e-43e0-a6ed-955cd007137b.png)

## What I want it to do:

- Typos and grammar 
- Narrator tone standardization
- Jargon removal
- Reduce useless words
- Break long phrases and sentences into smaller ones
- Top-to-bottom concept linearization (explain concepts before usage)
- Technical review (factual review)
