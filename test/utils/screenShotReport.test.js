import { describe, it, expect } from 'vitest'
import { generateReport } from '../../src/utils/screenShotReport.js'

describe('generateReport', () => {
  it('should generate HTML with screenshot items', () => {
    const items = [
      {
        backupDateString: '6/17/2026, 10:00:00 AM',
        textMessage: 'test screenshot',
        screenShotData: 'data:image/webp;base64,abc123'
      }
    ]

    const html = generateReport(items)

    expect(html).toContain('6/17/2026, 10:00:00 AM')
    expect(html).toContain('test screenshot')
    expect(html).toContain('data:image/webp;base64,abc123')
    expect(html).toContain('<table>')
    expect(html).toContain('</table>')
    expect(html).toContain('Screenshot backup - Report')
  })

  it('should return valid HTML with empty list', () => {
    const html = generateReport([])
    expect(html).toContain('<table>')
    expect(html).toContain('</table>')
    expect(html).toContain('Screenshot backup - Report')
  })

  it('should include footer with geduma link', () => {
    const html = generateReport([])
    expect(html).toContain('geduma.com')
    expect(html).toContain('</footer>')
  })
})
