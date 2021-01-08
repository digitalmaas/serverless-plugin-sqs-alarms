'use strict'

jest.mock('../lib/simple-hash', () => jest.fn().mockReturnValue('FAKE'))
const Plugin = require('../lib')

// /////////////////////////////////

function generateBasicConfig(sqsAlarms) {
  return {
    getProvider: () => ({ getRegion: () => 'test-region' }),
    service: {
      custom: { sqsAlarms },
      provider: { compiledCloudFormationTemplate: { Resources: {} } }
    }
  }
}

// /////////////////////////////////

describe('index.js', () => {
  it('creates CloudFormation configuration, with default values', () => {
    const config = generateBasicConfig([{ queue: 'test', topic: 'test-topic', thresholds: [2, 3] }])
    const test = new Plugin(config)
    test.beforeDeployResources()
    const data = config.service.provider.compiledCloudFormationTemplate.Resources
    expect(data).toHaveProperty('TestThreshold3HashFAKESqsAlarm')
    expect(data).toHaveProperty('TestThreshold3HashFAKESqsAlarm.Type', 'AWS::CloudWatch::Alarm')
    expect(data).toHaveProperty('TestThreshold3HashFAKESqsAlarm.Properties', expect.any(Object))
    expect(data).toHaveProperty('TestThreshold3HashFAKESqsAlarm.Properties.Threshold', 3)
    expect(data).toHaveProperty('TestThreshold3HashFAKESqsAlarm.Properties.EvaluationPeriods', 1)
    expect(data).toHaveProperty('TestThreshold3HashFAKESqsAlarm.Properties.Period', 60)
    expect(data).toHaveProperty(
      'TestThreshold3HashFAKESqsAlarm.Properties.AlarmDescription',
      'Alarm if queue contains more than 3 messages'
    )
    expect(data).toHaveProperty('TestThreshold2HashFAKESqsAlarm')
    expect(data).toHaveProperty('TestThreshold2HashFAKESqsAlarm.Type', 'AWS::CloudWatch::Alarm')
    expect(data).toHaveProperty('TestThreshold2HashFAKESqsAlarm.Properties', expect.any(Object))
    expect(data).toHaveProperty('TestThreshold2HashFAKESqsAlarm.Properties.Threshold', 2)
    expect(data).toHaveProperty('TestThreshold2HashFAKESqsAlarm.Properties.EvaluationPeriods', 1)
    expect(data).toHaveProperty('TestThreshold2HashFAKESqsAlarm.Properties.Period', 60)
    expect(data).toHaveProperty(
      'TestThreshold2HashFAKESqsAlarm.Properties.AlarmDescription',
      'Alarm if queue contains more than 2 messages'
    )
  })

  describe('alarm name', () => {
    it('adds to CloudFormation configuration if provided', () => {
      const config = generateBasicConfig([
        { name: 'alarm', queue: 'test-queue', topic: 'test-topic', thresholds: [1, 2, 3] }
      ])
      const test = new Plugin(config)
      test.beforeDeployResources()
      const data = config.service.provider.compiledCloudFormationTemplate.Resources
      expect(data).toHaveProperty(
        'AlarmThreshold3HashFAKESqsAlarm.Properties.AlarmName',
        'alarm (3) (FAKE)'
      )
    })

    it('uses queue if not provided', () => {
      const config = generateBasicConfig([
        { queue: 'test-queue', topic: 'test-topic', thresholds: [1, 2, 3] }
      ])
      const test = new Plugin(config)
      test.beforeDeployResources()
      const data = config.service.provider.compiledCloudFormationTemplate.Resources
      expect(Object.keys(data)).toHaveLength(3)
      expect(data).not.toHaveProperty('AlarmThreshold3HashFAKESqsAlarm.Properties.AlarmName')
    })
  })

  it('creates alarms for multiple queues', () => {
    const config = generateBasicConfig([
      { queue: 'test-queue', topic: 'test-topic', thresholds: [1, 2] },
      { queue: 'test-queue-2', topic: 'test-topic', thresholds: [1, 2] }
    ])
    const test = new Plugin(config)
    test.beforeDeployResources()
    const data = config.service.provider.compiledCloudFormationTemplate.Resources
    expect(data).toHaveProperty('TestQueueThreshold1HashFAKESqsAlarm')
    expect(data).toHaveProperty('TestQueueThreshold2HashFAKESqsAlarm')
    expect(data).toHaveProperty('TestQueue2Threshold1HashFAKESqsAlarm')
    expect(data).toHaveProperty('TestQueue2Threshold2HashFAKESqsAlarm')
  })

  it('does not fail without configuration (no custom)', () => {
    const config = generateBasicConfig()
    config.service.custom = undefined
    const test = new Plugin(config)
    test.beforeDeployResources()
    const data = config.service.provider.compiledCloudFormationTemplate.Resources
    expect(Object.keys(data)).toHaveLength(0)
  })

  it('does not fail without configuration (no sqsAlarms)', () => {
    const config = generateBasicConfig()
    const test = new Plugin(config)
    test.beforeDeployResources()
    const data = config.service.provider.compiledCloudFormationTemplate.Resources
    expect(data).not.toHaveProperty('testqueueMessageAlarm3')
  })

  describe('treatMissingData', () => {
    it('should add alarm without property if missing', () => {
      const config = generateBasicConfig([
        { queue: 'test-queue', topic: 'test-topic', thresholds: [2, 3] }
      ])
      const test = new Plugin(config)
      test.beforeDeployResources()
      const data = config.service.provider.compiledCloudFormationTemplate.Resources
      expect(data).not.toHaveProperty(
        'TestQueueThreshold2HashFAKESqsAlarm.Properties.TreatMissingData'
      )
      expect(data).not.toHaveProperty(
        'TestQueueThreshold3HashFAKESqsAlarm.Properties.TreatMissingData'
      )
    })

    it('should correctly set for all alarms', () => {
      const config = generateBasicConfig([
        { treatMissingData: 'notBreaching', queue: 'MyQueue', topic: 'A', thresholds: [1, 2] }
      ])
      const test = new Plugin(config)
      test.beforeDeployResources()
      const data = config.service.provider.compiledCloudFormationTemplate.Resources
      expect(data).toHaveProperty(
        'MyQueueThreshold1HashFAKESqsAlarm.Properties.TreatMissingData',
        'notBreaching'
      )
      expect(data).toHaveProperty(
        'MyQueueThreshold1HashFAKESqsAlarm.Properties.TreatMissingData',
        'notBreaching'
      )
    })

    it('should raise if invalid', () => {
      const config = generateBasicConfig([
        { treatMissingData: 'invalid', queue: 'MyQueue', topic: 'A', thresholds: [2, 5] }
      ])
      const test = new Plugin(config)
      expect(() => test.beforeDeployResources()).toThrow(TypeError)
    })

    it('should override with threshold config', () => {
      const config = generateBasicConfig([
        {
          treatMissingData: 'breaching',
          queue: 'MyQueue',
          topic: 'A',
          thresholds: [{ value: 2, treatMissingData: 'ignore' }, 5]
        }
      ])
      const test = new Plugin(config)
      test.beforeDeployResources()
      const data = config.service.provider.compiledCloudFormationTemplate.Resources
      expect(data).toHaveProperty(
        'MyQueueThreshold2HashFAKESqsAlarm.Properties.TreatMissingData',
        'ignore'
      )
      expect(data).toHaveProperty(
        'MyQueueThreshold5HashFAKESqsAlarm.Properties.TreatMissingData',
        'breaching'
      )
    })
  })

  it('should properly create custom thresholds', () => {
    const config = generateBasicConfig([
      {
        treatMissingData: 'breaching',
        name: 'A',
        queue: 'MyQueue',
        topic: 'topic-name',
        period: 300,
        thresholds: [
          { value: 2, period: 600 },
          { value: 4, evaluationPeriods: 100 },
          { value: 6 },
          8
        ]
      }
    ])
    const test = new Plugin(config)
    test.beforeDeployResources()
    const data = config.service.provider.compiledCloudFormationTemplate.Resources
    expect(data).toHaveProperty('AThreshold2HashFAKESqsAlarm.Type', 'AWS::CloudWatch::Alarm')
    expect(data).toHaveProperty('AThreshold2HashFAKESqsAlarm.Properties.Period', 600)
    expect(data).toHaveProperty('AThreshold2HashFAKESqsAlarm.Properties.EvaluationPeriods', 1)
    expect(data).toHaveProperty('AThreshold4HashFAKESqsAlarm.Type', 'AWS::CloudWatch::Alarm')
    expect(data).toHaveProperty('AThreshold4HashFAKESqsAlarm.Properties.Period', 300)
    expect(data).toHaveProperty('AThreshold4HashFAKESqsAlarm.Properties.EvaluationPeriods', 100)
    expect(data).toHaveProperty('AThreshold6HashFAKESqsAlarm.Type', 'AWS::CloudWatch::Alarm')
    expect(data).toHaveProperty('AThreshold6HashFAKESqsAlarm.Properties.Period', 300)
    expect(data).toHaveProperty('AThreshold6HashFAKESqsAlarm.Properties.EvaluationPeriods', 1)
    expect(data).toHaveProperty('AThreshold8HashFAKESqsAlarm.Type', 'AWS::CloudWatch::Alarm')
    expect(data).toHaveProperty('AThreshold8HashFAKESqsAlarm.Properties.Period', 300)
    expect(data).toHaveProperty('AThreshold8HashFAKESqsAlarm.Properties.EvaluationPeriods', 1)
  })
})
