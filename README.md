# me3-app



## Getting started
- setup
- eslint prettier
- file directory
- file naming

## Git workflow
The protected branch are 
- main (prod)
- pre-prod (staging)
- dev

For individual development, we follow git flow. The naming convention on feature branch will be:
- {your-name}/{feature}
> Grouping individual developer's branch under their own name makes it easy to track

Raise a PR to /dev branch for any new features
## Folder overview
All RN related code should put under /src (with the exception of basic config file which required at top level). 
### Overview
Our folder structure is as below:
- src/api/
    - ApiEndpoints.js
    - ApiManager.js
    - ApiFunctions.js
    - apiCoins.js
    - apiNFT.js
    - apiSwap.js
    - apiWallet.js
- src/assets/
    - fonts/
    - images/ (For assets, it is recommended to have close, close@2x, close@3x)
    - lottie/
- src/chains/
    - (todo) to be reviewed later on
- src/components/ (Common components. Screen specific components can put under /{name}Screen/ itself, & move it to here once it is being reused)
    - {name}{type}
    - AddressEnterView.js
    - QRScannerModal.js
    - ProgressButton.js
- src/constants/
    - .json file
    - strings.js
    - small cap since it is not component
    - redux files move to redux, helper functions move to /util
- src/database/
    - sql.js
- src/screens/
- src/util/
    - firebase/
- src/redux/
- 

Naming convention of each folder should be {Module}{Name}{Type} if possible

### 1. Screens
Screens follow the format of /src/screens/{Name}Screen. For similar items we together by prefix: AlchemyPayScreen, AlchemyRampScreen so they will arranged together. (we can open a folder /Alchemy/PayScreen, but prefer to keep it flat)
- src/screens
    - AlchemyPayScreen
    - AlchemyRampScreen
    - DashboardScreen
    - 

Entry point of each screen should be /index.js. This enable the developer to split out the code in the future:
- DashboardScreen/index.js
- DashboardScreen/functions.js


### 2. Components