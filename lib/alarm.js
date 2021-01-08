'use strict'

const _flow = require('lodash/flow')
const _camelCase = require('lodash/camelCase')
const _upperFirst = require('lodash/upperFirst')
const _pascalCase = _flow(_camelCase, _upperFirst)

const simpleHash = require('./simple-hash')
const TREATMENTS = ['missing', 'ignore', 'breaching', 'notBreaching']

// /////////////////////////////////////////////////

class Alarm {
  constructor(alarm, region) {
    this.topic = alarm.topic
    this.region = region
    this.thresholds = alarm.thresholds
    this.treatMissingData = alarm.treatMissingData
    this.period = alarm.period
    this.evaluationPeriod = alarm.evaluationPeriod
    this.name = alarm.name
    this.hash = simpleHash(12)
    if (!this.thresholds || !Array.isArray(this.thresholds) || this.thresholds.length === 0) {
      throw new TypeError('at least one item is needed in "thresholds"')
    }
    this.queue = alarm.queue
    if (!this.name) {
      if (typeof this.queue === 'string') {
        this.name = this.queue
      } else {
        throw new TypeError('"queue" must be string or "name" must be specified')
      }
    }
  }

  formatAlarmName(value) {
    return `${_pascalCase(this.name)}Threshold${value}Hash${this.hash}SqsAlarm`
  }

  validateTreatMissingData(treatment) {
    if (!TREATMENTS.includes(treatment)) {
      throw new TypeError('treatment value must be one or more of:', TREATMENTS)
    }
    return treatment
  }

  resourceProperties(value) {
    return typeof value === 'object' ? value : { value }
  }

  topicValue(topic = this.topic) {
    if (typeof topic === 'object') {
      return topic
    }
    if (typeof topic === 'string') {
      if (topic.startsWith('arn:aws:sns')) {
        return topic
      }
      return {
        'Fn::Join': [':', ['arn:aws:sns', this.region, { Ref: 'AWS::AccountId' }, this.topic]]
      }
    }
    throw new TypeError('invalid alarm topic name')
  }

  resources() {
    return this.thresholds.map(data => {
      const props = this.resourceProperties(data)
      const formattedName = this.formatAlarmName(props.value)
      const topicValue = this.topicValue()
      const output = {
        [formattedName]: {
          Type: 'AWS::CloudWatch::Alarm',
          Properties: {
            AlarmName: `${this.name} (${props.value}) (${this.hash})`,
            AlarmDescription: `Alarm if queue contains more than ${props.value} messages`,
            ComparisonOperator: 'GreaterThanOrEqualToThreshold',
            MetricName: 'ApproximateNumberOfMessagesVisible',
            Statistic: 'Sum',
            Namespace: 'AWS/SQS',
            Period: props.period || this.period || 60,
            EvaluationPeriods: props.evaluationPeriods || this.evaluationPeriod || 1,
            Threshold: props.value,
            AlarmActions: [topicValue],
            OKActions: [topicValue],
            Dimensions: [
              {
                Name: 'QueueName',
                Value: this.queue
              }
            ]
          }
        }
      }
      if (props.treatMissingData) {
        const value = this.validateTreatMissingData(props.treatMissingData)
        output[formattedName].Properties.TreatMissingData = value
      } else if (this.treatMissingData) {
        const value = this.validateTreatMissingData(this.treatMissingData)
        output[formattedName].Properties.TreatMissingData = value
      }
      return output
    })
  }
}

// /////////////////////////////////////////////////

module.exports = Alarm
