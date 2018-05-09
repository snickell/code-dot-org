require 'test_helper'

class EmailPreferenceTest < ActiveSupport::TestCase
  test "create email preference with valid attributes creates email preference" do
    assert_creates EmailPreference do
      create :email_preference,
        email: 'test_valid@example.net',
        opt_in: true,
        ip_address: '1.1.1.1',
        source: EmailPreference::REGISTRATION,
        form_kind: nil
    end
  end

  test "create email preference with invalid attributes does not create" do
    email_preference = EmailPreference.new
    assert_does_not_create EmailPreference do
      email_preference.update(email: 'amidala@naboo', source: 'This is not a love song.')
    end
    assert_includes email_preference.errors.full_messages, "Email does not appear to be a valid e-mail address"
    assert_includes email_preference.errors.full_messages, "Opt in is not included in the list"
    assert_includes email_preference.errors.full_messages, "Source is not included in the list"
    assert_includes email_preference.errors.full_messages, "Ip address is required"
  end

  test "upsert email preference changes existing email preference" do
    email_preference = create :email_preference
    EmailPreference.upsert!(
      email: email_preference.email,
      opt_in: true,
      ip_address: '192.168.1.1',
      source: EmailPreference::HOUR_OF_CODE_FORM,
      form_kind: 'form text version 2.71828'
    )
    email_preference.reload
    assert_equal email_preference.opt_in, true
    assert_equal email_preference.ip_address, '192.168.1.1'
    assert_equal email_preference.source, 'Host Hour of Code form'
    assert_equal email_preference.form_kind, 'form text version 2.71828'
  end

  test "upsert email preference that is already opted in does not opt out" do
    email_preference = create :email_preference, opt_in: true
    EmailPreference.upsert!(
      email: email_preference.email,
      opt_in: false,
      ip_address: '172.16.6.1',
      source: EmailPreference::REGISTRATION,
      form_kind: 'form text version 3.14159'
    )
    email_preference.reload
    assert_equal email_preference.opt_in, true
  end
end
