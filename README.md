# Nylas Passport example

Run locally with:
```
NYLAS_ID=<your_nylas_app_id> NYLAS_SECRET=<your_nylas_app_secret> NYLAS_CB=http://localhost:4000/auth/nylas/cb/ npm run debug
```

Make sure to have configured your Nylas app at https://dashboard.nylas.com/applications with the correct callback url:
1. In list of applications click edit
2. Change tab to Application Callbacks
3. Add Callback http://localhost:4000/auth/nylas/cb/
