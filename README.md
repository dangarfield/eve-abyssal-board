# EVE Abyss Board
> Buy and sell EVE online abyssal modules for FREE - [abyssboard.space](https://abyssboard.space)

![Abyss Board](https://i.ibb.co/LvXpfhn/Screenshot-2023-09-25-at-20-15-18.png)



## What is it about?
- Public website - [abyssboard.space](https://abyssboard.space)
- It's an easy way to sell and buy abyssal modules for EVE Online
- One click listing for all your abyssal items
- Significantly improve UI and search for buyers looking for certain mods

## Technical Overview
- Simple framework-less UI
- Static site hosted UI
- All server-side functionality hosted in lambda functions (currently a mono-lambda)
- Hosted primarily on netlify
- Heroku hosted scheduled services
- ZERO run time costs. All currently within free tier. Minus the domain name.


## Getting Started - Development
- Install node.js and `npm i`
- Setup a mongodb instance, can be anywhere
- Setup EVE Online SSO application - eg, for local and production
- Rename `.env.local.example` to `.env.local`
- Populate environment variables
- You can run `npm run generate-data` to download, process and prepaee data set from EVE SDE
- Install and configure `netlify dev` for local development
- Run local development by `npm run dev` - Which builds local front and netlify local lambda function APIs

## Prod Deployment
- Configure netlify environment variables
- Link netlify to github for automated deployments
- Heroku is used for scheduled services (polling newly created contracts, checking corp transactions and updating payments etc) - Add heroku scheduler plugin and configure to run `node backend/scheduled-service/job.js` every 10 minutes. Disable web dynos.
- *Note: When first running this job, it'll take a long time. Either leave it and it'll catch up eventually, or run locally and sync the local DB contracts collection to prod. Message me if stuck*