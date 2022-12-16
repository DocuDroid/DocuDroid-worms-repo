# GPT Edit Workflow Action

I made this action so it automatically sends new text being added in PRs to GPT-Edit API and ask it to fix grammar. The idea is to help avoiding any pushing grammar errors to prod.

1) copy the .yml and .js files to your repo to the same paths
2) in your repo settings go to "enviroments" and add a github token as `GH_TOKEN` and openai token as `OPENAI_TOKEN`
3) it's done, new PRs opened against your repo will have a reply with grammar fixes for new text added
4) if you want to change the Edit prompt being sent to OpenAI change this [line](https://github.com/MarcoWorms/actions-test/blob/main/script.js#L34)

Example PR:

![image](https://user-images.githubusercontent.com/7863230/208171299-ca2a1afe-322e-42c1-a7ad-48cf1778dd3b.png)

Example suggestion for the PR above:

![image](https://user-images.githubusercontent.com/7863230/208171338-8dd5c13c-255e-43e0-a6ed-955cd007137b.png)
