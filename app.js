const { App, createNodeMiddleware } = require("@octokit/app");
require('dotenv').config()

const express = require("express");

const expressApp = express();

const app = new App({
    appId: process.env.GITHUB_APP_ID,
    privateKey: process.env.GITHUB_APP_PRIVATE_KEY,
    oauth: {
        clientId: process.env.GITHUB_APP_CLIENT_ID,
        clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
    },
    webhooks: {
        secret: process.env.WEBHOOK_SECRET,
    },
});

app.webhooks.on("repository.created", async ({ octokit, payload }) => {

    // console.log(payload);
    // console.log(`Configuring branch protection for repo ${payload.repository.name}`)
    await octokit.request(
        "PUT /repos/{owner}/{repo}/branches/{branch}/protection",
        {
            owner: payload.repository.owner.login,
            repo: payload.repository.name,
            branch: payload.repository.default_branch,
            required_status_checks: {
                contexts: [],
                strict: true,
            },
            enforce_admins: true,
            required_pull_request_reviews: {
                dismiss_stale_reviews: true,
                required_approving_review_count: 1,
            },
            required_linear_history: true,
            allow_force_pushes: false,
            allow_deletions: false,
            required_conversation_resolution: true,
            restrictions: null,
        }
    );

});

expressApp.use(createNodeMiddleware(app));

expressApp.get('/', (req, res) => {
    console.log(`Healthcheck on ${req.path}`)
    res.send('ok')
})

expressApp.get('/healthcheck', (req, res) => {
    console.log(`Healthcheck on ${req.path}`)
    res.send('ok')
})

const port = process.env.PORT || 3000;

console.log(process.env)

expressApp.listen(port, '0.0.0.0');
