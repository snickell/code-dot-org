// .storybook/test-runner.ts
import {getStoryContext, TestRunnerConfig, waitForPageReady} from '@storybook/test-runner';
import { toMatchImageSnapshot } from 'jest-image-snapshot';


const customSnapshotsDir = `${process.cwd()}/__snapshots__`;

const config: TestRunnerConfig = {
    setup() {
        expect.extend({ toMatchImageSnapshot });
    },
    async postVisit(page, context) {
        await page.waitForLoadState('domcontentloaded');
        await page.waitForLoadState('load');
        await page.waitForFunction(() => document.readyState === 'complete');
        await page.waitForFunction(() => document.fonts.ready);
        // the #storybook-root element wraps the story. In Storybook 6.x, the selector is #root
        // DOM Snapshot
        const storyContext = await getStoryContext(page, context)
        const browserContext = page.context().browser();
        const image = await page.screenshot({
            animations: "disabled",
        });
        const currentBrowser = browserContext!.browserType().name()
        expect(image).toMatchImageSnapshot({
            customSnapshotsDir: `${process.cwd()}/__snapshots__/${storyContext.componentId}`,
            customSnapshotIdentifier: `${currentBrowser}--${context.id}`,
        });
        },
};
export default config;