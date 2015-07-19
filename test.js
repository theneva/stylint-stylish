/*global describe, it, beforeEach */

import assert from 'assert'
import chalk from 'chalk'
import stylint from 'stylint'
import path from 'path'
import clone from 'lodash.clonedeep'
import origCache from 'stylint/src/core/cache'
import origState from 'stylint/src/core/state'

const stylintInstance = stylint().create()

describe('stylint-stylish', () => {
  beforeEach(() => {
    stylintInstance.state = clone(origState)
    stylintInstance.cache = clone(origCache)

    stylintInstance.state.quiet = true
    stylintInstance.state.watching = true
    stylintInstance.state.strictMode = false
    stylintInstance.config.reporter = require.resolve('./src')

    stylintInstance.init()
  })

  it('should report if all green', () => {
    var report = stylintInstance.reporter('meh', 'done').msg

    assert.equal(`Stylint: You're all clear!`, report)
  })

  it('should report violations', () => {
    stylintInstance.cache.file = path.resolve('file.styl')
    stylintInstance.cache.lineNo = 15
    stylintInstance.cache.errs = [ '', '' ]
    stylintInstance.cache.warnings = [ '' ]
    stylintInstance.state.severity = ''
    stylintInstance.reporter('woop')
    stylintInstance.cache.lineNo = 10
    stylintInstance.state.severity = 'Warning'
    stylintInstance.reporter('dee')
    stylintInstance.cache.file = 'meep.styl'
    stylintInstance.cache.lineNo = 15
    stylintInstance.state.severity = ''
    stylintInstance.reporter('doo')

    var report = stylintInstance.reporter('meh', 'done').msg

    report = chalk.stripColor(report).split('\n')

    assert.equal(report.length, 8)
    assert.equal(report[0], 'file.styl:')
    assert.equal(report[1].trim(), 'line 15:  woop')
    assert.equal(report[2].trim(), 'line 10:  dee')
    assert.equal(report[3], 'meep.styl:')
    assert.equal(report[4].trim(), 'line 15:  doo')
    assert.equal(report[5], '\t✖  2 errors')
    assert.equal(report[6], '\t⚠  1 warning')
    assert.equal(report[7], '')
  })

  it('should report violations with absolute path', () => {
    stylintInstance.config.reporterOptions = {absolutePath: true}
    stylintInstance.cache.file = path.resolve('file.styl')
    stylintInstance.cache.lineNo = 15
    stylintInstance.cache.warnings = [ '' ]
    stylintInstance.state.severity = ''
    stylintInstance.reporter('woop')

    var report = stylintInstance.reporter('meh', 'done').msg

    report = chalk.stripColor(report).split('\n')

    assert.equal(report.length, 4)
    assert.equal(report[0], `${process.cwd()}/file.styl:`)
    assert.equal(report[1].trim(), 'line 15:  woop')
    assert.equal(report[2], '\t⚠  1 warning')
    assert.equal(report[3], '')
  })
})
