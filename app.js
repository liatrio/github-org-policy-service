const { App, createNodeMiddleware } = require("@octokit/app");
const morgan = require("morgan");
const express = require("express");
const expressApp = express();

expressApp.use(morgan('common'));

require('dotenv').config()

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

const protection_events = [
    "repository.created",
    "branch_protection_rule.created",
    "branch_protection_rule.edited",
    "branch_protection_rule.deleted"
]

app.webhooks.on(protection_events, async ({ octokit, payload }) => {
    console.log(payload);

    if(payload.sender.type !== 'Bot') {
        await octokit.request(
            "PUT /repos/{owner}/{repo}/branches/{branch}/protection",
            {
                owner: payload.repository.owner.login,
                repo: payload.repository.name,
                branch: "main",
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
    }
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

expressApp.use(express.json())

expressApp.listen(port, '0.0.0.0');


