'use strict';
const axios = require('axios')
const urlJoin = require('url-join')
const semver = require('semver')

function getNpmInfo(npmName, registry) {
    // TODO
    if (!npmName) return
    registry = registry || getDefaultRegistry()
    const npmInfoUrl = urlJoin(registry, npmName)
    return axios.get(npmInfoUrl).then(response => {
        if (response.status === 200) {
            return response.data
        }
        return null
    }).catch(err => {
        Promise.reject(err)
    })
}

async function getNpmVersions(npmName, registry) {
    const data = await getNpmInfo(npmName, registry)
    if (data) {
        return Object.keys(data.versions)
    } else {
        return []
    }
}

function getNpmSemverVersions(baseVersion, versions) {
    return versions
        .filter(version => semver.satisfies(version, `^${baseVersion}`))
        .sort((a, b) => semver.gt(b, a))
}


function getDefaultRegistry(isOriginal = false) {
    return isOriginal ? 'https://registry.npmjs.org' : 'https://registry.npm.taobao.org'
}

async function getNpmSemverVersion (baseVersion, npmName, registry, ) {
    const versions = await getNpmVersions(npmName, registry)
    const newVersions = getNpmSemverVersions(baseVersion, versions) 
    if (newVersions && newVersions.length > 0) {
        return newVersions[0]
    }
}


module.exports = {
    getNpmInfo,
    getNpmVersions,
    getNpmSemverVersions,
    getNpmSemverVersion
};