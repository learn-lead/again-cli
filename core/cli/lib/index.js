const pkg = require('../package.json')
const log = require('@again-cli/log')
const constant = require('./constant')
const semver = require('semver')
const colors = require('colors/safe')
const userHome = require('user-home')
const pathExists = require('path-exists')
const minimist = require('minimist')
const path = require('path')

let args, config;

async function core() {
    try {
        checkPkgVersion()
        checkNodeVersion()
        checkRoot()
        checkUserHome()
        checkInputArgs()
        checkEnv()
        await checkGlobalUpdate()
    } catch (e) {
        log.error(e.message)
    }
    
}


async function  checkGlobalUpdate() {
    // 1. 获取当前版本号和模块名
    const currentVersion = pkg.version
    const npmName = pkg.name
    const {getNpmInfo, getNpmVersions, getNpmSemverVersion} = require('@again-cli/get-npm-info')
    const lastVersion = await getNpmSemverVersion(currentVersion, npmName)
    if (lastVersion && semver.gt(lastVersion, currentVersion)) {
        log.warn(colors.yellow(`请手动更新${npmName}, 当前版本：${currentVersion}，最新版本：${lastVersion}
        更新命令：npm install -g ${npmName}`))
    }
    console.log(lastVersion)
    // 2. 调用npm api，获取所有版本号
    // 3. 提取所有版本号，比对那些版本号是大于当前版本号
    // 4. 获取最新版本号，提示用户更新到最新
}


function checkEnv() {
    const dotenv = require('dotenv')
    const dotenvPath = path.resolve(userHome, '.env')
    if (pathExists(dotenvPath)) {
        dotenv.config({
            path: dotenvPath
        })
    }
    config = createDefaultConfig()
    log.verbose('环境变量', process.env.CLI_HOME_PATH)
   
}

function createDefaultConfig() {
    const cliConfog = {
        home: userHome
    }

    if (!!process.env.CLI_HOME) {
        cliConfog['cliHome'] = path.join(userHome, process.env.CLI_HOME)
    } else {
        cliConfog['cliHome'] = path.join(userHome, constant.DEFAULT_CLI_HOME)
    }
    process.env.CLI_HOME_PATH = cliConfog.cliHome
}

function checkArgs() {
    if (args.debug) {
        process.env.LOG_LEVEL = 'verbose'
    } else {
        process.env.LOG_LEVEL = 'info'
    }
    log.level = process.env.LOG_LEVEL
}

function checkInputArgs() {
    args = minimist(process.argv.slice(2))
    checkArgs()
}

function checkUserHome() {
    if (!userHome || !pathExists(userHome)) {
        throw new Error(colors.red('当前登录用户主目录不存在'))
    }
}

function checkRoot() {
    const rootCheck = require('root-check')
    rootCheck()
}

function checkPkgVersion() {
    log.notice('cli', pkg.version)
}

function checkNodeVersion() {
    // 获取当前版本号
    const currentVersion = process.version
    // 对比最低版本号
    const lowestVersion = constant.LOWEST_NODE_VERSION
    if (!semver.gte(currentVersion, lowestVersion)) {
        throw new Error(colors.red(`again-cli需要安装${lowestVersion}以上的版本的Node.js`))
    }

}

// semver

module.exports = core