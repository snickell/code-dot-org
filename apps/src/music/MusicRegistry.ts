import AnalyticsReporter from './analytics/AnalyticsReporter';
import MusicPlayer from './player/MusicPlayer';

/**
 * This singleton holds some references to values that are currently
 * stored in React/Redux state (in MusicView), so that React code
 * related to Blockly blocks (outside of our main React tree) can access them.
 */
class MusicRegistry {
  private playerRef: MusicPlayer | null = null;
  private analyticsReporterRef: AnalyticsReporter | null = null;

  public showSoundFilters: boolean = false;
  public hideAiTemperature: boolean = false;
  public showAiTemperatureExplanation: boolean = false;
  public showAiGenerateAgainHelp: boolean = false;

  public get player(): MusicPlayer {
    if (!this.playerRef) {
      throw new Error('MusicPlayer not set in MusicRegistry');
    }
    return this.playerRef;
  }

  public set player(player: MusicPlayer) {
    this.playerRef = player;
  }

  public get analyticsReporter(): AnalyticsReporter {
    if (!this.analyticsReporterRef) {
      throw new Error('AnalyticsReporter not set in MusicRegistry');
    }
    return this.analyticsReporterRef;
  }

  public set analyticsReporter(analyticsReporter: AnalyticsReporter) {
    this.analyticsReporterRef = analyticsReporter;
  }
}

export default new MusicRegistry();
