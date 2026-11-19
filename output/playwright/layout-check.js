async (page) => {
  const report = [];
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    report.push(await page.evaluate(() => ({
      width: innerWidth,
      pageWidth: document.documentElement.scrollWidth,
      overflow: [...document.querySelectorAll('main *')]
        .filter(el => el.getBoundingClientRect().right > innerWidth + 1 && getComputedStyle(el).position !== 'absolute')
        .map(el => el.className).slice(0, 6)
    })));
  }
  return report;
}
