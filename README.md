# DocuDroid

Writing bot at your service 🤖

<img src="https://cdn.discordapp.com/attachments/1009590950894505994/1053057379517878352/Worms_profile_picture_for_robot_that_helps_with_writing_ios_app_a37f5420-29eb-484c-b6fd-7a4f6c0269f1.png" width="300px" />

Avoid pushing copy errors to prod!

This Github workflow action sends any new text added in a PR to GPT Edit for grammar review.

- [Latest Version Showcase](https://github.com/MarcoWorms/DocuDroid/pull/110)

## Add to your repo

1) Copy the .yml and .js files to your repo to the same paths. Use one of the [releases](https://github.com/MarcoWorms/DocuDroid/releases) to guarantee that you are using a stable version of DocuDroid.
2) In your repo settings go to "enviroments" and add a github token as `GH_TOKEN` and openai token as `OPENAI_TOKEN`
3) It's done, new PRs opened against your repo will have a reply with grammar fixes for new text added
4) If you want to change the Edit prompt being sent to OpenAI change this [line](https://github.com/MarcoWorms/actions-test/blob/main/script.js#L34)

## How it Works

![Untitled-2022-12-20-1148](https://user-images.githubusercontent.com/7863230/208957775-f2b2cd85-95c5-46ad-be63-7422fd8820a5.png)
