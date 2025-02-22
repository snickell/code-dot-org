import MBFirmataUpdater from '@cdo/apps/maker/boards/microBit/MBFirmataUpdater';
import {
  MICROBIT_FIRMATA_V1_URL,
  MICROBIT_FIRMATA_V2_URL,
  MICROBIT_IDS_V1,
  MICROBIT_IDS_V2,
} from '@cdo/apps/maker/boards/microBit/MicroBitConstants';
import {MicroBitVersion} from '@cdo/apps/maker/boards/microBit/types';
import {
  detectMicroBitVersion,
  getFirmataURLByVersion,
} from '@cdo/apps/maker/boards/microBit/utils';
import microBitReducer, {
  setMicroBitFirmataUpdatePercent,
} from '@cdo/apps/maker/microBitRedux';
import {
  getStore,
  registerReducers,
  stubRedux,
  restoreRedux,
} from '@cdo/apps/redux';

describe('microBit utils functions', () => {
  describe('detectMicroBitVersion function', () => {
    it('returns correct version for micro:bit v1', () => {
      MICROBIT_IDS_V1.forEach(idPrefix => {
        const device = {serialNumber: idPrefix + '1234'};
        const version = detectMicroBitVersion(device);
        expect(version).toBe(MicroBitVersion.V1);
      });
    });

    it('returns correct version for micro:bit v2', () => {
      MICROBIT_IDS_V2.forEach(idPrefix => {
        const device = {serialNumber: idPrefix + '1234'};
        const version = detectMicroBitVersion(device);
        expect(version).toBe(MicroBitVersion.V2);
      });
    });

    it('returns null for device that is not micro:bit', () => {
      const device = {serialNumber: '88001234'};
      const version = detectMicroBitVersion(device);
      expect(version).toBeNull();
    });
  });

  describe('getFirmataURLByVersion function', () => {
    it('returns correct URL for micro:bit v1', () => {
      const URL = getFirmataURLByVersion(MicroBitVersion.V1);
      expect(URL).toBe(MICROBIT_FIRMATA_V1_URL);
    });

    it('returns correct URL for micro:bit v2', () => {
      const URL = getFirmataURLByVersion(MicroBitVersion.V2);
      expect(URL).toBe(MICROBIT_FIRMATA_V2_URL);
    });

    it('throws an error if the micro:bit version is invalid', () => {
      expect(() => getFirmataURLByVersion('v3')).toThrow(
        'micro:bit version is invalid.'
      );
    });
  });
});
describe('MBFirmataUpdater', () => {
  describe('setPercentUpdateComplete function', () => {
    const mbFirmataUpdater = new MBFirmataUpdater();
    beforeEach(() => {
      stubRedux();
      registerReducers({microBit: microBitReducer});
    });

    afterEach(() => {
      restoreRedux();
    });

    it('changes state value appropriately when rounded progress value has changed', () => {
      getStore().dispatch(setMicroBitFirmataUpdatePercent(3));
      mbFirmataUpdater.firmataUpdatePercent = 3;
      mbFirmataUpdater.setPercentUpdateComplete(0.034);
      expect(mbFirmataUpdater.firmataUpdatePercent).toBe(4);
      let percent = getStore().getState().microBit.microBitFirmataUpdatePercent;
      expect(percent).toBe(4);
    });

    it('does not change state value when rounded progress value has not changed', () => {
      getStore().dispatch(setMicroBitFirmataUpdatePercent(4));
      mbFirmataUpdater.firmataUpdatePercent = 4;
      mbFirmataUpdater.setPercentUpdateComplete(0.034);
      expect(mbFirmataUpdater.firmataUpdatePercent).toBe(4);
      let percent = getStore().getState().microBit.microBitFirmataUpdatePercent;
      expect(percent).toBe(4);
    });
  });
});
