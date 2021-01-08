'use strict'

const _get = require('lodash/get')
const _merge = require('lodash/merge')

const Alarm = require('./alarm')

// /////////////////////////////////////////////////

class ServerlessSqsAlarmsPlugin {
  constructor(serverless) {
    this.sls = serverless
    this.hooks = {
      'package:compileEvents': this.beforeDeployResources.bind(this)
    }
  }

  beforeDeployResources() {
    const customSqsAlarms = _get(this.sls, 'service.custom.sqsAlarms', false)
    if (!customSqsAlarms) {
      return
    }
    const region = this.sls.getProvider('aws').getRegion()
    const alarms = customSqsAlarms.map(data => new Alarm(data, region))
    for (const alarm of alarms) {
      const resources = alarm.resources()
      for (const resource of resources) {
        _merge(this.sls.service.provider.compiledCloudFormationTemplate.Resources, resource)
      }
    }
  }
}

// /////////////////////////////////////////////////

module.exports = ServerlessSqsAlarmsPlugin
