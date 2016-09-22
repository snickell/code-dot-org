import { expect } from '../../util/configuredChai';
import { validateFirebaseKey } from '@cdo/apps/applab/firebaseUtils';

describe('firebaseUtils', () => {
  describe('validateFirebaseKey', () => {
    it('allows alphanumeric strings with spaces', () => {
      validateFirebaseKey('foo BAR 123');
    });

    it('allows keys of length 768', () => {
      validateFirebaseKey('a'.repeat(768));
    });

    it('rejects keys of length 769', done => {
      try {
        validateFirebaseKey('b'.repeat(769));
      } catch (e) {
        expect(e.message.toLowerCase()).to.contain('too long');
        done();
      }
    });

    it('rejects forbidden symbols', done => {
      try {
        validateFirebaseKey('a.b');
      } catch (e) {
        expect(e.message.toLowerCase()).to.contain('illegal character "."');
        done();
      }
    });

    it('rejects ascii control codes', done => {
      try {
        validateFirebaseKey('\n');
      } catch (e) {
        expect(e.message.toLowerCase()).to.contain('illegal character code');
        done();
      }
    });

    it('allows unicode', () => {
      validateFirebaseKey('☃');
    });
  });
});
